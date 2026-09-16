/**
 * V MARK CORPORATION - 3D ENGRAVING PLANT WORKFLOW ENGINE
 * Controls the interactive factory layout simulation based on Brochure Page 12.
 */

class PlantWorkflowEngine {
  constructor() {
    this.stations = typeof VMARK_PLANT_STATIONS !== 'undefined' ? VMARK_PLANT_STATIONS : [];
    this.currentIndex = 0;
    this.pillsContainer = document.getElementById('workflowStationsPills');
    this.stepBadge = document.getElementById('workflowStepBadge');
    this.titleElem = document.getElementById('workflowStationTitle');
    this.descElem = document.getElementById('workflowStationDesc');
    this.actionElem = document.getElementById('workflowActionText');
    this.prevBtn = document.getElementById('workflowPrevBtn');
    this.nextBtn = document.getElementById('workflowNextBtn');
    
    if (this.stations.length > 0 && this.titleElem) {
      this.init();
    }
  }

  init() {
    this.renderPills();
    this.updateStation(0);
    this.attachEvents();
  }

  renderPills() {
    if (!this.pillsContainer) return;
    this.pillsContainer.innerHTML = '';
    
    this.stations.forEach((st, idx) => {
      const btn = document.createElement('button');
      btn.className = `station-pill-btn ${idx === 0 ? 'active' : ''}`;
      btn.type = 'button';
      btn.innerText = st.num;
      btn.setAttribute('aria-label', `Station ${st.num}: ${st.name}`);
      btn.title = `${st.num}. ${st.name}`;
      btn.addEventListener('click', () => this.updateStation(idx));
      this.pillsContainer.appendChild(btn);
    });
  }

  updateStation(index) {
    if (index < 0 || index >= this.stations.length) return;
    this.currentIndex = index;
    const st = this.stations[index];

    if (this.stepBadge) this.stepBadge.textContent = `Station ${st.num} of ${this.stations.length}`;
    if (this.titleElem) this.titleElem.textContent = `${st.num}. ${st.name}`;
    if (this.descElem) this.descElem.textContent = st.desc;
    if (this.actionElem) this.actionElem.textContent = `Process Role: ${st.action}`;

    // Update pills active state
    if (this.pillsContainer) {
      const pillBtns = this.pillsContainer.querySelectorAll('.station-pill-btn');
      pillBtns.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });
    }

    // Update button states
    if (this.prevBtn) this.prevBtn.disabled = (index === 0);
    if (this.nextBtn) this.nextBtn.disabled = (index === this.stations.length - 1);
  }

  next() {
    if (this.currentIndex < this.stations.length - 1) {
      this.updateStation(this.currentIndex + 1);
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.updateStation(this.currentIndex - 1);
    }
  }

  attachEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.plantWorkflow = new PlantWorkflowEngine();
});
