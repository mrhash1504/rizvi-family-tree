/* Role & Status Badges
 * Visual indicators for patriarch/matriarch, location, deceased, most-connected status
 */

class BadgesRenderer {
  constructor(peopleData = null) {
    this.peopleData = peopleData;
    this.stats = {
      byId: new Map(),
      children: new Map(),
      descendantCounts: new Map(),
      locationMap: new Map()
    };
    this.init();
  }

  init() {
    if (!this.peopleData && typeof window !== 'undefined' && window.allPeople) {
      this.peopleData = window.allPeople;
    }

    if (this.peopleData) {
      this.buildIndex();
      this.attachObserver();
    }
  }

  buildIndex() {
    this.stats.byId = new Map();
    this.stats.children = new Map();
    this.stats.descendantCounts = new Map();
    this.stats.locationMap = new Map();

    // Build basic index
    this.peopleData.forEach(p => {
      this.stats.byId.set(p.id, p);
      if (p.parent) {
        if (!this.stats.children.has(p.parent)) {
          this.stats.children.set(p.parent, []);
        }
        this.stats.children.get(p.parent).push(p);
      }

      // Index locations
      if (p.residence) {
        const location = p.residence.split(/[,/]/)[0].trim();
        if (!this.stats.locationMap.has(location)) {
          this.stats.locationMap.set(location, []);
        }
        this.stats.locationMap.get(location).push(p.id);
      }
    });

    // Calculate descendant counts
    this.calculateDescendants();
  }

  calculateDescendants() {
    const counts = new Map();

    // Count descendants for each person
    const countDesc = (id, depth = 0) => {
      if (depth > 50) return 0; // Prevent infinite recursion
      const children = this.stats.children.get(id) || [];
      let count = children.length;
      children.forEach(child => {
        count += countDesc(child.id, depth + 1);
      });
      return count;
    };

    this.stats.byId.forEach((person, id) => {
      const count = countDesc(id);
      counts.set(id, count);
    });

    this.stats.descendantCounts = counts;
  }

  attachObserver() {
    // Watch for tree changes and update badges
    const treeHost = document.querySelector('#treeHost');
    if (treeHost) {
      const observer = new MutationObserver(() => {
        this.updateBadges();
      });

      observer.observe(treeHost, { childList: true, subtree: true });
    }

    // Also update on first load
    setTimeout(() => this.updateBadges(), 500);
  }

  updateBadges() {
    const treeHost = document.querySelector('#treeHost');
    if (!treeHost) return;

    // Find all person nodes
    const personButtons = treeHost.querySelectorAll('[data-person-id]');

    personButtons.forEach(btn => {
      const personId = btn.getAttribute('data-person-id');
      const person = this.stats.byId.get(personId);

      if (!person) return;

      // Get or create badge container
      let badgeContainer = btn.querySelector('.enhanced-badges');
      if (!badgeContainer) {
        badgeContainer = document.createElement('span');
        badgeContainer.className = 'enhanced-badges';
        btn.insertBefore(badgeContainer, btn.firstChild);
      } else {
        badgeContainer.innerHTML = '';
      }

      // Add badges
      const badges = [];

      // 1. Patriarch/Matriarch badge
      if (this.isPatriarch(personId)) {
        badges.push(this.createBadge('patriarch', '👨‍👩‍👧‍👦', 'Patriarch/Matriarch'));
      }

      // 2. Location badge
      if (person.residence) {
        const flag = this.getCountryFlag(person.residence);
        if (flag) {
          const location = person.residence.split(/[,/]/)[0].trim();
          badges.push(this.createBadge('location', flag, `${location}`));
        }
      }

      // 3. Deceased marker
      if (person.death) {
        badges.push(this.createBadge('deceased', '✝', 'Deceased'));
      }

      // 4. Most connected (top 5 most descendants)
      const descendants = this.stats.descendantCounts.get(personId) || 0;
      if (descendants > 0) {
        const allCounts = Array.from(this.stats.descendantCounts.values()).sort((a, b) => b - a);
        const threshold = allCounts[Math.min(4, allCounts.length - 1)]; // Top 5

        if (descendants >= threshold && descendants > 2) {
          badges.push(this.createBadge(
            'connected',
            '✨',
            `${descendants} descendant${descendants !== 1 ? 's' : ''}`
          ));
        }
      }

      // Add all badges to container
      badges.forEach(badge => badgeContainer.appendChild(badge));
    });
  }

  createBadge(type, icon, title) {
    const badge = document.createElement('span');
    badge.className = `badge badge-${type}`;
    badge.setAttribute('title', title);
    badge.textContent = icon;
    return badge;
  }

  isPatriarch(personId) {
    const key = 'hussain-ali-rizvi'; // Updated patriarch ID
    return personId === key;
  }

  getCountryFlag(residence) {
    if (!residence) return null;

    const flags = {
      'Karachi': '🇵🇰',
      'Lahore': '🇵🇰',
      'Peshawar': '🇵🇰',
      'Quetta': '🇵🇰',
      'Rawalpindi': '🇵🇰',
      'Islamabad': '🇵🇰',
      'Gujranwala': '🇵🇰',
      'Kharian': '🇵🇰',
      'Pakistan': '🇵🇰',
      'Dubai': '🇦🇪',
      'UAE': '🇦🇪',
      'Toronto': '🇨🇦',
      'Canada': '🇨🇦',
      'US': '🇺🇸',
      'USA': '🇺🇸',
      'United States': '🇺🇸',
      'Adelaide': '🇦🇺',
      'Australia': '🇦🇺',
      'New Zealand': '🇳🇿',
      'UK': '🇬🇧',
      'England': '🇬🇧',
      'Lucknow': '🇮🇳',
      'Murshidabad': '🇮🇳',
      'India': '🇮🇳',
      'East Pakistan': '🇧🇩',
      'Bangladesh': '🇧🇩'
    };

    // Try to find matching location
    for (const [location, flag] of Object.entries(flags)) {
      if (residence.includes(location)) {
        return flag;
      }
    }

    return null;
  }

  updateData(peopleData) {
    this.peopleData = peopleData;
    this.buildIndex();
    this.updateBadges();
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  window.BadgesRenderer = BadgesRenderer;

  document.addEventListener('DOMContentLoaded', () => {
    if (window.allPeople) {
      window.badgesRenderer = new BadgesRenderer(window.allPeople);
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = BadgesRenderer;
}
