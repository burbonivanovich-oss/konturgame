# Game Studios sub-agents

49 specialized agents organized into three tiers (directors / department leads /
specialists), imported from
[Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)
under MIT license.

The agents are role-based — `creative-director`, `economy-designer`,
`game-designer`, `ux-designer`, `qa-tester`, `narrative-director`,
`technical-director`, etc. — and meant to be invoked when a task matches the
role description.

For our project (a small business sim built in React/TypeScript) the most
relevant subset:
- `creative-director`, `game-designer`, `systems-designer` — for vision /
  mechanic decisions
- `economy-designer` — balance audits, resource flow checks
- `ux-designer`, `accessibility-specialist` — UI/UX review
- `narrative-director`, `writer` — for NPC arcs, dialog
- `qa-tester`, `qa-lead` — playtest reports, bug triage
- `gameplay-programmer`, `ui-programmer` — code-level work

Engine-specific specialists (godot/unity/unreal) don't apply here but are kept
for completeness — feel free to delete them if they clutter agent picking.

Some frontmatter fields (`maxTurns`, `memory`, `disallowedTools`, `skills`) are
non-standard for Claude Code and will be ignored — only `name`, `description`,
`tools`, `model` are used by the agent picker.
