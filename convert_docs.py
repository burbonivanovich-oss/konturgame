#!/usr/bin/env python3
"""
Convert DOCX game design documents to Markdown.
Handles font-based heading detection, code blocks, lists, tables, and special characters.
"""

import os
import sys
from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph


def iter_block_items(parent):
    """Yield both paragraphs and tables from document body."""
    for child in parent.element.body:
        if child.tag == qn('w:p'):
            yield Paragraph(child, parent)
        elif child.tag == qn('w:tbl'):
            yield Table(child, parent)


def build_num_maps(doc):
    """Extract numId->abstractNumId and abstractNumId->level->format mappings."""
    ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    num_map = {}
    abs_map = {}

    try:
        numbering_xml = doc.part.numbering_part._element
    except AttributeError:
        return num_map, abs_map

    for num_el in numbering_xml.findall(f'{{{ns}}}num'):
        nid = num_el.get(f'{{{ns}}}numId')
        ref = num_el.find(f'{{{ns}}}abstractNumId')
        if ref is not None:
            num_map[nid] = ref.get(f'{{{ns}}}val')

    for abs_el in numbering_xml.findall(f'{{{ns}}}abstractNum'):
        aid = abs_el.get(f'{{{ns}}}abstractNumId')
        abs_map[aid] = {}
        for lvl in abs_el.findall(f'{{{ns}}}lvl'):
            ilvl = lvl.get(f'{{{ns}}}ilvlId') or lvl.get(f'{{{ns}}}ilvl')
            fmt_el = lvl.find(f'{{{ns}}}numFmt')
            if fmt_el is not None:
                fmt_val = fmt_el.get(f'{{{ns}}}val')
                abs_map[aid][ilvl] = fmt_val

    return num_map, abs_map


def classify_paragraph(para, num_map, abs_map):
    """Classify paragraph by visual properties and return (kind, metadata)."""
    ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    runs = para.runs
    text = para.text

    if not runs or not text.strip():
        return 'empty', {}

    r0 = runs[0]

    # Check for list item first (takes priority over heading detection)
    numPr = para._element.find(f'.//{{{ns}}}numPr')
    if numPr is not None:
        ilvl_el = numPr.find(f'{{{ns}}}ilvl')
        numId_el = numPr.find(f'{{{ns}}}numId')
        level = int(ilvl_el.get(f'{{{ns}}}val', '0')) if ilvl_el is not None else 0
        nid = numId_el.get(f'{{{ns}}}val', '1') if numId_el is not None else '1'
        aid = num_map.get(nid, '0')
        fmt = abs_map.get(aid, {}).get(str(level), 'bullet')
        return 'list', {'level': level, 'fmt': fmt}

    # Code block: all runs are Menlo font
    if r0.font.name == 'Menlo':
        # Sentinel check: text 'text' in Menlo size 114300
        if text.strip() == 'text' and r0.font.size in (114300, None):
            return 'sentinel', {}
        return 'code', {}

    # Heading detection by Segoe UI bold + font size
    if r0.bold and r0.font.name == 'Segoe UI':
        size = r0.font.size
        if size == 228600:
            return 'h1', {}
        elif size == 209550:
            return 'h2', {}
        elif size == 190500:
            return 'h3', {}
        else:
            return 'bold_normal', {}

    # Bold non-heading
    if r0.bold:
        return 'bold_normal', {}

    return 'normal', {}


def render_runs(para):
    """Convert paragraph runs to Markdown inline text."""
    result = ''
    i = 0
    runs = para.runs

    while i < len(runs):
        r = runs[i]
        text = r.text.replace('\xa0', ' ')

        if not text:
            i += 1
            continue

        # Soft return (\n in run) -> two-space line break
        if text == '\n':
            result += '  \n'
            i += 1
            continue

        # Inline code (consecutive Menlo runs)
        if r.font.name == 'Menlo':
            code_text = ''
            while i < len(runs) and runs[i].font.name == 'Menlo':
                code_text += runs[i].text.replace('\xa0', ' ')
                i += 1
            result += f'`{code_text}`'
            continue

        # Bold (consecutive bold runs)
        if r.bold:
            bold_text = ''
            while i < len(runs) and runs[i].bold and runs[i].font.name != 'Menlo':
                bold_text += runs[i].text.replace('\xa0', ' ')
                i += 1
            result += f'**{bold_text}**'
            continue

        result += text
        i += 1

    return result


def render_table(table):
    """Convert docx Table to GFM Markdown table."""
    lines = []
    for row_idx, row in enumerate(table.rows):
        cells = []
        for cell in row.cells:
            cell_paras = []
            for p in cell.paragraphs:
                text = p.text.strip()
                if text:
                    # Escape pipe characters
                    text = text.replace('\n', ' ').replace('|', '\\|')
                    cell_paras.append(text)
            cells.append(' '.join(cell_paras))

        line = '| ' + ' | '.join(cells) + ' |'
        lines.append(line)

        # Add separator row after header
        if row_idx == 0:
            sep = '| ' + ' | '.join(['---'] * len(row.cells)) + ' |'
            lines.append(sep)

    return '\n'.join(lines)


def convert_doc(fpath):
    """Convert a single DOCX file to Markdown string."""
    doc = Document(fpath)
    num_map, abs_map = build_num_maps(doc)
    items = list(iter_block_items(doc))

    lines = []
    in_code = False

    # Check if document has H1
    has_h1 = False
    for item in items:
        if isinstance(item, Paragraph):
            kind, _ = classify_paragraph(item, num_map, abs_map)
            if kind == 'h1':
                has_h1 = True
                break

    # Add synthetic H1 if missing
    if not has_h1:
        fname = os.path.splitext(os.path.basename(fpath))[0]
        lines.append(f'# {fname}')
        lines.append('')

    for item in items:
        if isinstance(item, Table):
            # Close open code block
            if in_code:
                lines.append('```')
                lines.append('')
                in_code = False

            lines.append('')
            lines.append(render_table(item))
            lines.append('')
            continue

        # It's a Paragraph
        kind, meta = classify_paragraph(item, num_map, abs_map)

        if kind == 'sentinel':
            continue

        if kind == 'code':
            if not in_code:
                lines.append('```')
                in_code = True
            code_line = item.text.replace('\xa0', ' ')
            lines.append(code_line)
            continue

        # Non-code paragraph: close code block
        if in_code:
            lines.append('```')
            lines.append('')
            in_code = False

        if kind == 'empty':
            if lines and lines[-1] != '':
                lines.append('')
            continue

        if kind == 'h1':
            lines.append(f'# {render_runs(item)}')
        elif kind == 'h2':
            lines.append(f'## {render_runs(item)}')
        elif kind == 'h3':
            lines.append(f'### {render_runs(item)}')
        elif kind == 'bold_normal':
            rendered = render_runs(item)
            lines.append(rendered)
        elif kind == 'list':
            level = meta['level']
            fmt = meta['fmt']
            indent = '  ' * level
            marker = '1.' if fmt == 'decimal' else '-'
            rendered = render_runs(item)
            lines.append(f'{indent}{marker} {rendered}')
        else:  # normal
            lines.append(render_runs(item))

        lines.append('')

    # Close final code block if needed
    if in_code:
        lines.append('```')

    return '\n'.join(lines)


def main():
    """Main conversion loop for all DOCX files."""
    docx_dir = '/home/user/konturgame'

    # Use os.listdir to preserve filesystem encoding (NFD for Библиотека событий.docx)
    docx_files = [f for f in os.listdir(docx_dir) if f.endswith('.docx')]
    docx_files.sort()

    if not docx_files:
        print('No .docx files found.')
        return

    print(f'Converting {len(docx_files)} documents...\n')

    for fname in docx_files:
        fpath = os.path.join(docx_dir, fname)
        md_fname = fname[:-5] + '.md'
        md_fpath = os.path.join(docx_dir, md_fname)

        try:
            md_content = convert_doc(fpath)
            with open(md_fpath, 'w', encoding='utf-8') as f:
                f.write(md_content)
            print(f'✓ {fname} -> {md_fname}')
        except Exception as e:
            print(f'✗ {fname}: {e}', file=sys.stderr)

    print(f'\nDone.')


if __name__ == '__main__':
    main()
