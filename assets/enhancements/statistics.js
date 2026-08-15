/* Family Tree Statistics Calculator
 * Generates insights for animated stats cards and dashboard
 * Processes all 104 family members
 */

class FamilyStatistics {
  constructor(people) {
    this.people = people;
    this.calculate();
  }

  calculate() {
    this.stats = {
      total: this.people.length,
      living: this.countLiving(),
      deceased: this.countDeceased(),
      averageLifespan: this.calculateAverageLifespan(),
      mostCommonBirthMonth: this.getMostCommonBirthMonth(),
      largestBranch: this.findLargestBranch(),
      genderDistribution: this.calculateGenderDistribution(),
      ageDistribution: this.calculateAgeDistribution(),
      birthDecadeBreakdown: this.calculateBirthDecadeBreakdown(),
      lifespanTrend: this.calculateLifespanTrend(),
      geographicSpread: this.calculateGeographicSpread(),
      generationStats: this.calculateGenerationStats()
    };
  }

  countLiving() {
    return this.people.filter(p => !p.death || p.death === '').length;
  }

  countDeceased() {
    return this.people.filter(p => p.death && p.death !== '').length;
  }

  calculateAverageLifespan() {
    const withDates = this.people.filter(p => {
      const birthYear = this.extractYear(p.birth);
      const deathYear = this.extractYear(p.death);
      return birthYear && deathYear;
    });

    if (withDates.length === 0) return null;

    const totalYears = withDates.reduce((sum, p) => {
      const birthYear = this.extractYear(p.birth);
      const deathYear = this.extractYear(p.death);
      return sum + (deathYear - birthYear);
    }, 0);

    return Math.round(totalYears / withDates.length);
  }

  extractYear(dateStr) {
    if (!dateStr) return null;
    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0]) : null;
  }

  getMostCommonBirthMonth() {
    const months = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.people.forEach(p => {
      const match = p.birth?.match(/(\d{1,2})\s+\w+|(\w+)\s+\d{1,2}/i);
      if (match) {
        const dateStr = p.birth.toLowerCase();
        for (let i = 0; i < monthNames.length; i++) {
          if (dateStr.includes(monthNames[i].toLowerCase())) {
            months[i] = (months[i] || 0) + 1;
            break;
          }
        }
      }
    });

    if (Object.keys(months).length === 0) return null;

    const maxMonth = Object.keys(months).reduce((a, b) => months[a] > months[b] ? a : b);
    return {
      month: monthNames[maxMonth],
      count: months[maxMonth]
    };
  }

  findLargestBranch() {
    const branches = {};

    this.people.forEach(p => {
      if (p.parent) {
        branches[p.parent] = (branches[p.parent] || 0) + 1;
      }
    });

    if (Object.keys(branches).length === 0) return null;

    const largestParentId = Object.keys(branches).reduce((a, b) => branches[a] > branches[b] ? a : b);
    const largestParent = this.people.find(p => p.id === largestParentId);

    return {
      name: largestParent?.name || largestParentId,
      children: branches[largestParentId]
    };
  }

  calculateGenderDistribution() {
    const male = this.people.filter(p => p.name?.toLowerCase().includes('syed') || p.name?.includes('Ali') || p.name?.includes('Raza')).length; // Simple heuristic
    const female = this.people.filter(p => p.name?.includes('Begum') || p.name?.includes('Fatima') || p.name?.includes('Zehra')).length;
    const unknown = this.people.length - male - female;

    return {
      male: { count: male, percentage: Math.round((male / this.people.length) * 100) },
      female: { count: female, percentage: Math.round((female / this.people.length) * 100) },
      unknown: { count: unknown, percentage: Math.round((unknown / this.people.length) * 100) }
    };
  }

  calculateAgeDistribution() {
    const now = new Date().getFullYear();
    const ages = [];

    this.people.forEach(p => {
      const birthYear = this.extractYear(p.birth);
      if (birthYear) {
        const age = now - birthYear;
        ages.push(age);
      }
    });

    const ranges = {
      '0-10': ages.filter(a => a >= 0 && a < 10).length,
      '10-20': ages.filter(a => a >= 10 && a < 20).length,
      '20-30': ages.filter(a => a >= 20 && a < 30).length,
      '30-40': ages.filter(a => a >= 30 && a < 40).length,
      '40-50': ages.filter(a => a >= 40 && a < 50).length,
      '50-60': ages.filter(a => a >= 50 && a < 60).length,
      '60+': ages.filter(a => a >= 60).length
    };

    return ranges;
  }

  calculateBirthDecadeBreakdown() {
    const decades = {};

    this.people.forEach(p => {
      const year = this.extractYear(p.birth);
      if (year) {
        const decade = Math.floor(year / 10) * 10;
        const decadeLabel = `${decade}s`;
        decades[decadeLabel] = (decades[decadeLabel] || 0) + 1;
      }
    });

    return decades;
  }

  calculateLifespanTrend() {
    // Group by generation and calculate average lifespan
    const generations = {};

    this.people.forEach(p => {
      const birthYear = this.extractYear(p.birth);
      if (birthYear) {
        const generation = Math.floor(birthYear / 20) * 20;
        if (!generations[generation]) {
          generations[generation] = { births: 0, lifespans: [] };
        }
        generations[generation].births++;

        const deathYear = this.extractYear(p.death);
        if (deathYear) {
          generations[generation].lifespans.push(deathYear - birthYear);
        }
      }
    });

    return Object.keys(generations)
      .sort()
      .map(gen => ({
        generation: gen,
        births: generations[gen].births,
        avgLifespan: generations[gen].lifespans.length > 0
          ? Math.round(generations[gen].lifespans.reduce((a, b) => a + b, 0) / generations[gen].lifespans.length)
          : null
      }));
  }

  calculateGeographicSpread() {
    const countries = {};
    const countryMap = {
      'Dubai': 'UAE', 'Karachi': 'Pakistan', 'Lahore': 'Pakistan', 'Peshawar': 'Pakistan',
      'Quetta': 'Pakistan', 'Rawalpindi': 'Pakistan', 'Islamabad': 'Pakistan',
      'Toronto': 'Canada', 'Canada': 'Canada', 'US': 'USA', 'USA': 'USA',
      'Adelaide': 'Australia', 'New Zealand': 'New Zealand', 'UK': 'UK',
      'Lucknow': 'India', 'Murshidabad': 'India'
    };

    this.people.forEach(p => {
      if (p.residence) {
        const firstLocation = p.residence.split(/[,/]/)[0].trim();
        const country = countryMap[firstLocation] || 'Other';
        countries[country] = (countries[country] || 0) + 1;
      }
    });

    return Object.entries(countries)
      .map(([country, count]) => ({
        country,
        count,
        percentage: Math.round((count / this.people.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  calculateGenerationStats() {
    const generations = {};

    this.people.forEach(p => {
      const generation = this.getGeneration(p);
      generations[generation] = (generations[generation] || 0) + 1;
    });

    return generations;
  }

  getGeneration(person) {
    const birthYear = this.extractYear(person.birth);
    if (!birthYear) return 'Unknown';

    if (birthYear < 1850) return 'Gen 1';
    if (birthYear < 1920) return 'Gen 2';
    if (birthYear < 1945) return 'Gen 3';
    if (birthYear < 1965) return 'Gen 4';
    if (birthYear < 1980) return 'Gen 5';
    if (birthYear < 1995) return 'Gen 6';
    return 'Gen 7';
  }
}

// Export for use in app.js
if (typeof window !== 'undefined') {
  window.FamilyStatistics = FamilyStatistics;
}
if (typeof module !== 'undefined') {
  module.exports = FamilyStatistics;
}
