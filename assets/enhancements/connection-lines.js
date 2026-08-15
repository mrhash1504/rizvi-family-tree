/* Relationship Connection Lines
 * SVG overlay drawing spouse, sibling, and parent-child connections
 * Animated on hover with toggle control
 */

class ConnectionLines {
  constructor(treeHostSelector = '#treeHost', peopleData = null) {
    this.treeHost = document.querySelector(treeHostSelector);
    this.peopleData = peopleData;
    this.svg = null;
    this.lines = [];
    this.isEnabled = true;
    this.hoveredId = null;
    this.state = {
      byId: new Map(),
      children: new Map()
    };
    this.init();
  }

  init() {
    if (!this.treeHost) return;

    // Use window data if provided
    if (!this.peopleData && typeof window !== 'undefined' && window.allPeople) {
      this.peopleData = window.allPeople;
    }

    if (this.peopleData) {
      this.buildIndex();
      this.createSVGOverlay();
      this.attachEventListeners();
    }
  }

  buildIndex() {
    this.state.byId = new Map();
    this.state.children = new Map();

    this.peopleData.forEach(p => {
      this.state.byId.set(p.id, p);
      if (p.parent && this.state.byId.has(p.parent)) {
        if (!this.state.children.has(p.parent)) {
          this.state.children.set(p.parent, []);
        }
        this.state.children.get(p.parent).push(p);
      }
    });
  }

  createSVGOverlay() {
    // Create SVG container
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.id = 'connection-lines-svg';
    this.svg.classList.add('connection-lines-svg');
    this.svg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
    `;

    // Container for tree needs position: relative for SVG to work
    if (this.treeHost.style.position !== 'relative' && this.treeHost.style.position !== 'absolute') {
      this.treeHost.style.position = 'relative';
    }

    this.treeHost.insertBefore(this.svg, this.treeHost.firstChild);

    // Create line groups
    this.createLineGroup('parent-child', '#9CA3AF', 'Parent-child');
    this.createLineGroup('spouse', '#EC4899', 'Spouse');
    this.createLineGroup('sibling', '#3B82F6', 'Sibling');
  }

  createLineGroup(id, color, label) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.id = `lines-${id}`;
    group.classList.add('connection-group');

    // Define style for this group
    const style = `
      .connection-group line {
        stroke: ${color};
        stroke-width: 2;
        opacity: 0.5;
        transition: opacity 0.3s ease, stroke-width 0.3s ease;
      }
      .connection-group.active line {
        opacity: 0.8;
        stroke-width: 3;
      }
      .connection-group line:hover {
        opacity: 1;
        stroke-width: 4;
      }
    `;

    this.svg.appendChild(group);
  }

  drawConnections() {
    if (!this.svg) return;

    // Clear existing lines
    this.svg.querySelectorAll('line').forEach(line => line.remove());

    // Draw all connections
    this.drawParentChildConnections();
    this.drawSpouseConnections();
    this.drawSiblingConnections();

    // Resize SVG to match tree container
    this.resizeSVG();
  }

  drawParentChildConnections() {
    const group = this.svg.querySelector('#lines-parent-child');
    if (!group) return;

    this.state.byId.forEach((person, id) => {
      if (person.parent && this.state.byId.has(person.parent)) {
        const parentEl = document.querySelector(`[data-person-id="${person.parent}"]`);
        const childEl = document.querySelector(`[data-person-id="${id}"]`);

        if (parentEl && childEl) {
          const line = this.createLine(
            this.getElementCenter(parentEl),
            this.getElementCenter(childEl),
            `parent-${person.parent}-to-child-${id}`
          );
          group.appendChild(line);
        }
      }
    });
  }

  drawSpouseConnections() {
    const group = this.svg.querySelector('#lines-spouse');
    if (!group) return;

    // Draw lines between people with spouse relationships
    const drawn = new Set();

    this.state.byId.forEach((person, id) => {
      if (person.spouse) {
        // Find spouse in data
        let spouseId = null;
        this.state.byId.forEach((p, pId) => {
          if (p.name === person.spouse && !drawn.has(`${pId}-${id}`) && !drawn.has(`${id}-${pId}`)) {
            spouseId = pId;
          }
        });

        if (spouseId) {
          const personEl = document.querySelector(`[data-person-id="${id}"]`);
          const spouseEl = document.querySelector(`[data-person-id="${spouseId}"]`);

          if (personEl && spouseEl) {
            const line = this.createLine(
              this.getElementCenter(personEl),
              this.getElementCenter(spouseEl),
              `spouse-${id}-to-${spouseId}`
            );
            group.appendChild(line);
            drawn.add(`${id}-${spouseId}`);
          }
        }
      }
    });
  }

  drawSiblingConnections() {
    const group = this.svg.querySelector('#lines-sibling');
    if (!group) return;

    const drawn = new Set();

    // Group children by parent
    this.state.children.forEach((children, parentId) => {
      if (children.length > 1) {
        // Draw lines between siblings
        for (let i = 0; i < children.length; i++) {
          for (let j = i + 1; j < children.length; j++) {
            const sibling1Id = children[i].id;
            const sibling2Id = children[j].id;

            if (!drawn.has(`${sibling1Id}-${sibling2Id}`)) {
              const el1 = document.querySelector(`[data-person-id="${sibling1Id}"]`);
              const el2 = document.querySelector(`[data-person-id="${sibling2Id}"]`);

              if (el1 && el2) {
                const line = this.createLine(
                  this.getElementCenter(el1),
                  this.getElementCenter(el2),
                  `sibling-${sibling1Id}-to-${sibling2Id}`
                );
                group.appendChild(line);
                drawn.add(`${sibling1Id}-${sibling2Id}`);
              }
            }
          }
        }
      }
    });
  }

  createLine(from, to, id) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.id = id;
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.style.cursor = 'pointer';

    // Add hover effect data
    line.dataset.relationshipId = id;

    return line;
  }

  getElementCenter(el) {
    const rect = el.getBoundingClientRect();
    const containerRect = this.treeHost.getBoundingClientRect();

    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    };
  }

  resizeSVG() {
    if (!this.svg) return;

    const rect = this.treeHost.getBoundingClientRect();
    this.svg.setAttribute('width', rect.width);
    this.setAttribute('height', rect.height);

    // Add viewBox for responsiveness
    this.svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  }

  attachEventListeners() {
    // Redraw on window resize
    window.addEventListener('resize', () => this.drawConnections());

    // Redraw when tree is rendered
    if (this.treeHost) {
      const observer = new MutationObserver(() => {
        this.drawConnections();
      });
      observer.observe(this.treeHost, { childList: true, subtree: true });
    }

    // Line hover effects
    this.svg.addEventListener('mouseover', (e) => {
      if (e.target.tagName === 'line') {
        e.target.parentElement.classList.add('active');
        this.hoveredId = e.target.dataset.relationshipId;
      }
    });

    this.svg.addEventListener('mouseout', (e) => {
      if (e.target.tagName === 'line') {
        e.target.parentElement.classList.remove('active');
        this.hoveredId = null;
      }
    });
  }

  toggle() {
    if (this.isEnabled) {
      this.svg.style.display = 'none';
      this.isEnabled = false;
    } else {
      this.svg.style.display = '';
      this.isEnabled = true;
    }
  }

  show() {
    if (this.svg) this.svg.style.display = '';
    this.isEnabled = true;
  }

  hide() {
    if (this.svg) this.svg.style.display = 'none';
    this.isEnabled = false;
  }

  updateData(peopleData) {
    this.peopleData = peopleData;
    this.buildIndex();
    this.drawConnections();
  }
}

// Auto-initialize on DOMContentLoaded
if (typeof window !== 'undefined') {
  window.ConnectionLines = ConnectionLines;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#treeHost') && window.allPeople) {
      window.connectionLines = new ConnectionLines('#treeHost', window.allPeople);
      setTimeout(() => {
        window.connectionLines.drawConnections();
      }, 500);
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = ConnectionLines;
}
