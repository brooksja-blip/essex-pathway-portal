// Pathway Portal handlers - event handlers and init
// =============================================================
// EVENT HANDLERS
// =============================================================

// Login
on('submit', '#login-form', (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  State.user = email;
  saveState();
  navigate('dashboard');
});

// Top nav buttons
on('click', '[data-nav]', (e, el) => {
  navigate(el.dataset.nav);
});

// Sign out
on('click', '[data-action="signout"]', () => {
  State.user = null;
  saveState();
  render();
});

// Lodge row click (in find results)
on('click', '[data-lodge]', (e, el) => {
  if (e.target.closest('[data-action]')) return;
  navigate('lodge', { lodgeId: el.dataset.lodge });
});

// Filter checkbox change
on('change', '[data-filter]', (e, el) => {
  const filterName = el.dataset.filter;
  const value = el.value;
  const arr = State.filters[filterName];
  if (el.checked) {
    if (!arr.includes(value)) arr.push(value);
  } else {
    const i = arr.indexOf(value);
    if (i >= 0) arr.splice(i, 1);
  }
  render();
});

on('change', '[data-filter-bool]', (e, el) => {
  State.filters[el.dataset.filterBool] = el.checked;
  render();
});

// Day pill clicks
on('click', '[data-day]', (e, el) => {
  const day = el.dataset.day;
  const arr = State.filters.days;
  const i = arr.indexOf(day);
  if (i >= 0) arr.splice(i, 1);
  else arr.push(day);
  render();
});

// Time of day
on('click', '[data-time]', (e, el) => {
  const t = el.dataset.time;
  State.filters.timeOfDay = State.filters.timeOfDay === t ? null : t;
  render();
});

// Age
on('click', '[data-age]', (e, el) => {
  const arr = State.filters.ageDemographic;
  const v = el.dataset.age;
  const i = arr.indexOf(v);
  if (i >= 0) arr.splice(i, 1); else arr.push(v);
  render();
});

// Health
on('click', '[data-health]', (e, el) => {
  const arr = State.filters.health;
  const v = el.dataset.health;
  const i = arr.indexOf(v);
  if (i >= 0) arr.splice(i, 1); else arr.push(v);
  render();
});

// Toggle filter group
on('click', '[data-toggle-group]', (e, el) => {
  el.closest('.filter-group').classList.toggle('collapsed');
});

// Reset filters
on('click', '[data-action="reset-filters"]', () => {
  State.filters = defaultFilters();
  State.searchQuery = '';
  render();
});

// Lodge name/number search
on('input', '#lodge-search', (e, el) => {
  State.searchQuery = el.value;
  const cursorPos = el.selectionStart;
  render();
  // Re-render destroys the input - restore focus and cursor so typing flows
  const newEl = document.querySelector('#lodge-search');
  if (newEl) {
    newEl.focus();
    try { newEl.setSelectionRange(cursorPos, cursorPos); } catch (e) {}
  }
});

on('click', '[data-action="clear-search"]', () => {
  State.searchQuery = '';
  render();
  const el = document.querySelector('#lodge-search');
  if (el) el.focus();
});

on('keydown', '#lodge-search', (e) => {
  if (e.key === 'Escape') {
    State.searchQuery = '';
    render();
    const el = document.querySelector('#lodge-search');
    if (el) el.focus();
  }
});

// Sort change
on('change', '#sort-select', (e, el) => {
  State.sortBy = el.value;
  render();
});

// Number inputs for size and subscription
on('input', '#minMembers', (e, el) => {
  State.filters.minMembers = el.value ? parseInt(el.value) : null;
});
on('input', '#maxMembers', (e, el) => {
  State.filters.maxMembers = el.value ? parseInt(el.value) : null;
});
on('input', '#maxSubscription', (e, el) => {
  State.filters.maxSubscription = el.value ? parseInt(el.value) : null;
});
// Re-render when they leave the input
on('change', '#minMembers, #maxMembers, #maxSubscription', () => render());

// Quick search shortcuts on the dashboard
on('click', '[data-quick]', (e, el) => {
  State.filters = defaultFilters();
  switch (el.dataset.quick) {
    case 'daylight':
      State.filters.timeOfDay = 'Daylight';
      break;
    case 'growing':
      State.filters.health = ['Growing'];
      break;
    case 'universities':
      State.filters.universitiesScheme = true;
      break;
    case 'younger':
      State.filters.ageDemographic = ['Younger', 'Mixed'];
      break;
    case 'saturday':
      State.filters.days = ['Saturday'];
      break;
    case 'affordable':
      State.filters.maxSubscription = 175;
      break;
    case 'ritual':
      State.filters.priorityFocus = ['Ritual'];
      break;
    case 'charity':
      State.filters.priorityFocus = ['Charity'];
      break;
  }
  navigate('find');
});


// Centre card / link click
on('click', '[data-centre]', (e, el) => {
  navigate('centre', { centreId: el.dataset.centre });
});


// Directory search - filter centre cards in place, no re-render
on('input', '#directory-search', (e, el) => {
  const q = el.value.trim().toLowerCase();
  const clearBtn = document.querySelector('#directory-clear');
  if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';

  const cards = document.querySelectorAll('.centre-card');
  let visibleCount = 0;
  cards.forEach(card => {
    const match = !q || (card.dataset.search || '').includes(q);
    card.style.display = match ? '' : 'none';
    if (match) visibleCount++;
  });

  // Hide region sections that have no visible cards
  let visibleRegions = 0;
  document.querySelectorAll('.region-section').forEach(section => {
    const visible = section.querySelectorAll('.centre-card[style=""], .centre-card:not([style])').length;
    const allCards = section.querySelectorAll('.centre-card');
    let visibleHere = 0;
    allCards.forEach(c => { if (c.style.display !== 'none') visibleHere++; });
    if (visibleHere > 0) {
      section.style.display = '';
      visibleRegions++;
    } else {
      section.style.display = 'none';
    }
  });

  // Update count display and empty state
  const countEl = document.querySelector('#search-count');
  const total = document.querySelectorAll('.centre-card').length;
  if (countEl) {
    countEl.textContent = q
      ? `Showing ${visibleCount} of ${total} centres`
      : `${total} centres across the Province`;
  }
  const emptyState = document.querySelector('#directory-empty');
  if (emptyState) emptyState.style.display = (q && visibleCount === 0) ? '' : 'none';
});

on('click', '#directory-clear', () => {
  const input = document.querySelector('#directory-search');
  if (input) {
    input.value = '';
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
});


// Directory tab switching
on('click', '[data-dirtab]', (e, el) => {
  State.directoryTab = el.dataset.dirtab;
  updateHash();
  render();
  // If map tab, initialise leaflet after DOM update
  if (State.directoryTab === 'map') {
    setTimeout(initLeafletMap, 50);
  }
});

// Schedule day switching
on('click', '[data-schedday]', (e, el) => {
  State.scheduleState = State.scheduleState || { day: 'Monday', region: 'all' };
  State.scheduleState.day = el.dataset.schedday;
  render();
});

// Schedule region filter
on('click', '[data-schedregion]', (e, el) => {
  State.scheduleState = State.scheduleState || { day: 'Monday', region: 'all' };
  State.scheduleState.region = el.dataset.schedregion;
  render();
});


// Tree root toggle
on('click', '[data-toggle-tree]', (e, el) => {
  const ref = el.dataset.toggleTree;
  State.treesExpanded[ref] = !State.treesExpanded[ref];
  render();
});

on('click', '[data-action="trees-expand"]', () => {
  PORTAL_DATA.lineages.roots.forEach(r => { State.treesExpanded[r] = true; });
  render();
});
on('click', '[data-action="trees-collapse"]', () => {
  State.treesExpanded = {};
  render();
});

// Tree search - filter nodes in place
on('input', '#tree-search', (e, el) => {
  const q = el.value.trim().toLowerCase();
  const clearBtn = document.querySelector('#tree-clear');
  if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';

  if (!q) {
    document.querySelectorAll('.tree-node').forEach(n => n.style.display = '');
    document.querySelectorAll('.tree-root').forEach(s => s.style.display = '');
    const countEl = document.querySelector('#tree-search-count');
    if (countEl) {
      const total = Object.keys(PORTAL_DATA.lineages.nodes).length;
      const roots = PORTAL_DATA.lineages.roots.length;
      countEl.textContent = `${roots} founding lodges \u00b7 ${total} lodges across all generations`;
    }
    return;
  }

  // Auto-expand all roots when searching
  let anyMatch = false;
  PORTAL_DATA.lineages.roots.forEach(r => { State.treesExpanded[r] = true; });
  if (!document.querySelector('.tree-list')) {
    // Need to re-render first to expose all nodes
    render();
    // Re-run on next tick
    setTimeout(() => document.querySelector('#tree-search')?.dispatchEvent(new Event('input', { bubbles: true })), 0);
    return;
  }

  // Now filter visible nodes
  let visible = 0;
  document.querySelectorAll('.tree-node').forEach(node => {
    const searchable = node.dataset.search || '';
    const direct = searchable.includes(q);
    if (direct) {
      visible++;
      node.classList.add('tree-match');
    } else {
      node.classList.remove('tree-match');
    }
  });

  // Show a node if it or any descendant matches
  function hasMatchInSubtree(node) {
    if (node.classList.contains('tree-match')) return true;
    const sublist = node.querySelector(':scope > .tree-list');
    if (!sublist) return false;
    const subnodes = Array.from(sublist.children).filter(n => n.classList.contains('tree-node'));
    return subnodes.some(sn => hasMatchInSubtree(sn));
  }
  document.querySelectorAll('.tree-node').forEach(node => {
    node.style.display = hasMatchInSubtree(node) ? '' : 'none';
  });

  // Hide whole trees if no match
  let visibleRoots = 0;
  document.querySelectorAll('.tree-root').forEach(root => {
    const matchedNodes = Array.from(root.querySelectorAll('.tree-node')).filter(n => n.style.display !== 'none');
    if (matchedNodes.length > 0) {
      root.style.display = '';
      visibleRoots++;
    } else {
      root.style.display = 'none';
    }
  });

  const countEl = document.querySelector('#tree-search-count');
  if (countEl) countEl.textContent = `${visible} match${visible === 1 ? '' : 'es'} across ${visibleRoots} ${visibleRoots === 1 ? 'family' : 'families'}`;
});

on('click', '#tree-clear', () => {
  const input = document.querySelector('#tree-search');
  if (input) {
    input.value = '';
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
});


// Map postcode search
on('click', '#map-search-go', () => runMapSearch());
on('click', '#map-search-clear', () => clearMapSearch());
on('keydown', '#map-postcode', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); runMapSearch(); }
});
on('keydown', '#map-distance', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); runMapSearch(); }
});

// =============================================================
// INIT
// =============================================================
loadState();
if (State.user) parseHash();
render();
