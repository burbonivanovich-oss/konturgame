#!/usr/bin/env node
/**
 * Playtest postmortem скрипт. Запуск:
 *   node docs/playtest/replay.mjs path/to/playtest-shop-W23.json
 *   node docs/playtest/replay.mjs reports/*.json    # batch
 *
 * Извлекает из export'а ключевые сигналы и печатает читаемый отчёт.
 * Что отвечает на:
 *   • Куда дошёл (W?, gameOverReason?)
 *   • Цель достигнута?
 *   • Какие сервисы и когда подключал
 *   • Сколько событий разрешил, какие выборы доминировали (Контур vs нет)
 *   • Burnout warning hit?
 *   • Tier reached
 *   • Все диалоговые решения по decisionLog
 *   • Топ-3 ачивки последние
 */

import { readFileSync } from 'fs'
import { argv, exit } from 'process'

const files = argv.slice(2)
if (files.length === 0) {
  console.log('Usage: node docs/playtest/replay.mjs <file.json> [file2.json ...]')
  exit(1)
}

function analyze(filename) {
  let data
  try {
    data = JSON.parse(readFileSync(filename, 'utf8'))
  } catch (e) {
    console.error(`× ${filename}: ${e.message}`)
    return
  }
  const s = data.state ?? data  // tolerate both wrapped and raw

  const week = s.currentWeek ?? 0
  const biz = s.businessType ?? '?'
  const bal = s.balance ?? 0
  const rep = s.reputation ?? 0
  const tier = s.businessTier ?? 1
  const energy = s.entrepreneurEnergy ?? 0

  const status = s.isVictory ? `✅ ВИКТОРИЯ (тип: ${s.victoryType ?? '?'})`
    : s.isGameOver ? `💀 GAME OVER (${s.gameOverReason ?? '?'})`
    : `⏸  В ПРОЦЕССЕ (W${week})`

  const goalStatus = s.personalGoal
    ? s.personalGoal.achieved
      ? `🎯 ЦЕЛЬ ДОСТИГНУТА: ${s.personalGoal.shortLabel} (${s.personalGoal.targetAmount.toLocaleString('ru')}₽)`
      : s.personalGoal.missed
      ? `❌ ЦЕЛЬ ПРОВАЛЕНА: ${s.personalGoal.shortLabel} (нужно ${s.personalGoal.targetAmount.toLocaleString('ru')}₽, было ${bal.toLocaleString('ru')}₽)`
      : `→ В ПУТИ к цели: ${s.personalGoal.shortLabel} (${Math.round((bal / s.personalGoal.targetAmount) * 100)}%)`
    : 'нет цели'

  const activeServices = Object.values(s.services ?? {})
    .filter(svc => svc.isActive)
    .map(svc => svc.id)

  const triggered = s.triggeredEventIds ?? []
  const decisions = s.decisionLog ?? []
  const achievements = s.achievements ?? []
  const burnoutHit = !!s.burnoutWarningActive || decisions.some(d => d.text?.includes('выгорел'))

  // Контур vs статус-кво ratio из chosenEventOptions
  const chosen = s.chosenEventOptions ?? {}
  const chosenCount = Object.keys(chosen).length
  const kontourChoices = Object.values(chosen).filter(opt => typeof opt === 'string' && /subscribe|kontour|елба|маркет|диадок|фокус|эльба|банк|ofd/i.test(opt)).length

  console.log('━'.repeat(70))
  console.log(`📁 ${filename}`)
  console.log('━'.repeat(70))
  console.log(`Бизнес:      ${biz} · Tier ${tier}`)
  console.log(`Статус:      ${status}`)
  console.log(`Цель:        ${goalStatus}`)
  console.log(`Финиш:       W${week}, balance ${bal.toLocaleString('ru')}₽, rep ${rep}, energy ${energy}`)
  console.log(`Сервисы:     ${activeServices.length ? activeServices.join(', ') : '— ни одного'}`)
  console.log(`Burnout:     ${burnoutHit ? '⚠️ ДА — энергия проседала' : 'нет'}`)
  console.log()
  console.log(`События:     прошло ${triggered.length}, разрешено ${chosenCount}, выбран Контур ${kontourChoices}/${chosenCount}`)
  console.log(`Достижения:  ${achievements.length} штук`)
  if (achievements.length > 0) {
    console.log(`             последние: ${achievements.slice(-3).join(', ')}`)
  }
  console.log()

  // Decision log — последние 10 решений для понимания «чем закончил»
  if (decisions.length > 0) {
    console.log(`Последние решения (всего ${decisions.length}):`)
    decisions.slice(-10).forEach(d => {
      const mark = d.impact === 'positive' ? '+' : d.impact === 'negative' ? '−' : '·'
      console.log(`  W${d.week} ${mark} ${d.text}`)
    })
  }
  console.log()
  console.log()
}

files.forEach(analyze)

// Сводка батчем
if (files.length > 1) {
  console.log('═'.repeat(70))
  console.log(`СВОДКА по ${files.length} файлам:`)
  console.log('═'.repeat(70))
  let victories = 0, gameovers = 0, inprogress = 0
  let burnouts = 0, bankrupts = 0
  files.forEach(f => {
    try {
      const data = JSON.parse(readFileSync(f, 'utf8'))
      const s = data.state ?? data
      if (s.isVictory) victories++
      else if (s.isGameOver) {
        gameovers++
        if (s.gameOverReason === 'burnout') burnouts++
        else if (s.gameOverReason === 'bankrupt') bankrupts++
      } else inprogress++
    } catch (e) {}
  })
  console.log(`Виктории:     ${victories}/${files.length}`)
  console.log(`Game over:    ${gameovers}/${files.length} (burnout ${burnouts}, bankrupt ${bankrupts})`)
  console.log(`В процессе:   ${inprogress}/${files.length}`)
}
