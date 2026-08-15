/* Geographic Heatmap Renderer
 * World map visualization with heat colors based on family population density
 * Includes migration timeline animation
 */

class GeographicHeatmap {
  constructor(containerSelector = '#heatmap-container', peopleData = null) {
    this.container = document.querySelector(containerSelector);
    this.peopleData = peopleData;
    this.stats = {
      byCountry: new Map(),
      byEra: new Map()
    };
    this.isAnimating = false;
    this.init();
  }

  init() {
    if (!this.container) return;

    if (!this.peopleData && typeof window !== 'undefined' && window.allPeople) {
      this.peopleData = window.allPeople;
    }

    if (this.peopleData) {
      this.analyzeData();
      this.createHeatmap();
      this.attachEventListeners();
    }
  }

  analyzeData() {
    this.stats.byCountry = new Map();
    this.stats.byEra = new Map();

    const countryMap = {
      'Karachi': 'Pakistan',
      'Lahore': 'Pakistan',
      'Peshawar': 'Pakistan',
      'Quetta': 'Pakistan',
      'Rawalpindi': 'Pakistan',
      'Islamabad': 'Pakistan',
      'Gujranwala': 'Pakistan',
      'Kharian': 'Pakistan',
      'Pakistan': 'Pakistan',
      'Dubai': 'UAE',
      'UAE': 'UAE',
      'Toronto': 'Canada',
      'Canada': 'Canada',
      'US': 'USA',
      'USA': 'USA',
      'United States': 'USA',
      'Adelaide': 'Australia',
      'Australia': 'Australia',
      'New Zealand': 'New Zealand',
      'UK': 'UK',
      'England': 'UK',
      'Lucknow': 'India',
      'Murshidabad': 'India',
      'India': 'India',
      'East Pakistan': 'Bangladesh',
      'Bangladesh': 'Bangladesh'
    };

    // Count people by country
    this.peopleData.forEach(p => {
      if (p.residence) {
        const firstLocation = p.residence.split(/[,/]/)[0].trim();
        const country = countryMap[firstLocation] || null;

        if (country) {
          this.stats.byCountry.set(country, (this.stats.byCountry.get(country) || 0) + 1);
        }

        // Also categorize by era based on birth year
        const birthYear = this.extractYear(p.birth);
        if (birthYear) {
          const era = this.getEra(birthYear);
          if (!this.stats.byEra.has(era)) {
            this.stats.byEra.set(era, new Map());
          }
          const eraCountries = this.stats.byEra.get(era);
          eraCountries.set(country || 'Unknown', (eraCountries.get(country || 'Unknown') || 0) + 1);
        }
      }
    });
  }

  extractYear(dateStr) {
    if (!dateStr) return null;
    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0]) : null;
  }

  getEra(year) {
    if (year < 1927) return '1792-1927 (Lucknow)';
    if (year < 1950) return '1927-1950 (Murshidabad)';
    if (year < 1971) return '1950-1971 (East Pakistan)';
    if (year < 1980) return '1971-1980 (Pakistan dispersal)';
    if (year < 2000) return '1980-2000 (Gulf expansion)';
    return '2000+ (Global)';
  }

  createHeatmap() {
    // Create heatmap section
    const html = `
      <div class="heatmap-wrapper">
        <div class="heatmap-header">
          <h3>Geographic Distribution Heatmap</h3>
          <button class="heatmap-timeline-btn" id="playMigrationBtn" title="Play migration timeline animation">
            ▶ Play Migration Timeline
          </button>
        </div>

        <div class="heatmap-container" id="heatmapSvg"></div>

        <div class="heatmap-legend">
          <div class="legend-item">
            <span class="legend-color" style="background: #fee5d9;"></span>
            <span class="legend-label">1-5 people</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #fcae91;"></span>
            <span class="legend-label">5-10 people</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #fb6a4a;"></span>
            <span class="legend-label">10-15 people</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #de2d26;"></span>
            <span class="legend-label">15+ people</span>
          </div>
        </div>

        <div class="heatmap-timeline" id="heatmapTimeline">
          ${Array.from(this.stats.byEra.keys()).map(era => `
            <button class="timeline-era-btn" data-era="${era}">${era}</button>
          `).join('')}
        </div>

        <div class="heatmap-stats" id="heatmapStats"></div>
      </div>
    `;

    this.container.innerHTML = html;
    this.renderSvgMap();
    this.updateStats();
  }

  renderSvgMap() {
    const svgContainer = document.getElementById('heatmapSvg');
    if (!svgContainer) return;

    // Simple SVG world map with country heat coloring
    const countries = [
      { name: 'Pakistan', x: 280, y: 240, width: 60, height: 80 },
      { name: 'UAE', x: 320, y: 280, width: 30, height: 25 },
      { name: 'India', x: 290, y: 300, width: 50, height: 70 },
      { name: 'Bangladesh', x: 350, y: 290, width: 25, height: 35 },
      { name: 'Canada', x: 120, y: 100, width: 80, height: 90 },
      { name: 'USA', x: 100, y: 160, width: 70, height: 60 },
      { name: 'UK', x: 220, y: 80, width: 30, height: 20 },
      { name: 'Australia', x: 420, y: 380, width: 60, height: 50 },
      { name: 'New Zealand', x: 500, y: 420, width: 25, height: 20 }
    ];

    let svg = '<svg viewBox="0 0 600 500" class="heatmap-svg">\n';
    svg += '<rect width="600" height="500" fill="#e0f2fe"/>\n'; // Ocean background

    countries.forEach(country => {
      const count = this.stats.byCountry.get(country.name) || 0;
      const color = this.getHeatColor(count);
      const opacity = count > 0 ? 0.8 : 0.2;

      svg += `
        <rect
          class="country-rect"
          x="${country.x}"
          y="${country.y}"
          width="${country.width}"
          height="${country.height}"
          fill="${color}"
          opacity="${opacity}"
          data-country="${country.name}"
          data-count="${count}"
        />
        <text
          x="${country.x + country.width / 2}"
          y="${country.y + country.height / 2 + 5}"
          text-anchor="middle"
          font-size="10"
          font-weight="600"
          fill="#000"
          pointer-events="none"
        >${country.name.substring(0, 3).toUpperCase()}</text>
      `;

      // Add population label if has people
      if (count > 0) {
        svg += `
          <text
            x="${country.x + country.width / 2}"
            y="${country.y + country.height - 5}"
            text-anchor="middle"
            font-size="12"
            font-weight="bold"
            fill="#fff"
            pointer-events="none"
          >${count}</text>
        `;
      }
    });

    svg += '</svg>';
    svgContainer.innerHTML = svg;

    // Add interactivity
    svgContainer.querySelectorAll('.country-rect').forEach(rect => {
      rect.addEventListener('click', () => this.showCountryDetails(rect.dataset.country));
      rect.addEventListener('mouseover', () => this.highlightCountry(rect.dataset.country));
      rect.addEventListener('mouseout', () => this.unhighlightCountry());
    });
  }

  getHeatColor(count) {
    if (count === 0) return '#f0f0f0';
    if (count <= 5) return '#fee5d9';
    if (count <= 10) return '#fcae91';
    if (count <= 15) return '#fb6a4a';
    return '#de2d26';
  }

  highlightCountry(country) {
    document.querySelectorAll('.country-rect').forEach(rect => {
      if (rect.dataset.country === country) {
        rect.style.filter = 'brightness(1.2)';
        rect.style.strokeWidth = '2';
        rect.style.stroke = '#000';
      }
    });
  }

  unhighlightCountry() {
    document.querySelectorAll('.country-rect').forEach(rect => {
      rect.style.filter = '';
      rect.style.stroke = 'none';
    });
  }

  showCountryDetails(country) {
    const count = this.stats.byCountry.get(country) || 0;
    const percent = ((count / this.peopleData.length) * 100).toFixed(1);

    alert(`${country}\n\n${count} family member${count !== 1 ? 's' : ''}\n${percent}% of total population`);
  }

  updateStats() {
    const statsDiv = document.getElementById('heatmapStats');
    if (!statsDiv) return;

    const top3 = Array.from(this.stats.byCountry.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const statsHtml = `
      <div class="stats-summary">
        <h4>Top Locations</h4>
        <ul>
          ${top3.map(([country, count]) => `
            <li>${country}: <strong>${count}</strong> people</li>
          `).join('')}
        </ul>
      </div>
    `;

    statsDiv.innerHTML = statsHtml;
  }

  playMigrationTimeline() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const btn = document.getElementById('playMigrationBtn');
    btn.disabled = true;
    btn.textContent = '⏸ Animating...';

    const eras = Array.from(this.stats.byEra.keys());
    let eraIndex = 0;

    const showEra = () => {
      if (eraIndex >= eras.length) {
        this.isAnimating = false;
        btn.disabled = false;
        btn.textContent = '▶ Play Migration Timeline';
        return;
      }

      const era = eras[eraIndex];
      this.showEra(era);

      setTimeout(() => {
        eraIndex++;
        showEra();
      }, 2000); // 2 seconds per era
    };

    showEra();
  }

  showEra(era) {
    const eraData = this.stats.byEra.get(era);
    if (!eraData) return;

    // Update heatmap with era-specific data
    document.querySelectorAll('.country-rect').forEach(rect => {
      const country = rect.dataset.country;
      const count = eraData.get(country) || 0;
      rect.style.opacity = count > 0 ? '0.8' : '0.2';
      rect.style.fill = this.getHeatColor(count);

      // Update count label
      const label = rect.parentNode.querySelector('text:last-of-type');
      if (label && count > 0) {
        label.textContent = count;
      }
    });

    // Update era buttons
    document.querySelectorAll('.timeline-era-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.era === era) {
        btn.classList.add('active');
      }
    });

    // Update title
    document.querySelector('.heatmap-header h3').textContent = `Family Diaspora: ${era}`;
  }

  attachEventListeners() {
    const playBtn = document.getElementById('playMigrationBtn');
    if (playBtn) {
      playBtn.addEventListener('click', () => this.playMigrationTimeline());
    }

    document.querySelectorAll('.timeline-era-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.showEra(e.target.dataset.era);
      });
    });
  }

  updateData(peopleData) {
    this.peopleData = peopleData;
    this.analyzeData();
    this.renderSvgMap();
    this.updateStats();
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  window.GeographicHeatmap = GeographicHeatmap;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#heatmap-container') && window.allPeople) {
      window.geographicHeatmap = new GeographicHeatmap('#heatmap-container', window.allPeople);
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = GeographicHeatmap;
}
