# Audio Direction — «Бизнес с Контуром»

**Дата:** 2026-05-07
**Аудитор:** Audio Director
**Статус:** Greenfield — аудио в проекте отсутствует полностью (нет *.mp3 / *.ogg / *.wav,
нет Audio API вызовов в src/).

---

## 0. Исходное состояние

```
Результат поиска:
  *.mp3 / *.ogg / *.wav  — 0 файлов
  *audio* / *sound* / *music* — 0 файлов
  new Audio / HTMLAudio / Howler — 0 вхождений в src/
```

Игра существует в полной тишине. Это одновременно проблема и чистый лист —
можно спроектировать систему без legacy-долга.

---

## 1. Sonic Identity

### 1.1 Контекст и целевая аудитория

«Бизнес с Контуром» — браузерный маркетинговый симулятор. Игрок: российский
предприниматель МСБ (магазин, кафе, салон). Сессия: 10–40 минут. Среда:
рабочее место / дома / мобильный. Вероятность использования наушников: низкая
на desktop, средняя на мобильном.

Из нарративного аудита (05-narrative-director.md) и creative director (01):
игра имеет три тональных слоя, которые нужно поддержать звуком:
- **Слой 1:** холодная панель B2B-инструмента (Kontур-бренд, доверие)
- **Слой 2:** дружелюбный казуальный сим (эмодзи-язык, карточки бизнеса)
- **Слой 3:** тёплый локальный нарратив (Тамара, Катя, Гена — «дворовая» Россия)

Слой 3 — носитель уникальности. Аудио должно прежде всего служить ему.

### 1.2 Ключевое решение: Sonic Identity

**«Рабочий джаз в соседней комнате»**

Образ: маленькое кафе или магазин в будний день. Слышно негромкую живую
музыку через стену, звонок кассы, шаги клиентов. Хозяин занят делом —
музыка не требует его внимания, но создаёт атмосферу места.

**Инструментальная палитра (основа):**
- Акустическая гитара (fingerpicking, не strumming) — тепло без навязчивости
- Пианино (Rhodes или акустика) — корпоративная нотка без холодности
- Контрабас (pizzicato) — ритмичность без ударных
- Лёгкий джазовый brushed kit — только на высоко-интенсивных состояниях
- Глокеншпиль / маримба — редкие акценты (достижения, разблокировки)

**Чего нет:**
- Оркестровые свеллы
- Электронные синтезаторы (не в образе МСБ России)
- Тяжёлые ударные
- Корпоративный ambient (Elevator music)

**Темп:** 85–100 BPM для игрового лупа. 120+ BPM для кризисных состояний.

**Тон:** минор с мажорными разрешениями. Лёгкая меланхолия — это реализм,
а не депрессия. Победа звучит как облегчение, а не триумф.

**Референсные треки (стиль, не лицензия):**
- Yann Tiersen «La Noyée» (тепло, минимализм)
- Vince Guaraldi Trio «Linus and Lucy» (джаз, позитив, уместен в казуальном
  контексте)
- Gustavo Santaolalla (аккустика, пространство, нарратив)
- Олег Каравайчук (русская тема, нестандартность, подлинность)

---

## 2. Music Cues

### 2.1 Схема состояний

```
BACKSTORY_SCREEN
    ↓
BUSINESS_SELECT     ← mus_menu_select_loop.ogg
    ↓
GAME_WEEK_IDLE      ← mus_game_weekday_{shop|cafe|salon}_loop.ogg
    ↓ событие
GAME_EVENT_NEUTRAL  ← mus_game_event_neutral_loop.ogg (ducking основного)
    ↓ кризис
GAME_EVENT_CRISIS   ← mus_game_crisis_loop.ogg
    ↓ неделя
WEEK_RESULTS        ← mus_game_weekresult_positive/negative_sting.ogg
    ↓ финал
VICTORY             ← mus_end_victory_sting.ogg
DEFEAT              ← mus_end_defeat_sting.ogg
```

### 2.2 Детальное описание каждого cue

#### mus_menu_backstory_loop
- **Экран:** BackstoryScreen (выбор предыстории и личной цели)
- **Образ:** тихая комната перед открытием магазина — ещё нет клиентов, только
  человек с чашкой кофе и своими мыслями
- **Инструменты:** акустическая гитара соло (fingerpicking)
- **Темп:** 72 BPM, размер 3/4
- **Длина лупа:** 60 сек
- **LUFS target:** -24 LUFS (очень тихо, почти атмосфера)
- **Эмоция:** anticipation, тихая надежда

#### mus_menu_select_loop
- **Экран:** BusinessSelector
- **Образ:** утро, магазин открывается — позитивно, не перегружено
- **Инструменты:** Rhodes-пианино + лёгкий контрабас pizzicato
- **Темп:** 88 BPM
- **Длина лупа:** 45 сек
- **LUFS target:** -22 LUFS
- **Эмоция:** оптимизм, выбор, возможность

#### mus_game_week_shop_loop / mus_game_week_cafe_loop / mus_game_week_salon_loop
- **Экран:** Dashboard (основной игровой цикл)
- **Три варианта** — бизнес-специфичная атмосфера:
  - **Shop:** акустическая гитара + контрабас. Ритм спокойный, деловой
  - **Cafe:** Rhodes-пианино + лёгкий перкуссив (shaker). Теплее, уютнее
  - **Salon:** маримба + акустическая гитара. Чуть более лёгкое
- **Темп:** 88–96 BPM
- **Длина лупа:** 90–120 сек (чтобы не надоедал при долгой сессии)
- **LUFS target:** -24 LUFS
- **Transition:** crossfade 2 сек при смене бизнеса

#### mus_game_week_tension_layer
- **Триггер:** balance < порог выживания (< 20 000 ₽) ИЛИ reputation < 20
- **Техника:** дополнительный слой поверх основного лупа (layered adaptive audio)
- **Инструменты:** низкий контрабас col legno, тихое стакатто
- **LUFS target:** -28 LUFS (очень тихо, почти подсознательно)
- **Эффект:** лёгкая тревога без alarm-режима

#### mus_game_event_neutral_sting
- **Триггер:** появление pendingEvent (не кризисного)
- **Образ:** «звонок входной двери» — что-то происходит
- **Длина:** 2–3 сек, не луп
- **Инструменты:** глокеншпиль 2–3 ноты нисходящей интонации
- **Переход:** ducking основного лупа на -6 дБ, пока модалка открыта

#### mus_game_event_crisis_loop
- **Триггер:** isMoralDilemma === true ИЛИ mikhail_crisis-цепочка
- **Образ:** тихая комната, где нужно принять решение, часы тикают
- **Инструменты:** акустическая гитара (tremolo), очень медленно
- **Темп:** 58 BPM
- **Длина лупа:** 30 сек
- **LUFS target:** -20 LUFS (чуть громче, чтобы создать давление)

#### mus_game_weekresult_positive_sting
- **Триггер:** WeekResultsOverlay с положительным netProfit
- **Длина:** 3–4 сек
- **Инструменты:** Rhodes-аккорд + глокеншпиль восходящий
- **Тон:** удовлетворение, не эйфория

#### mus_game_weekresult_negative_sting
- **Триггер:** WeekResultsOverlay с отрицательным netProfit
- **Длина:** 3–4 сек
- **Инструменты:** низкое пианино, нисходящий минорный ход
- **Тон:** тревога, не катастрофа

#### mus_game_npc_scene_loop
- **Триггер:** pendingEvent с npcId != null (NPC-арка: MEET / TEST / RESOLVE)
- **Образ:** пауза в рабочем дне — разговор с человеком
- **Инструменты:** акустическая гитара соло, очень тихо
- **Темп:** 76 BPM
- **Длина лупа:** 45 сек
- **LUFS target:** -26 LUFS
- **Примечание:** один трек для всех NPC — специфика создаётся через SFX (ниже)

#### mus_end_victory_sting
- **Триггер:** VictoryModal type="victory"
- **Образ:** маленькая победа — не Олимпийская, а «получилось»
- **Длина:** 8–10 сек + луп тихого финального состояния
- **Инструменты:** Rhodes-пианино полный аккорд, акустическая гитара,
  контрабас pizzicato, финальный глокеншпиль акцент
- **Тон:** облегчение + тихая гордость

#### mus_end_defeat_sting
- **Триггер:** VictoryModal type="defeat"
- **Образ:** закрытая дверь магазина. Не трагедия — просто не получилось
- **Длина:** 6–8 сек + тихий луп для чтения постморtem
- **Инструменты:** одинокое пианино, нисходящая фраза
- **Тон:** достоинство поражения. Не shame, а усталость

---

## 3. UX SFX — Детальный список

Соглашение об именовании: `[category]_[context]_[name]_[variant].[ext]`

### 3.1 Navigation & UI

| Файл | Триггер | Описание | Длина |
|------|---------|----------|-------|
| `sfx_ui_click_primary_01.ogg` | KнопкаCTA «Следующий день» | Чёткий механический клик, как кнопка кассового аппарата | 80ms |
| `sfx_ui_click_secondary_01.ogg` | Все прочие кнопки | Более тихий, мягкий клик | 60ms |
| `sfx_ui_tab_switch_01.ogg` | Переключение KLeftRail навигации | Лёгкое сухое касание | 50ms |
| `sfx_ui_modal_open_01.ogg` | Открытие любой модалки | Короткий swoosh + landing | 150ms |
| `sfx_ui_modal_close_01.ogg` | Закрытие модалки | Обратный swoosh, тихий | 100ms |
| `sfx_ui_unlock_tab_01.ogg` | Toast разблокировки раздела | Два тона восходящих, глокеншпиль | 400ms |

### 3.2 Economy Events

| Файл | Триггер | Описание | Длина |
|------|---------|----------|-------|
| `sfx_economy_money_in_01.ogg` | Получение дохода (положительный balanceDelta) | Мягкий монетный звон, 2–3 монеты | 300ms |
| `sfx_economy_money_in_large_01.ogg` | balanceDelta > 10 000 ₽ | То же, но больше монет, чуть богаче | 500ms |
| `sfx_economy_money_out_01.ogg` | Списание (расходы, штраф) | Одиночный глухой удар | 200ms |
| `sfx_economy_penalty_01.ogg` | Крупный штраф / кризисное списание | Низкий двойной удар | 400ms |
| `sfx_economy_tax_01.ogg` | Еженедельная налоговая строка | Тихий «штамп» (rubber stamp sound) | 250ms |

### 3.3 Service & Ecosystem

| Файл | Триггер | Описание | Длина |
|------|---------|----------|-------|
| `sfx_service_activate_01.ogg` | activateService() — подключение сервиса Контур | Позитивный chord-звон (2 ноты) + тихий whoosh | 600ms |
| `sfx_service_kontour_saving_01.ogg` | Savings toast (Контур сэкономил X ₽) | Лёгкий «ding» + восходящая нотка | 400ms |
| `sfx_service_synergy_unlock_01.ogg` | Активация синергии бандла (3+/5+/7+ сервисов) | Трёхнотный восходящий аккорд | 700ms |

### 3.4 Weekly Cycle

| Файл | Триггер | Описание | Длина |
|------|---------|----------|-------|
| `sfx_week_advance_day_01.ogg` | completeActionsPhase() — успешный день | Короткий «tick» как перелистывание страницы | 150ms |
| `sfx_week_blocked_01.ogg` | dayBlockedMsg — нельзя продвинуть день | Мягкий «bump» (не резкий error) | 200ms |
| `sfx_week_summary_open_01.ogg` | WeekSummaryOverlay появляется | Спокойный swoosh + settle | 300ms |
| `sfx_week_result_positive_01.ogg` | WeekResultsOverlay — profit > 0 | Быстрый восходящий глокеншпиль | 500ms |
| `sfx_week_result_negative_01.ogg` | WeekResultsOverlay — profit < 0 | Нисходящий двутоновый сигнал | 400ms |

### 3.5 Events & NPC

| Файл | Триггер | Описание | Длина |
|------|---------|----------|-------|
| `sfx_event_arrive_neutral_01.ogg` | pendingEvent появляется (не кризис) | Мягкий «knock» — стук в дверь | 300ms |
| `sfx_event_arrive_crisis_01.ogg` | isMoralDilemma = true / кризисная цепочка | Более низкий, трёхкратный стук | 500ms |
| `sfx_event_choice_positive_01.ogg` | Выбор опции с balanceDelta > 0 | Мягкое «да» — нота уверенности | 200ms |
| `sfx_event_choice_negative_01.ogg` | Выбор опции с balanceDelta < -5000 | Лёгкий «вздох» — короткий нисходящий | 250ms |
| `sfx_npc_katya_01.ogg` | NPC-события Кати | Лёгкое пианино-тремоло (2 ноты) | 300ms |
| `sfx_npc_viktor_01.ogg` | NPC-события Виктора | Короткий уверенный аккорд | 300ms |
| `sfx_npc_tamara_01.ogg` | NPC-события Тамары | Тёплый глокеншпиль, «бабушкина» нота | 300ms |
| `sfx_npc_gena_01.ogg` | NPC-события Гены | Слегка комичный интервал (терция вниз) | 300ms |
| `sfx_npc_generic_01.ogg` | Остальные NPC (Денис, Ирина, Артём, Михаил) | Нейтральный краткий сигнал | 200ms |

### 3.6 Achievements & Milestones

| Файл | Триггер | Описание | Длина |
|------|---------|----------|-------|
| `sfx_achievement_unlock_01.ogg` | achievementChecker — новое достижение | Трёхнотный восходящий аккорд, маримба | 800ms |
| `sfx_milestone_week10_01.ogg` | milestoneStatus week10 | Более торжественный вариант, 5 нот | 1200ms |
| `sfx_milestone_week20_01.ogg` | milestoneStatus week20 | Аналогично, чуть длиннее | 1400ms |
| `sfx_milestone_week30_01.ogg` | milestoneStatus week30 | Максимальная длина, с резонансом | 1800ms |

### 3.7 Business Operations

| Файл | Триггер | Описание | Длина |
|------|---------|----------|-------|
| `sfx_ops_hire_employee_01.ogg` | Найм сотрудника | Короткий «welcome» — два восходящих тона | 400ms |
| `sfx_ops_fire_employee_01.ogg` | Увольнение сотрудника | Одиночный нисходящий тон | 300ms |
| `sfx_ops_upgrade_buy_01.ogg` | Покупка улучшения | Механический «щелчок» + низкий позитив | 500ms |
| `sfx_ops_cash_register_01.ogg` | Покупка кассы | Звук открытия кассового ящика | 400ms |
| `sfx_ops_stock_low_01.ogg` | stockPct < 25% | Тихий предупреждающий сигнал (не alarm) | 300ms |
| `sfx_ops_client_served_01.ogg` | servedToday увеличивается | Тихий звон монеты (фоновый, батчируемый) | 80ms |
| `sfx_ops_client_missed_01.ogg` | missedToday > 0 | Тихий «уф» или дверной стук (ушёл) | 150ms |

### 3.8 Environment Ambience (опционально, низкий приоритет)

| Файл | Контекст | Описание |
|------|----------|----------|
| `amb_env_shop_idle_loop.ogg` | Магазин, низкая интенсивность | Тихий магазинный фон: редкие шаги, далёкий разговор |
| `amb_env_cafe_idle_loop.ogg` | Кафе, низкая интенсивность | Звук кофемашины, далёкий разговор |
| `amb_env_salon_idle_loop.ogg` | Салон красоты, низкая интенсивность | Фен, тихая музыка, голоса |

**Примечание:** environment ambience — lowest priority tier. Реализовывать только
при наличии бюджета после основных категорий. На mobile отключать по умолчанию.

---

## 4. Mix Philosophy

### 4.1 Volume Hierarchy

```
Priority 1 (критичные): кризисные события, блокировки дня
Priority 2 (игровые): SFX экономики, достижения, сервис-активации
Priority 3 (UI):       клики, модалки, переключение табов
Priority 4 (фоновые):  music loops
Priority 5 (атмосфера): environment ambience
```

### 4.2 Master Volume Targets (LUFS)

| Категория | Цель LUFS | Peak dBFS |
|-----------|-----------|-----------|
| SFX (critical) | -14 | -3 |
| SFX (standard) | -18 | -6 |
| SFX (UI) | -22 | -9 |
| Music | -22 до -24 | -9 |
| Ambience | -28 до -30 | -12 |

Правило: музыка никогда не маскирует SFX. SFX-уведомления всегда слышны
поверх музыкального лупа без ducking (они достаточно тихи изначально).

### 4.3 Ducking Rules

| Триггер | Цель ducking | Глубина | Fade |
|---------|-------------|---------|------|
| pendingEvent появляется (not crisis) | music loop | -4 дБ | 500ms |
| isMoralDilemma / кризисная цепочка | music loop → полная замена | полная | 1000ms crossfade |
| WeekResultsOverlay | music loop | -6 дБ | 300ms |
| VictoryModal | music loop → sting | полная | 500ms |
| DefeatModal | music loop → sting | полная | 800ms |

### 4.4 Voiceover — решение

**Рекомендация: НЕТ озвучке NPC диалогов в v1.**

Обоснование:
1. Бюджет. 8 NPC × 3 арки × несколько реплик = минимум 50–80 отдельных записей.
   Студийная запись на русском с актёрами — 200–400k ₽ только за запись.
2. Локализация. Текст NPC меняется при итерациях; каждое изменение требует
   переозвучки.
3. Тон. Нарративный аудит указывает, что тексты NPC — локальные, специфичные,
   «дворовые». Озвучка generic-голосом убьёт именно то, что работает.
4. Бразерный прецедент: Stardew Valley работает без озвучки — и это не воспринимается
   как недостаток, потому что читательский ритм создаёт пространство воображению.

**Альтернатива:** NPC-идентифицирующий SFX (секция 3.5 выше) — уникальный
короткий звуковой «голос» персонажа без слов. Это дешевле, гибко при изменениях
текста, и не конфликтует с читательским ритмом.

**Исключение:** Если маркетинговая стратегия требует озвучку — приоритет отдать
трём ключевым моментам: открытие VictoryModal (1 фраза), открытие DefeatModal
(1 фраза), первое появление Кати (MEET-сцена, 1 фраза). Это создаст эмоциональные
якоря при минимальных затратах.

---

## 5. Adaptive Audio Design

### 5.1 Intensity States

Игра имеет три уровня интенсивности, определяемых состоянием gameStore:

```
LOW:    balance > 50k, no pendingEvent, reputation > 50
MEDIUM: balance 20k–50k ИЛИ pendingEvent ненапряжённый
HIGH:   balance < 20k ИЛИ isMoralDilemma ИЛИ mikhail_crisis
```

### 5.2 Music Transitions

```
LOW    → music_loop: полная громкость
MEDIUM → music_loop: -2дБ + tension layer fade in 2 сек
HIGH   → crisis_loop: crossfade 1 сек, замена основного лупа
```

### 5.3 Business-Type Specificity

При смене бизнеса (BusinessSelector) — crossfade 2 сек на
соответствующий business-specific луп. Переключение происходит один раз
при инициализации gameStore с выбранным businessType.

### 5.4 Week-Progress-Based Variation

Для предотвращения loop fatigue при длинных сессиях (45 недель):

- Week 1–10: Вариант A лупа (базовый)
- Week 11–25: Вариант B лупа (добавлен один слой — контрабас или шейкер)
- Week 26+: Вариант C лупа (полная аранжировка из 3–4 инструментов)

Реализация: три файла на бизнес (`_a`, `_b`, `_c` суффиксы) с crossfade
при смене по порогу недели. Это создаёт ощущение «роста» звуковой среды
параллельно росту бизнеса.

---

## 6. Accessibility

### 6.1 Обязательные требования

**Mute control:**
- Кнопка mute в SettingsModal (уже существует — нужно только подключить)
- Настройка сохраняется в localStorage отдельно от `konturgame_state_v7`
  (ключ `konturgame_audio_prefs`) — чтобы не ломать игровой сейв
- Раздельный контроль: Music Volume, SFX Volume (0–100)

**`prefers-reduced-motion` параллель для аудио:**
CSS media query `prefers-reduced-motion: reduce` не затрагивает аудио напрямую,
но создаёт прецедент — пользователи с вестибулярными расстройствами часто
чувствительны к резким аудио-стимулам.

Рекомендуемое поведение при `prefers-reduced-motion: reduce`:
- Отключить все SFX длиннее 200ms (достижения, стинги)
- Оставить только тихий music loop и короткие click-SFX

**Subtitles / captions:**
Если voiceover будет добавлен — обязательные субтитры с соответствием NPC-имя.
Для текущей реализации (без voiceover) — не применимо.

**Deaf / hard of hearing:**
Игра полностью функциональна без звука — вся информация дублируется визуально.
Это уже выполнено по дизайну (KPI strip, toast-уведомления, цветовое кодирование).

### 6.2 Рекомендуемые настройки по умолчанию

```
musicVolume: 40%   (тихо по умолчанию — офисная среда)
sfxVolume:   70%   (SFX должны быть слышны чётко)
autoMuteOnFocusLoss: false (игрок сам решает)
```

### 6.3 Mobile-specific

На мобильных устройствах браузер требует user gesture перед воспроизведением
Audio API. Первое нажатие любой кнопки (BusinessSelector «Начать») должно
инициализировать AudioContext. До этого момента — полная тишина, это норма.

---

## 7. Implementation Strategy

### 7.1 Выбор технологии

**Рекомендация: Howler.js v2**

| Критерий | HTMLAudio | Web Audio API | Howler.js |
|---------|-----------|--------------|-----------|
| Сложность реализации | Низкая | Высокая | Низкая |
| Кроссбраузерность | Хорошая | Хорошая | Отличная (fallback) |
| Spatialization | Нет | Да | Да (через Web Audio) |
| Ducking/fade | Ручная | Native | Built-in |
| Sprite support | Нет | Нет | Да |
| Размер библиотеки | 0 KB | 0 KB | ~9 KB gzipped |
| Loop crossfade | Невозможно | Возможно | Возможно |

HTMLAudio не подходит: нет crossfade, нет ducking, нет надёжного loop.
Web Audio API: избыточная сложность для данного масштаба, нужен весь
audio graph вручную.
Howler.js: оптимальный баланс. Уже имеет Web Audio API под капотом,
fallback на HTMLAudio, прост в интеграции в Zustand-архитектуру.

**Интеграция с Zustand:**
Создать отдельный `audioStore.ts` (не gameStore) с состоянием:
`musicVolume`, `sfxVolume`, `isMuted`, `currentMusicCue`. Audio-логика
не должна входить в `gameStore.ts` — разделение ответственности.

**Инициализация:** lazy, при первом user gesture. Singleton Howler instance.

### 7.2 Lazy Loading Strategy

Браузерная игра — важно не блокировать первый рендер.

**Порядок загрузки:**
1. Синхронно с первым user gesture: `sfx_ui_click_primary_01.ogg` (80 KB)
2. После выбора бизнеса: music loop выбранного бизнеса
3. Idle (requestIdleCallback): остальные SFX
4. По требованию: crisis_loop, end stings (при первом приближении к кризису)

**Preload hint в index.html** (только для primary SFX):
```html
<link rel="preload" href="/audio/sfx_ui_click_primary_01.ogg" as="fetch" crossorigin>
```

### 7.3 Форматы файлов

| Формат | Поддержка | Рекомендация |
|--------|-----------|-------------|
| OGG Vorbis | Все браузеры кроме старого Safari | Основной формат |
| MP3 | Все браузеры | Fallback для Safari |

Поставлять оба формата для каждого ассета. Howler.js автоматически выбирает
поддерживаемый формат.

### 7.4 License Strategy

**Рекомендация: Custom commissioned music + royalty-free SFX**

| Тип ассета | Стратегия | Обоснование |
|-----------|-----------|------------|
| Music loops (11 файлов) | Commissioned — заказная | Sonic identity уникален, нельзя взять «из магазина» |
| NPC stings (8 файлов) | Commissioned или синтез | Недорого, важна уникальность |
| UI SFX | Royalty-free (Sonniss, Freesound, Epidemic Sound) | Стандартные звуки, не нуждаются в уникальности |
| Economy SFX | Royalty-free + лёгкая обработка | Монеты/касса — universal |
| Crisis/event SFX | Royalty-free | |

**Запрещённые библиотеки без проверки лицензии:**
- Freesound (CC — требует проверки Attribution / NonCommercial per-file)
- YouTube Audio Library (проверить commercial use)
- Zapsplat, Pixabay — проверить commercial license

**Рекомендованные для SFX:**
- Sonniss GDC Audio Bundle (pro, royalty-free commercially)
- Epidemic Sound (subscription, covers commercial)
- Собственный синтез через FMOD/Audacity (нет лицензионных проблем)

---

## 8. Audio Asset Specifications

### 8.1 File Format Requirements

```
Формат:      OGG Vorbis (primary) + MP3 (fallback)
Sample Rate: 44100 Hz
Bit Depth:   16-bit (для web достаточно)
Channels:    Mono для SFX (< 500ms), Stereo для music и long SFX
```

### 8.2 Loudness Targets

| Тип | Integrated LUFS | True Peak |
|-----|----------------|-----------|
| Music loops | -22 до -26 | -3 dBFS |
| Achievement stings | -14 до -16 | -2 dBFS |
| UI SFX | -20 до -24 | -6 dBFS |
| Economy SFX | -16 до -18 | -4 dBFS |
| Crisis stings | -14 до -18 | -3 dBFS |

### 8.3 File Size Budget

Общий бюджет аудио-ассетов: **< 3 MB** (первоначальная загрузка < 1 MB).

| Категория | Файлов | Avg Size | Total |
|-----------|--------|----------|-------|
| Music loops (90–120 sec) | 11 | 120 KB | 1.3 MB |
| Music stings (3–10 sec) | 6 | 30 KB | 180 KB |
| SFX (все категории) | ~45 | 15 KB | 675 KB |
| NPC stings | 8 | 20 KB | 160 KB |
| Ambience (optional) | 3 | 150 KB | 450 KB |
| **Итого без ambience** | | | **~2.3 MB** |

*OGG Vorbis quality q4–q6. MP3 fallback не считается — загружается только
при отсутствии OGG поддержки.*

### 8.4 Directory Structure

```
public/audio/
├── music/
│   ├── mus_menu_backstory_loop.ogg
│   ├── mus_menu_select_loop.ogg
│   ├── mus_game_week_shop_a_loop.ogg
│   ├── mus_game_week_shop_b_loop.ogg
│   ├── mus_game_week_shop_c_loop.ogg
│   ├── mus_game_week_cafe_a_loop.ogg
│   ├── mus_game_week_cafe_b_loop.ogg
│   ├── mus_game_week_cafe_c_loop.ogg
│   ├── mus_game_week_salon_a_loop.ogg
│   ├── mus_game_week_salon_b_loop.ogg
│   ├── mus_game_week_salon_c_loop.ogg
│   ├── mus_game_week_tension_layer.ogg
│   ├── mus_game_event_crisis_loop.ogg
│   ├── mus_game_npc_scene_loop.ogg
│   ├── mus_end_victory_sting.ogg
│   └── mus_end_defeat_sting.ogg
├── sfx/
│   ├── ui/
│   │   ├── sfx_ui_click_primary_01.ogg
│   │   ├── sfx_ui_click_secondary_01.ogg
│   │   ├── sfx_ui_tab_switch_01.ogg
│   │   ├── sfx_ui_modal_open_01.ogg
│   │   ├── sfx_ui_modal_close_01.ogg
│   │   └── sfx_ui_unlock_tab_01.ogg
│   ├── economy/
│   │   ├── sfx_economy_money_in_01.ogg
│   │   ├── sfx_economy_money_in_large_01.ogg
│   │   ├── sfx_economy_money_out_01.ogg
│   │   ├── sfx_economy_penalty_01.ogg
│   │   └── sfx_economy_tax_01.ogg
│   ├── service/
│   │   ├── sfx_service_activate_01.ogg
│   │   ├── sfx_service_kontour_saving_01.ogg
│   │   └── sfx_service_synergy_unlock_01.ogg
│   ├── week/
│   │   ├── sfx_week_advance_day_01.ogg
│   │   ├── sfx_week_blocked_01.ogg
│   │   ├── sfx_week_summary_open_01.ogg
│   │   ├── sfx_week_result_positive_01.ogg
│   │   └── sfx_week_result_negative_01.ogg
│   ├── events/
│   │   ├── sfx_event_arrive_neutral_01.ogg
│   │   ├── sfx_event_arrive_crisis_01.ogg
│   │   ├── sfx_event_choice_positive_01.ogg
│   │   └── sfx_event_choice_negative_01.ogg
│   ├── npc/
│   │   ├── sfx_npc_katya_01.ogg
│   │   ├── sfx_npc_viktor_01.ogg
│   │   ├── sfx_npc_tamara_01.ogg
│   │   ├── sfx_npc_gena_01.ogg
│   │   └── sfx_npc_generic_01.ogg
│   ├── achievements/
│   │   ├── sfx_achievement_unlock_01.ogg
│   │   ├── sfx_milestone_week10_01.ogg
│   │   ├── sfx_milestone_week20_01.ogg
│   │   └── sfx_milestone_week30_01.ogg
│   └── ops/
│       ├── sfx_ops_hire_employee_01.ogg
│       ├── sfx_ops_fire_employee_01.ogg
│       ├── sfx_ops_upgrade_buy_01.ogg
│       ├── sfx_ops_cash_register_01.ogg
│       ├── sfx_ops_stock_low_01.ogg
│       ├── sfx_ops_client_served_01.ogg
│       └── sfx_ops_client_missed_01.ogg
└── amb/
    ├── amb_env_shop_idle_loop.ogg
    ├── amb_env_cafe_idle_loop.ogg
    └── amb_env_salon_idle_loop.ogg
```

---

## 9. Оценка объёма и бюджет

### 9.1 Breakdown по ролям

#### Sound Designer (исполнение SFX)

| Задача | Часы |
|--------|------|
| UI SFX (6 файлов) | 4 ч |
| Economy SFX (5 файлов) | 4 ч |
| Service SFX (3 файла) | 3 ч |
| Weekly cycle SFX (5 файлов) | 4 ч |
| Event SFX (4 файла) | 4 ч |
| NPC character stings (5 файлов) | 6 ч |
| Achievement stings (4 файла) | 5 ч |
| Ops SFX (7 файлов) | 6 ч |
| Mastering + loop-точность + fallback-конвертация | 6 ч |
| **Итого Sound Designer** | **42 ч** |

#### Composer (музыка)

| Задача | Часы |
|--------|------|
| Sonic identity definition + demos (3 варианта) | 8 ч |
| Menu + backstory loops (2 трека) | 10 ч |
| Business-specific loops × 3 бизнеса × 3 варианта (9 треков) | 40 ч |
| Tension layer (1 аддитивный слой) | 6 ч |
| Crisis loop (1 трек) | 6 ч |
| NPC scene loop (1 трек) | 5 ч |
| Victory / defeat stings (2 трека) | 8 ч |
| Week result stings (2 коротких) | 4 ч |
| Revisions × 2 итерации | 15 ч |
| **Итого Composer** | **102 ч** |

#### Audio Programmer (интеграция)

| Задача | Часы |
|--------|------|
| audioStore.ts (Zustand + Howler.js) | 8 ч |
| gameStore → audioStore event hooks | 6 ч |
| Adaptive music system (intensity states, crossfade) | 10 ч |
| SettingsModal audio controls | 4 ч |
| Mobile AudioContext unlock | 3 ч |
| Lazy loading + preload hints | 4 ч |
| Testing + browser matrix | 6 ч |
| **Итого Audio Programmer** | **41 ч** |

### 9.2 Итоговая оценка

| Роль | Часы | Ставка (ориентир) | Бюджет |
|------|------|-------------------|--------|
| Composer | 102 ч | 3 000 – 5 000 ₽/ч | 306 000 – 510 000 ₽ |
| Sound Designer | 42 ч | 2 000 – 3 500 ₽/ч | 84 000 – 147 000 ₽ |
| Audio Programmer | 41 ч | 3 500 – 5 000 ₽/ч | 143 500 – 205 000 ₽ |
| Лицензии (Howler.js: MIT, бесплатно) | — | — | 0 ₽ |
| SFX библиотека (Sonniss / Epidemic) | — | — | 15 000 – 30 000 ₽ |
| **ИТОГО (без ambience)** | **185 ч** | | **548 500 – 892 000 ₽** |

**MVP-scope (только критичные SFX + одна версия music loop без business-specific):**
- Sound Designer: 25 ч
- Composer: 40 ч (2 меню + 1 universal game loop + victory/defeat)
- Audio Programmer: 25 ч
- **MVP: ~90 ч / 250 000 – 380 000 ₽**

### 9.3 Фазирование

**Phase 1 (MVP, 3–4 недели):**
- UI clicks (sfx_ui_click_primary, sfx_ui_click_secondary)
- Service activate + synergy SFX
- Один универсальный game loop
- Victory/defeat stings
- Howler.js интеграция + audioStore

**Phase 2 (2–3 недели после MVP):**
- Business-specific music loops
- Economy SFX (money in/out, penalty)
- NPC character stings
- Achievement sounds
- Adaptive intensity states

**Phase 3 (опционально):**
- Week-progress music variants (a/b/c)
- Ambience layers
- Tension layer

---

## 10. Делегирование и координация

**Audio Director → Sound Designer:**
Передать секцию 3 (UX SFX) как technical brief с LUFS targets,
длинами файлов и описаниями звуков. Sound Designer принимает решения
о конкретных текстурах — только указаны функциональные требования.

**Audio Director → Composer:**
Передать секцию 1.2 (Sonic Identity) и секцию 2 (Music Cues) как
creative brief. Обязательное демо-прослушивание на этапе identity definition
перед записью полных треков.

**Audio Director → Lead Programmer:**
Передать секцию 7 (Implementation Strategy) как техническое задание.
Howler.js не затрагивает существующую архитектуру — audioStore.ts новый файл.
Нет изменений в gameStore.ts кроме добавления observers/subscriptions.

**Audio Director → Creative Director:**
Утвердить sonic identity («Рабочий джаз в соседней комнате») и решение
по voiceover (НЕТ в v1) до начала заказа у composer.

**Audio Director → Narrative Director:**
NPC character stings (секция 3.5) — согласовать соответствие звука
и нарративного тона каждого персонажа. Особенно: Гена (комичный),
Тамара (тёплый), Виктор (уверенный), Катя (лёгкое, дружеское).

---

## 11. Риски и митигация

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Loop fatigue при 45-недельной сессии | Высокая | 3 варианта лупов (a/b/c) по прогрессу |
| Mobile AudioContext blocked | Высокая | Обязательный user-gesture unlock при старте |
| Safari OGG несовместимость | Средняя | MP3 fallback, Howler.js автовыбор |
| Composer срыв дедлайна | Средняя | Фазирование: MVP с 1 universal loop |
| SFX лицензионный конфликт | Низкая | Только Sonniss/Epidemic с clear commercial license |
| Audio отвлекает в офисной среде | Высокая | musicVolume 40% по умолчанию + быстрый mute |

---

*Следующий шаг: утверждение sonic identity у Creative Director,
затем передача creative brief composer'у.*
