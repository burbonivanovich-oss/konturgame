import React from 'react'
import { useGameStore } from '../../stores/gameStore'
import { getCampaignStats } from '../../services/weekCalculator'
import '../styles/CampaignROIView.css'

export function CampaignROIView() {
  const state = useGameStore()
  const stats = getCampaignStats(state)

  if (stats.totalCampaigns === 0) {
    return (
      <div className="campaign-roi-view">
        <div className="campaign-roi-empty">
          <p>No campaigns launched yet</p>
          <p>Launch marketing campaigns to track ROI</p>
        </div>
      </div>
    )
  }

  return (
    <div className="campaign-roi-view">
      <div className="campaign-roi-summary">
        <div className="stat-card">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">${stats.totalSpent.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average ROI</div>
          <div className={`stat-value ${stats.averageROI >= 0 ? 'positive' : 'negative'}`}>
            {stats.averageROI.toFixed(1)}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Campaigns</div>
          <div className="stat-value">{stats.totalCampaigns}</div>
        </div>
      </div>

      <div className="campaign-roi-list">
        <h3>Campaign History</h3>
        <table className="campaign-table">
          <thead>
            <tr>
              <th>Campaign ID</th>
              <th>Week Launched</th>
              <th>Cost Spent</th>
              <th>Revenue Generated</th>
              <th>Clients Acquired</th>
              <th>ROI %</th>
            </tr>
          </thead>
          <tbody>
            {stats.campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>{campaign.campaignId.substring(0, 20)}</td>
                <td>{campaign.launchedWeek}</td>
                <td>${campaign.costSpent.toLocaleString()}</td>
                <td>${campaign.revenueGenerated.toLocaleString()}</td>
                <td>{campaign.clientsAcquired}</td>
                <td className={campaign.roi >= 0 ? 'positive' : 'negative'}>
                  {campaign.roi.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
