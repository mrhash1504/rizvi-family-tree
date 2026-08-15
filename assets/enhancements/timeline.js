/* Birth/Death Timeline Chart
 * Horizontal timeline showing family life events from 1792-2026
 */

class TimelineChart {
  constructor(containerSelector = '#timeline-container', peopleData = null) {
    this.container = document.querySelector(containerSelector);
    this.peopleData = peopleData;
    this.events = [];
    this.init();
  }

  init() {
    if (!this.container) return;

    if (!this.peopleData && typeof window !== 'undefined' && window.allPeople) {
      this.peopleData = window.allPeople;
    }

    if (this.peopleData) {
      this.extractEvents();
      this.createTimeline();
      this.attachEventListeners();
    }
  }

  extractEvents() {
    this.events = [];

    this.peopleData.forEach(person => {
      // Birth event
      const birthYear = this.extractYear(person.birth);
      if (birthYear && birthYear >= 1790 && birthYear <= 2026) {
        this.events.push({
          year: birthYear,
          type: 'birth',
          person: person.name,
          personId: person.id,
          date: person.birth,
          details: `Born: ${person.birth}`
        });
      }

      // Death event
      const deathYear = this.extractYear(person.death);
      if (deathYear && deathYear >= 1790 && deathYear <= 2026) {
        this.events.push({
          year: deathYear,
          type: 'death',
          person: person.name,
          personId: person.id,
          date: person.death,
          details: `Died: ${person.death}`
        });
      }
    });

    // Sort by year
    this.events.sort((a, b) => a.year - b.year);
  }

  extractYear(dateStr) {
    if (!dateStr) return null;
    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0]) : null;
  }

  createTimeline() {
    const html = `
      <div class="timeline-wrapper">
        <div class="timeline-header">
          <h3>Family Timeline (1792–2026)</h3>
          <div class="timeline-stats">
            <span>${this.events.filter(e => e.type === 'birth').length} births</span>
            <span>${this.events.filter(e => e.type === 'death').length} deaths</span>
          </div>
        </div>

        <div class="timeline-chart">
          <div class="timeline-axis" id="timelineAxis"></div>
          <div class="timeline-events" id="timelineEvents"></div>
        </div>

        <div class="timeline-legend">
          <div class="legend-item">
            <span class="dot birth-dot"></span>
            <span>Birth</span>
          </div>
          <div class="legend-item">
            <span class="dot death-dot"></span>
            <span>Death</span>
          </div>
        </div>

        <div class="timeline-details" id="timelineDetails"></div>
      </div>
    `;

    this.container.innerHTML = html;
    this.renderTimelineAxis();
    this.renderTimelineEvents();
  }

  renderTimelineAxis() {
    const axis = document.getElementById('timelineAxis');
    if (!axis) return;

    const minYear = 1790;
    const maxYear = 2030;
    const range = maxYear - minYear;

    // Create year markers
    let axisHtml = '';
    for (let year = 1800; year <= 2020; year += 20) {
      const percent = ((year - minYear) / range) * 100;
      axisHtml += `
        <div class="timeline-marker" style="left: ${percent}%">
          <div class="marker-line"></div>
          <div class="marker-label">${year}</div>
        </div>
      `;
    }

    axis.innerHTML = `<div class="axis-track">${axisHtml}</div>`;
  }

  renderTimelineEvents() {
    const eventsDiv = document.getElementById('timelineEvents');
    if (!eventsDiv) return;

    const minYear = 1790;
    const maxYear = 2030;
    const range = maxYear - minYear;

    let eventsHtml = '';
    this.events.forEach((event, index) => {
      const percent = ((event.year - minYear) / range) * 100;
      const dotClass = event.type === 'birth' ? 'birth-dot' : 'death-dot';
      const icon = event.type === 'birth' ? '👶' : '💀';

      eventsHtml += `
        <div
          class="timeline-event"
          style="left: ${percent}%"
          data-index="${index}"
          data-year="${event.year}"
          data-type="${event.type}"
        >
          <div class="event-dot ${dotClass}" title="${event.details}">
            ${icon}
          </div>
        </div>
      `;
    });

    eventsDiv.innerHTML = eventsHtml;
  }

  attachEventListeners() {
    document.querySelectorAll('.timeline-event').forEach(event => {
      event.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.showEventDetails(this.events[index]);
      });

      event.addEventListener('mouseover', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        const evt = this.events[index];
        this.highlightEvent(evt);
      });

      event.addEventListener('mouseout', () => {
        this.unhighlightEvents();
      });
    });
  }

  showEventDetails(event) {
    const detailsDiv = document.getElementById('timelineDetails');
    if (!detailsDiv) return;

    const lifespan = this.calculateLifespan(event.person);
    const age = lifespan ? ` (age ${lifespan})` : '';

    const html = `
      <div class="event-detail">
        <strong>${event.person}</strong>
        <br>
        <span class="detail-type">${event.type === 'birth' ? '👶 Born' : '💀 Died'}</span>
        <br>
        <span class="detail-year">${event.year}</span>
        ${age}
        <br>
        <span class="detail-date">${event.date}</span>
      </div>
    `;

    detailsDiv.innerHTML = html;
  }

  highlightEvent(event) {
    document.querySelectorAll('.timeline-event').forEach(el => {
      if (el.dataset.index === String(this.events.indexOf(event))) {
        el.classList.add('highlighted');
      }
    });
  }

  unhighlightEvents() {
    document.querySelectorAll('.timeline-event').forEach(el => {
      el.classList.remove('highlighted');
    });
  }

  calculateLifespan(personName) {
    const births = this.events.filter(e => e.type === 'birth' && e.person === personName);
    const deaths = this.events.filter(e => e.type === 'death' && e.person === personName);

    if (births.length > 0 && deaths.length > 0) {
      return deaths[0].year - births[0].year;
    }
    return null;
  }

  updateData(peopleData) {
    this.peopleData = peopleData;
    this.extractEvents();
    this.createTimeline();
    this.attachEventListeners();
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  window.TimelineChart = TimelineChart;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#timeline-container') && window.allPeople) {
      window.timelineChart = new TimelineChart('#timeline-container', window.allPeople);
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = TimelineChart;
}
