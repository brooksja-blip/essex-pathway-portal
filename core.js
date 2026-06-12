// Pathway Portal core - state, utilities, routing, render loop

// =============================================================
// PATHWAY PORTAL  (essex province)
// =============================================================

// State
const State = {
  user: null,
  view: 'find',
  currentLodgeId: null,
  currentCentreId: null,
  directoryTab: 'directory',
  scheduleState: null,
  treesExpanded: {},
  searchQuery: '',
  mapSearch: null,
  mapSearchError: null,
  mapSearchLoading: false,
  filters: defaultFilters(),
  sortBy: 'match',
};

function defaultFilters() {
  return {
    regions: [],
    centres: [],
    days: [],
    timeOfDay: null,         // 'Daylight' | 'Evening' | 'Afternoon' | null
    interests: [],
    rituals: [],
    matchingStatus: ['open'], // default: only those accepting
    health: [],
    ageDemographic: [],
    universitiesScheme: false,
    diversityInclusive: false,
    modernCommunication: false,
    progressionPace: [],
    priorityFocus: [],
    candidateMotivations: [],
    maxSubscription: null,
    minMembers: null,
    maxMembers: null,
  };
}

// Storage
function saveState() {
  try {
    localStorage.setItem('pathway_user', JSON.stringify(State.user));
  } catch (e) { console.warn('Could not save', e); }
}
function loadState() {
  try {
    const u = localStorage.getItem('pathway_user');
    if (u) State.user = JSON.parse(u);
  } catch (e) { console.warn('Could not load', e); }
}

// Helpers
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

function on(eventName, selector, handler) {
  document.addEventListener(eventName, e => {
    const target = e.target.closest(selector);
    if (target) handler(e, target);
  });
}

function lodgeById(id) { return PORTAL_DATA.lodges.find(l => l.id === id); }
function enrichedFor(id) { return PORTAL_DATA.enriched[id] || null; }

function centreById(id) {
  // Centres are keyed by name; id is a slug
  return Object.values(PORTAL_DATA.centres).find(c => slugify(c.name) === id);
}
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function centreStats(centre) {
  const lodges = centre.lodge_ids.map(id => lodgeById(id)).filter(Boolean);
  return {
    total: lodges.length,
    profiles: lodges.filter(l => l.status === 'Profile Published').length,
    noProfile: lodges.filter(l => l.status === 'No Profile').length,
    noInitiates: lodges.filter(l => l.matching_status === 'no_initiates').length,
    closed: lodges.filter(l => l.matching_status === 'closed').length,
    lodges: lodges,
  };
}
function regionStats(regionName) {
  const lodges = PORTAL_DATA.lodges.filter(l => l.region === regionName);
  const centres = Object.values(PORTAL_DATA.centres).filter(c => c.region === regionName);
  return {
    total: lodges.length,
    profiles: lodges.filter(l => l.status === 'Profile Published').length,
    noProfile: lodges.filter(l => l.status === 'No Profile').length,
    noInitiates: lodges.filter(l => l.matching_status === 'no_initiates').length,
    centres: centres,
  };
}
// Pick a Pathway colour for a centre deterministically from its name
function centreColour(centreOrName) {
  // Centre colour follows its region. Accepts either a centre object or a name.
  const regionMap = {
    'Essex North 1': 'blue',
    'Essex North 2': 'teal',
    'Essex South 1': 'orange',
    'Essex South 2': 'green',
  };
  let region = null;
  if (centreOrName && typeof centreOrName === 'object') {
    region = centreOrName.region;
  } else if (typeof centreOrName === 'string') {
    const c = PORTAL_DATA.centres[centreOrName];
    region = c ? c.region : null;
  }
  return regionMap[region] || 'magenta';
}
function centreInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

function centreDisplayName(centre) {
  return centre.display_name || centre.name;
}


// ===== Map postcode search helpers =====
async function geocodePostcode(postcode) {
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
  if (!cleaned) throw new Error('Please enter a postcode');
  const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`;
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new Error('Could not reach the postcode service. Check your internet connection.');
  }
  if (res.status === 404) throw new Error('Postcode not recognised. Check the spelling.');
  if (!res.ok) throw new Error('Postcode lookup failed (status ' + res.status + ').');
  const data = await res.json();
  if (!data.result) throw new Error('Postcode service returned no data.');
  return {
    lat: data.result.latitude,
    lon: data.result.longitude,
    label: data.result.postcode,
    area: data.result.admin_district || data.result.parish || '',
  };
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function formatDistance(miles) {
  if (miles < 1) return Math.round(miles * 10) / 10 + ' mi';
  if (miles < 10) return (Math.round(miles * 10) / 10) + ' mi';
  return Math.round(miles) + ' mi';
}

async function runMapSearch() {
  const postcodeInput = document.querySelector('#map-postcode');
  const distanceInput = document.querySelector('#map-distance');
  if (!postcodeInput) return;
  const postcode = postcodeInput.value.trim();
  let distance = parseFloat(distanceInput?.value) || 10;
  if (distance < 1) distance = 1;
  if (distance > 100) distance = 100;
  if (!postcode) return;

  State.mapSearchLoading = true;
  State.mapSearchError = null;
  render();

  try {
    const geo = await geocodePostcode(postcode);
    State.mapSearch = { ...geo, distance, input: postcode };
    State.mapSearchLoading = false;
    State.mapSearchError = null;
  } catch (e) {
    State.mapSearch = null;
    State.mapSearchError = e.message;
    State.mapSearchLoading = false;
  }
  render();
}

function clearMapSearch() {
  State.mapSearch = null;
  State.mapSearchError = null;
  render();
}


function numberedCentres() {
  const out = [];
  let n = 1;
  PORTAL_DATA.regions.forEach(region => {
    const inRegion = Object.values(PORTAL_DATA.centres)
      .filter(c => c.region === region)
      .sort((a, b) => (a.display_name || a.name).localeCompare(b.display_name || b.name));
    inRegion.forEach(c => {
      out.push({ centre: c, number: n });
      n++;
    });
  });
  return out;
}




function userInitials(email) {
  if (!email) return '?';
  const name = email.split('@')[0];
  const parts = name.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function userDisplayName(email) {
  if (!email) return 'Member';
  const name = email.split('@')[0];
  const parts = name.split(/[._-]/).filter(Boolean);
  return parts.map(p => p[0].toUpperCase() + p.slice(1)).join(' ');
}

// =============================================================
// FILTERING
// =============================================================
function applyFilters() {
  const f = State.filters;
  return PORTAL_DATA.lodges.filter(lodge => {
    const en = enrichedFor(lodge.id);

    // Free-text search by lodge name or number
    if (State.searchQuery && State.searchQuery.trim()) {
      const q = State.searchQuery.trim().toLowerCase();
      const nameMatch = lodge.name.toLowerCase().includes(q);
      const numMatch = String(lodge.number).includes(q);
      if (!nameMatch && !numMatch) return false;
    }

    if (f.regions.length && !f.regions.includes(lodge.region)) return false;
    if (f.centres.length && !f.centres.includes(lodge.centre)) return false;

    if (f.days.length) {
      if (!lodge.meeting_days || !lodge.meeting_days.some(d => f.days.includes(d))) return false;
    }

    if (f.timeOfDay) {
      // Only enriched lodges have a real time_of_day. For others,
      // detect 'Daylight' via name or notes.
      let lodgeTime = en?.time_of_day || null;
      if (!lodgeTime) {
        const haystack = (lodge.name + ' ' + lodge.notes).toLowerCase();
        if (haystack.includes('daylight')) lodgeTime = 'Daylight';
      }
      if (f.timeOfDay === 'Daylight') {
        if (lodgeTime !== 'Daylight') return false;
      } else if (f.timeOfDay === 'Evening') {
        if (lodgeTime !== 'Evening' && lodgeTime !== null) return false;
        // Lodges with no time data assumed evening (typical default)
      } else if (f.timeOfDay === 'Afternoon') {
        if (lodgeTime !== 'Afternoon') return false;
      }
    }

    if (f.interests.length) {
      if (!lodge.interests.some(i => f.interests.includes(i))) return false;
    }

    if (f.rituals.length && !f.rituals.includes(lodge.ritual)) return false;

    if (f.matchingStatus.length && !f.matchingStatus.includes(lodge.matching_status)) return false;

    if (f.minMembers !== null && (lodge.memberships === null || lodge.memberships < f.minMembers)) return false;
    if (f.maxMembers !== null && (lodge.memberships === null || lodge.memberships > f.maxMembers)) return false;

    // Enriched-only filters apply only to lodges with enriched data
    if (f.health.length) {
      if (!en || !f.health.includes(en.health)) return false;
    }
    if (f.ageDemographic.length) {
      if (!en || !f.ageDemographic.includes(en.age_demographic)) return false;
    }
    if (f.progressionPace.length) {
      if (!en || !f.progressionPace.includes(en.progression_pace)) return false;
    }
    if (f.universitiesScheme) {
      if (!en || !en.universities_scheme) return false;
    }
    if (f.modernCommunication) {
      if (!en || !en.communication_modern) return false;
    }
    if (f.diversityInclusive) {
      if (!en || !en.diversity_inclusive) return false;
    }
    if (f.maxSubscription !== null) {
      if (!en || !en.annual_subscription || en.annual_subscription > f.maxSubscription) return false;
    }
    if (f.priorityFocus.length) {
      if (!en || !en.lodge_priorities) return false;
      // a lodge "focuses on" a priority if it's in the top 3
      const topThree = en.lodge_priorities.slice(0, 3).map(p => p.toLowerCase());
      const wanted = f.priorityFocus.map(p => p.toLowerCase());
      if (!wanted.some(w => topThree.some(t => t.includes(w)))) return false;
    }

    return true;
  });
}

// Sort by name, lodge number, members, or "match" (enriched lodges first)
function sortResults(list) {
  const out = [...list];
  switch (State.sortBy) {
    case 'name':
      out.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'number':
      out.sort((a, b) => (parseInt(a.number) || 9999) - (parseInt(b.number) || 9999)); break;
    case 'members':
      out.sort((a, b) => (b.memberships || 0) - (a.memberships || 0)); break;
    case 'centre':
      out.sort((a, b) => (a.centre + a.name).localeCompare(b.centre + b.name)); break;
    case 'match':
    default:
      // Enriched first, then open lodges, then by name
      out.sort((a, b) => {
        const ea = enrichedFor(a.id) ? 1 : 0;
        const eb = enrichedFor(b.id) ? 1 : 0;
        if (eb !== ea) return eb - ea;
        const oa = a.matching_status === 'open' ? 1 : 0;
        const ob = b.matching_status === 'open' ? 1 : 0;
        if (ob !== oa) return ob - oa;
        return a.name.localeCompare(b.name);
      });
  }
  return out;
}

// =============================================================
// ROUTING
// =============================================================

// ===== Hash-based routing =====
function computeHash() {
  let parts = ['#', State.view];
  if (State.view === 'lodge' && State.currentLodgeId) parts.push(State.currentLodgeId);
  if (State.view === 'profile-edit' && State.currentLodgeId) parts.push(State.currentLodgeId);
  if (State.view === 'centre' && State.currentCentreId) parts.push(State.currentCentreId);
  if (State.view === 'directory' && State.directoryTab && State.directoryTab !== 'directory') parts.push(State.directoryTab);
  return parts.join('/');
}
function updateHash() {
  const h = computeHash();
  if (window.location.hash !== h) {
    history.pushState(null, '', h);
  }
}
function parseHash() {
  let hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) {
    State.view = State.user ? 'dashboard' : 'login';
    return;
  }
  const parts = hash.split('/').filter(Boolean);
  const view = parts[0];
  const id = parts[1];

  if (view === 'profile-edit' && id) {
    State.view = 'profile-edit';
    State.currentLodgeId = id;
  } else if (view === 'lodge' && id) {
    State.view = 'lodge';
    State.currentLodgeId = id;
  } else if (view === 'centre' && id) {
    State.view = 'centre';
    State.currentCentreId = id;
  } else if (view === 'directory') {
    State.view = 'directory';
    if (id === 'map' || id === 'schedule') State.directoryTab = id;
    else State.directoryTab = 'directory';
  } else if (['dashboard','find','admin','trees'].includes(view)) {
    State.view = view;
  }
}
window.addEventListener('popstate', () => {
  parseHash();
  render();
});

function navigate(view, params) {
  State.view = view;
  if (params) {
    if (params.lodgeId) State.currentLodgeId = params.lodgeId;
    if (params.centreId) State.currentCentreId = params.centreId;
    if (params.tab !== undefined) State.directoryTab = params.tab;
  }
  // Reset directoryTab when navigating away from directory
  if (view !== 'directory' && params?.tab === undefined) State.directoryTab = 'directory';
  updateHash();
  render();
  window.scrollTo(0, 0);
}

// =============================================================
// RENDER
// =============================================================

// Pathway Portal views - all render functions
function render() {
  if (!State.user) {
    document.body.innerHTML = renderLogin();
    return;
  }
  document.body.innerHTML = `
    ${renderTopBar()}
    <main class="app-main">
      ${renderCurrentView()}
    </main>
    ${renderFooter()}
  `;
  // Init leaflet if we just rendered the map tab
  if (State.view === 'directory' && State.directoryTab === 'map') {
    setTimeout(initLeafletMap, 50);
  }
}

function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-brand-mark">PATHWAY</span>
          <span class="footer-brand-sub">Province of Essex</span>
        </div>
        <div class="footer-meta">
          <span>&copy; ${year} Essex Pathway Membership Team</span>
          <span class="footer-sep">&middot;</span>
          <span>Lodge data current as of 02/02/2026</span>
          <span class="footer-sep">&middot;</span>
          <span>Prototype v0.4</span>
        </div>
      </div>
    </footer>
  `;
}

function renderCurrentView() {
  switch (State.view) {
    case 'find': return renderFind();
    case 'lodge': return renderLodgeDetail();
    case 'directory': return renderDirectory();
    case 'centre': return renderCentre();
    case 'trees': return renderTrees();
    case 'profile-edit': return renderProfileEdit();
    case 'admin': return renderAdmin();
    case 'dashboard':
    default: return renderDashboard();
  }
}

// --- Login ---
