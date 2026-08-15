/* Statistics Cards Renderer
 * Connects FamilyStatistics calculator to DOM, handles animations
 */

class StatsRenderer {
  constructor(containerSelector = '#stats-container', peopleData = null) {
    this.container = document.querySelector(containerSelector);
    this.peopleData = peopleData;
    this.stats = null;
    this.isVisible = false;
    this.init();
  }

  init() {
    if (!this.container) return;

    // Initialize from window data if available
    if (!this.peopleData && typeof window !== 'undefined' && window.allPeople) {
      this.peopleData = window.allPeople;
    }

    if (this.peopleData) {
      this.calculateStats();
      this.renderStats();
      this.attachEventListeners();
      this.show();
    }
  }

  calculateStats() {
    if (!window.FamilyStatistics) {
      console.error('FamilyStatistics not loaded');
      return;
    }

    const calculator = new FamilyStatistics(this.peopleData);
    this.stats = calculator.stats;
  }

  renderStats() {
    if (!this.stats) return;

    // Update main cards
    this.updateMainCards();

    // Update distribution
    this.updateGeographicDistribution();

    // Update generations
    this.updateGenerationStats();

    // Update age distribution
    this.updateAgeDistribution();
  }

  updateMainCards() {
    // Total members
    const totalCard = this.container.querySelector('.stat-card:nth-child(1) .stat-value');
    if (totalCard) {
      this.animateCounter(totalCard, this.stats.total);
    }

    // Living members
    const livingCard = this.container.querySelector('.stat-card:nth-child(2) .stat-value');
    if (livingCard) {
      this.animateCounter(livingCard, this.stats.living);
    }

    // Average lifespan
    const lifespanCard = this.container.querySelector('.stat-card:nth-child(3) .stat-value');
    if (lifespanCard && this.stats.averageLifespan) {
      this.animateCounter(
        lifespanCard,
        this.stats.averageLifespan,
        (val) => `${val}<span class="unit">yrs</span>`
      );
    }

    // Most common birth month
    const monthCard = this.container.querySelector('.stat-card:nth-child(4) .stat-value');
    if (monthCard && this.stats.mostCommonBirthMonth) {
      monthCard.innerHTML = `${this.stats.mostCommonBirthMonth.month}<span class="count">(${this.stats.mostCommonBirthMonth.count})</span>`;
    }
  }

  updateGeographicDistribution() {
    const geoContainer = this.container.querySelector('#geo-distribution');
    if (!geoContainer) return;

    geoContainer.innerHTML = '';

    const countryFlags = {
      'Pakistan': '🇵🇰',
      'UAE': '🇦🇪',
      'Canada': '🇨🇦',
      'USA': '🇺🇸',
      'India': '🇮🇳',
      'Australia': '🇦🇺',
      'New Zealand': '🇳🇿',
      'UK': '🇬🇧'
    };

    this.stats.geographicSpread.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'distribution-item';
      div.style.animationDelay = `${0.1 + index * 0.1}s`;

      const flag = countryFlags[item.country] || '🌍';

      div.innerHTML = `
        <div class="distribution-flag">${flag}</div>
        <div class="distribution-country">${item.country}</div>
        <div class="distribution-count">${item.count}</div>
        <div class="distribution-percentage">${item.percentage}%</div>
      `;

      geoContainer.appendChild(div);
    });
  }

  updateGenerationStats() {
    const genContainer = this.container.querySelector('#generation-distribution');
    if (!genContainer) return;

    genContainer.innerHTML = '';

    const generationEmojis = {
      'Gen 1': '👴',
      'Gen 2': '👨‍🦳',
      'Gen 3': '👨‍🦱',
      'Gen 4': '👨',
      'Gen 5': '👦',
      'Gen 6': '👶',
      'Gen 7': '👼'
    };

    let index = 0;
    Object.entries(this.stats.generationStats).forEach(([gen, count]) => {
      const div = document.createElement('div');
      div.className = 'generation-item';
      div.style.animationDelay = `${0.1 + index * 0.1}s`;

      const emoji = generationEmojis[gen] || '👤';

      div.innerHTML = `
        <div class="generation-label">${emoji} ${gen}</div>
        <div class="generation-number">${count}</div>
      `;

      genContainer.appendChild(div);
      index++;
    });
  }

  updateAgeDistribution() {
    const ageDistribution = this.stats.ageDistribution;
    const ranges = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60+'];

    if (!ageDistribution || Object.keys(ageDistribution).length === 0) {
      return;
    }

    const maxCount = Math.max(...Object.values(ageDistribution));

    ranges.forEach(range => {
      const bar = this.container.querySelector(`.age-bar[data-range="${range}"]`);
      if (bar) {
        const count = ageDistribution[range] || 0;
        const percentage = (count / maxCount) * 100;
        bar.style.setProperty('--width', percentage / 100);

        // Add hover tooltip
        bar.title = `Age ${range}: ${count} people`;
      }
    });
  }

  animateCounter(element, targetValue, formatter = null) {
    const duration = 1500;
    const start = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.round(start + (targetValue - start) * easeProgress);

      if (formatter) {
        element.innerHTML = formatter(currentValue);
      } else {
        element.textContent = currentValue;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  show() {
    if (this.container) {
      this.container.classList.remove('hidden');
      this.isVisible = true;
    }
  }

  hide() {
    if (this.container) {
      this.container.classList.add('hidden');
      this.isVisible = false;
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  attachEventListeners() {
    const toggleBtn = this.container.querySelector('#stats-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  // Public API to update with new data
  updateData(peopleData) {
    this.peopleData = peopleData;
    this.calculateStats();
    this.renderStats();
  }
}

// Auto-initialize on DOMContentLoaded if element exists
if (typeof window !== 'undefined') {
  window.StatsRenderer = StatsRenderer;

  document.addEventListener('DOMContentLoaded', () => {
    // Check if stats container exists
    if (document.querySelector('#stats-container')) {
      // Check if data is available
      if (window.allPeople && window.FamilyStatistics) {
        window.statsRenderer = new StatsRenderer('#stats-container', window.allPeople);
      }
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = StatsRenderer;
}
