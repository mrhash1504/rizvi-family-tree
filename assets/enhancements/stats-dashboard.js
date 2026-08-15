/* Statistics Dashboard
 * Advanced analytics: gender distribution, age histograms, lifespan trends
 */

class StatisticsDashboard {
  constructor(containerSelector = '#dashboard-container', peopleData = null, statsObj = null) {
    this.container = document.querySelector(containerSelector);
    this.peopleData = peopleData;
    this.stats = statsObj;
    this.init();
  }

  init() {
    if (!this.container) return;

    if (!this.peopleData && typeof window !== 'undefined' && window.allPeople) {
      this.peopleData = window.allPeople;
    }

    // Use existing stats object if available, or create new one
    if (!this.stats && typeof FamilyStatistics !== 'undefined') {
      this.stats = new FamilyStatistics(this.peopleData).stats;
    }

    if (this.peopleData && this.stats) {
      this.createDashboard();
    }
  }

  createDashboard() {
    const html = `
      <div class="dashboard-wrapper">
        <div class="dashboard-header">
          <h3>Advanced Statistics Dashboard</h3>
        </div>

        <div class="dashboard-grid">
          <!-- Gender Distribution Pie -->
          <div class="dashboard-card">
            <h4>Gender Distribution</h4>
            <div class="pie-chart" id="genderChart">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="90"/>
              </svg>
            </div>
            <div class="pie-legend" id="genderLegend"></div>
          </div>

          <!-- Living vs Deceased -->
          <div class="dashboard-card">
            <h4>Living vs Deceased</h4>
            <div class="pie-chart" id="statusChart">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="90"/>
              </svg>
            </div>
            <div class="pie-legend" id="statusLegend"></div>
          </div>

          <!-- Age Distribution -->
          <div class="dashboard-card">
            <h4>Age Distribution</h4>
            <div class="bar-chart" id="ageChart"></div>
          </div>

          <!-- Birth Decade Breakdown -->
          <div class="dashboard-card">
            <h4>Birth Decade Breakdown</h4>
            <div class="bar-chart" id="decadeChart"></div>
          </div>
        </div>

        <!-- Lifespan Trend Chart (full width) -->
        <div class="dashboard-card full-width">
          <h4>Average Lifespan by Generation</h4>
          <div class="line-chart" id="lifespanChart"></div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.renderCharts();
  }

  renderCharts() {
    this.renderGenderPie();
    this.renderStatusPie();
    this.renderAgeDistribution();
    this.renderBirthDecades();
    this.renderLifespanTrend();
  }

  renderGenderPie() {
    const canvas = document.getElementById('genderChart');
    const legend = document.getElementById('genderLegend');
    if (!canvas || !this.stats.genderDistribution) return;

    const data = this.stats.genderDistribution;
    const total = data.male.count + data.female.count + data.unknown.count;

    // Create SVG pie chart
    const percentages = {
      male: data.male.count / total,
      female: data.female.count / total,
      unknown: data.unknown.count / total
    };

    const colors = {
      male: '#3b82f6',
      female: '#ec4899',
      unknown: '#d1d5db'
    };

    let html = `<svg viewBox="0 0 100 100">`;
    let currentAngle = -Math.PI / 2;

    Object.entries(percentages).forEach(([key, percent]) => {
      const sliceAngle = percent * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;

      const x1 = 50 + 45 * Math.cos(startAngle);
      const y1 = 50 + 45 * Math.sin(startAngle);
      const x2 = 50 + 45 * Math.cos(endAngle);
      const y2 = 50 + 45 * Math.sin(endAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const d = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;
      html += `<path d="${d}" fill="${colors[key]}" opacity="0.8"/>`;

      currentAngle = endAngle;
    });

    html += `</svg>`;
    canvas.innerHTML = html;

    // Render legend
    let legendHtml = '';
    Object.entries(data).forEach(([key, val]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      legendHtml += `
        <div class="legend-row">
          <span class="color-dot" style="background: ${colors[key]}"></span>
          <span>${label}: ${val.count} (${val.percentage}%)</span>
        </div>
      `;
    });

    legend.innerHTML = legendHtml;
  }

  renderStatusPie() {
    const canvas = document.getElementById('statusChart');
    const legend = document.getElementById('statusLegend');
    if (!canvas) return;

    const living = this.stats.living;
    const deceased = this.stats.deceased;
    const total = living + deceased;

    const livingPercent = living / total;
    const deceasedPercent = deceased / total;

    // SVG pie chart
    const x2 = 50 + 45 * Math.cos(livingPercent * 2 * Math.PI - Math.PI / 2);
    const y2 = 50 + 45 * Math.sin(livingPercent * 2 * Math.PI - Math.PI / 2);

    const largeArc = livingPercent > 0.5 ? 1 : 0;

    const html = `
      <svg viewBox="0 0 100 100">
        <path d="M 50 50 L 50 5 A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z" fill="#10b981" opacity="0.8"/>
        <path d="M 50 50 L ${x2} ${y2} A 45 45 0 ${deceasedPercent > 0.5 ? 1 : 0} 1 50 5 Z" fill="#ef4444" opacity="0.8"/>
      </svg>
    `;

    canvas.innerHTML = html;

    const legendHtml = `
      <div class="legend-row">
        <span class="color-dot" style="background: #10b981"></span>
        <span>Living: ${living} (${Math.round(livingPercent * 100)}%)</span>
      </div>
      <div class="legend-row">
        <span class="color-dot" style="background: #ef4444"></span>
        <span>Deceased: ${deceased} (${Math.round(deceasedPercent * 100)}%)</span>
      </div>
    `;

    legend.innerHTML = legendHtml;
  }

  renderAgeDistribution() {
    const chart = document.getElementById('ageChart');
    if (!chart || !this.stats.ageDistribution) return;

    const ranges = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60+'];
    const max = Math.max(...ranges.map(r => this.stats.ageDistribution[r] || 0));

    let html = '<div class="bar-chart-bars">';
    ranges.forEach(range => {
      const count = this.stats.ageDistribution[range] || 0;
      const percent = (count / max) * 100;
      html += `
        <div class="bar-item">
          <div class="bar" style="height: ${percent}%" title="${range}: ${count} people">
            ${count}
          </div>
          <div class="bar-label">${range}</div>
        </div>
      `;
    });
    html += '</div>';

    chart.innerHTML = html;
  }

  renderBirthDecades() {
    const chart = document.getElementById('decadeChart');
    if (!chart || !this.stats.birthDecadeBreakdown) return;

    const decades = Object.entries(this.stats.birthDecadeBreakdown)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    const max = Math.max(...decades.map(d => d[1]));

    let html = '<div class="bar-chart-bars">';
    decades.forEach(([decade, count]) => {
      const percent = (count / max) * 100;
      html += `
        <div class="bar-item">
          <div class="bar" style="height: ${percent}%; background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%)" title="${decade}: ${count} people">
            ${count}
          </div>
          <div class="bar-label">${decade}</div>
        </div>
      `;
    });
    html += '</div>';

    chart.innerHTML = html;
  }

  renderLifespanTrend() {
    const chart = document.getElementById('lifespanChart');
    if (!chart || !this.stats.lifespanTrend || this.stats.lifespanTrend.length === 0) return;

    const trend = this.stats.lifespanTrend.filter(t => t.avgLifespan !== null);
    if (trend.length === 0) return;

    const maxLifespan = Math.max(...trend.map(t => t.avgLifespan || 0));

    let html = '<div class="line-chart-container">';
    html += '<svg viewBox="0 0 1000 300" class="line-chart-svg">';

    // Grid lines
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * 250 + 25;
      html += `<line x1="50" y1="${y}" x2="950" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
      html += `<text x="20" y="${y + 5}" font-size="12" fill="#9ca3af">${Math.round((10 - i) * maxLifespan / 10)}</text>`;
    }

    // Data line
    const points = trend.map((t, i) => {
      const x = 50 + (i / (trend.length - 1 || 1)) * 900;
      const y = 275 - (t.avgLifespan / maxLifespan) * 250;
      return `${x},${y}`;
    });

    html += `<polyline points="${points.join(' ')}" fill="none" stroke="#6366f1" stroke-width="3" stroke-linejoin="round"/>`;

    // Data points
    trend.forEach((t, i) => {
      const x = 50 + (i / (trend.length - 1 || 1)) * 900;
      const y = 275 - (t.avgLifespan / maxLifespan) * 250;
      html += `<circle cx="${x}" cy="${y}" r="4" fill="#6366f1" stroke="white" stroke-width="2" opacity="0.8"/>`;
    });

    // X-axis labels
    trend.forEach((t, i) => {
      const x = 50 + (i / (trend.length - 1 || 1)) * 900;
      html += `<text x="${x}" y="300" text-anchor="middle" font-size="11" fill="#9ca3af">${t.generation}s</text>`;
    });

    html += '</svg></div>';
    chart.innerHTML = html;
  }

  updateData(peopleData, statsObj) {
    this.peopleData = peopleData;
    this.stats = statsObj || (typeof FamilyStatistics !== 'undefined' ? new FamilyStatistics(peopleData).stats : null);
    if (this.stats) {
      this.renderCharts();
    }
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  window.StatisticsDashboard = StatisticsDashboard;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#dashboard-container') && window.allPeople) {
      window.statisticsDashboard = new StatisticsDashboard(
        '#dashboard-container',
        window.allPeople,
        window.statsRenderer?.stats
      );
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = StatisticsDashboard;
}
