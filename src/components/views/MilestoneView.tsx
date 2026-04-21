import React from 'react'
import { useGameStore } from '../../stores/gameStore'
import { getMilestoneProgress } from '../../services/weekCalculator'
import '../styles/MilestoneView.css'

interface MilestoneGoal {
  week: number
  balanceTarget: number
  profitTarget: number
  achieved: boolean
}

export function MilestoneView() {
  const state = useGameStore()
  const milestones = getMilestoneProgress(state)

  const goals: MilestoneGoal[] = [
    {
      week: 10,
      balanceTarget: 100000,
      profitTarget: 1000,
      achieved: milestones.week10,
    },
    {
      week: 20,
      balanceTarget: 250000,
      profitTarget: 5000,
      achieved: milestones.week20,
    },
    {
      week: 30,
      balanceTarget: 500000,
      profitTarget: 10000,
      achieved: milestones.week30,
    },
  ]

  const currentWeek = state.currentWeek
  const currentBalance = state.balance
  const lastWeeklyProfit = state.lastDayResult?.netProfit ?? 0

  return (
    <div className="milestone-view">
      <h2>Business Milestones</h2>
      <div className="milestone-progress">
        <div className="current-status">
          <div className="status-card">
            <div className="status-label">Current Week</div>
            <div className="status-value">{currentWeek} / 52</div>
          </div>
          <div className="status-card">
            <div className="status-label">Current Balance</div>
            <div className="status-value">${currentBalance.toLocaleString()}</div>
          </div>
          <div className="status-card">
            <div className="status-label">Last Weekly Profit</div>
            <div className={`status-value ${lastWeeklyProfit >= 0 ? 'positive' : 'negative'}`}>
              ${lastWeeklyProfit.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="milestones-grid">
        {goals.map((goal) => {
          const balanceProgress = Math.min(100, (currentBalance / goal.balanceTarget) * 100)
          const profitProgress = Math.min(100, (lastWeeklyProfit / goal.profitTarget) * 100)
          const isCurrentWeekMilestone = currentWeek >= goal.week

          return (
            <div key={goal.week} className={`milestone-card ${goal.achieved ? 'achieved' : ''}`}>
              <div className="milestone-header">
                <h3>Week {goal.week}</h3>
                {goal.achieved && <span className="achievement-badge">✓ Achieved</span>}
              </div>

              <div className="milestone-goals">
                <div className="goal">
                  <div className="goal-label">Balance: ${goal.balanceTarget.toLocaleString()}</div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${balanceProgress}%` }}
                    />
                  </div>
                  <div className="progress-text">${currentBalance.toLocaleString()}</div>
                </div>

                <div className="goal">
                  <div className="goal-label">Weekly Profit: ${goal.profitTarget.toLocaleString()}</div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${profitProgress}%` }}
                    />
                  </div>
                  <div className="progress-text">${lastWeeklyProfit.toLocaleString()}</div>
                </div>
              </div>

              {!goal.achieved && isCurrentWeekMilestone && (
                <div className="milestone-status">
                  Available this week
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="milestone-info">
        <p>Achieve either balance OR weekly profit target to earn the milestone!</p>
      </div>
    </div>
  )
}
