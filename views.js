function renderLogin() {
  return `
    <div class="login-screen">
      <div class="login-card">
        <img src="${LOGO_URL}" alt="Pathway logo" class="login-logo">
        <h1 class="login-title">Pathway Portal</h1>
        <p class="login-subtitle">Essex Province Membership Team</p>
        <form id="login-form">
          <div class="field">
            <label>Email address</label>
            <input type="email" name="email" required placeholder="you@example.com" autocomplete="email">
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" name="password" required autocomplete="current-password" placeholder="Any password works for the prototype">
          </div>
          <button type="submit" class="btn btn-primary btn-block">Sign in</button>
        </form>
        <p style="margin-top:18px; font-size:12px; color:var(--text-muted); text-align:center;">
          This is a prototype. Any email and password will sign you in.
        </p>
      </div>
    </div>
  `;
}

// --- Top bar ---
function renderTopBar() {
  const v = State.view;
  const isActive = (key) => v === key || (key === 'find' && v === 'lodge') ? 'active' : '';
  return `
    <header class="topbar">
      <div class="topbar-brand">
        <img src="${LOGO_URL}" class="topbar-logo" alt="">
        <div>
          <div class="topbar-name">Pathway Portal</div>
          <span class="topbar-name-sub">Essex Province</span>
        </div>
      </div>
      <nav class="topbar-nav">
        <button class="${isActive('dashboard')}" data-nav="dashboard">Dashboard</button>
        <button class="${isActive('find')}" data-nav="find">Find a Lodge</button>
        <button class="${(v === 'directory' || v === 'centre') ? 'active' : ''}" data-nav="directory">Regions &amp; Centres</button>
        <button class="${isActive('trees')}" data-nav="trees">Family Trees</button>
        <button class="${isActive('admin')}" data-nav="admin">Admin</button>
      </nav>
      <div class="topbar-right">
        <div class="user-chip">
          <div class="user-avatar">${escapeHtml(userInitials(State.user))}</div>
          <span>${escapeHtml(userDisplayName(State.user))}</span>
        </div>
        <button class="btn-ghost" data-action="signout">Sign out</button>
      </div>
    </header>
  `;
}

// --- Dashboard ---
function renderDashboard() {
  const lodges = PORTAL_DATA.lodges;
  const totalLodges = lodges.length;
  const openLodges = lodges.filter(l => l.matching_status === 'open').length;
  const profilesPublished = lodges.filter(l => l.status === 'Profile Published').length;
  const noProfile = lodges.filter(l => l.status === 'No Profile').length;
  const centresCount = new Set(lodges.map(l => l.centre)).size;
  const enrichedCount = Object.keys(PORTAL_DATA.enriched).length;
  const familiesCount = PORTAL_DATA.lineages ? PORTAL_DATA.lineages.roots.length : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = userDisplayName(State.user).split(' ')[0];

  const wheelSvg = `
    <svg class="bento-hero-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(100 100)">
        <path d="M 0,-80 A 80,80 0 0,1 80,0 L 30,0 A 30,30 0 0,0 0,-30 Z" fill="#ffffff" opacity="0.7"/>
        <path d="M 80,0 A 80,80 0 0,1 0,80 L 0,30 A 30,30 0 0,0 30,0 Z" fill="#ffffff" opacity="0.5"/>
        <path d="M 0,80 A 80,80 0 0,1 -80,0 L -30,0 A 30,30 0 0,0 0,30 Z" fill="#ffffff" opacity="0.3"/>
        <path d="M -80,0 A 80,80 0 0,1 0,-80 L 0,-30 A 30,30 0 0,0 -30,0 Z" fill="#ffffff" opacity="0.5"/>
      </g>
    </svg>
  `;

  return `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="eyebrow">Province of Essex</span>
          <h1>${greeting}, ${escapeHtml(firstName)}</h1>
          <p class="page-header-sub">Browse lodges, centres, and family trees across the province.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" data-nav="directory">Regions &amp; centres</button>
          <button class="btn btn-primary" data-nav="find">Find a Lodge</button>
        </div>
      </div>

      <div class="bento">
        <div class="bento-hero">
          ${wheelSvg}
          <div>
            <div class="bento-hero-label">Province at a glance</div>
            <div class="bento-hero-value">${totalLodges}</div>
            <div class="bento-hero-title">lodges across Essex</div>
          </div>
          <div class="bento-hero-foot">
            <div class="bento-hero-foot-stat">
              <strong>4</strong>
              regions
            </div>
            <button class="bento-hero-foot-stat link-stat" data-nav="directory">
              <strong>${centresCount}</strong>
              centres
            </button>
            <div class="bento-hero-foot-stat">
              <strong>${profilesPublished}</strong>
              profiles published
            </div>
          </div>
        </div>

        <div class="bento-card green">
          <span class="bento-corner-mark">ATTRACT</span>
          <div>
            <div class="bento-label">Accepting candidates</div>
            <div class="bento-value">${openLodges}</div>
          </div>
          <div class="bento-hint">${Math.round(openLodges/totalLodges*100)}% of the province</div>
        </div>

        <div class="bento-card teal">
          <span class="bento-corner-mark">PLAN</span>
          <div>
            <div class="bento-label">Profiles published</div>
            <div class="bento-value">${profilesPublished}</div>
          </div>
          <div class="bento-hint">${enrichedCount} fully structured for matching</div>
        </div>

        <div class="bento-card orange">
          <span class="bento-corner-mark">ENGAGE</span>
          <div>
            <div class="bento-label">Profiles to publish</div>
            <div class="bento-value">${noProfile}</div>
          </div>
          <div class="bento-hint">lodges without a profile yet</div>
        </div>

        <button class="bento-card magenta bento-card-link" data-nav="trees">
          <span class="bento-corner-mark">RETRIEVE</span>
          <div>
            <div class="bento-label">Lodge families</div>
            <div class="bento-value">${familiesCount}</div>
          </div>
          <div class="bento-hint">explore the family trees &rarr;</div>
        </button>
      </div>

      <div class="panel-row">
        <div class="panel">
          <div class="panel-header">
            <h3>Profile coverage</h3>
          </div>
          <p style="color:var(--ink-3); margin-bottom:0; font-size:13px; font-weight:500;">
            ${enrichedCount} lodges fully structured for rich matching. ${profilesPublished - enrichedCount} have published PDFs awaiting structuring. ${noProfile} have no profile yet.
          </p>
          <div class="coverage-track">
            <div class="coverage-rich" style="width:${(enrichedCount/totalLodges*100).toFixed(1)}%"></div>
            <div class="coverage-fill" style="width:${((profilesPublished-enrichedCount)/totalLodges*100).toFixed(1)}%; background:linear-gradient(90deg, var(--pw-teal) 0%, var(--pw-blue) 100%);"></div>
          </div>
          <div class="coverage-key">
            <span><span class="coverage-key-dot" style="background:var(--pw-magenta)"></span>Rich profile</span>
            <span><span class="coverage-key-dot" style="background:var(--pw-blue)"></span>PDF only</span>
            <span><span class="coverage-key-dot" style="background:var(--surface-2); border:1px solid var(--border-strong);"></span>None yet</span>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h3>Quick searches</h3>
          </div>
          <p style="color:var(--ink-3); margin-bottom:14px; font-size:13px; font-weight:500;">Common patterns when matching candidates to lodges.</p>
          <div class="quick-row">
            <button class="quick-pill tone-orange" data-quick="daylight">Daylight lodges</button>
            <button class="quick-pill tone-green" data-quick="growing">Growing with capacity</button>
            <button class="quick-pill tone-blue" data-quick="universities">Universities Scheme</button>
            <button class="quick-pill tone-magenta" data-quick="younger">Younger membership</button>
            <button class="quick-pill tone-blue" data-quick="saturday">Saturday lodges</button>
            <button class="quick-pill tone-teal" data-quick="affordable">Affordable subscriptions</button>
            <button class="quick-pill tone-magenta" data-quick="ritual">Ritual focused</button>
            <button class="quick-pill tone-green" data-quick="charity">Charity focused</button>
          </div>
        </div>
      </div>
    </div>
  `;
}


// --- Find a Lodge ---
function renderFind() {
  const filtered = applyFilters();
  const sorted = sortResults(filtered);
  const f = State.filters;
  return `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="eyebrow">Find a Lodge</span>
          <h1>Match a candidate to a lodge</h1>
          <p class="page-header-sub">Filter by what the candidate is looking for. Results update as you choose.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" data-action="reset-filters">Reset filters</button>
        </div>
      </div>

      <div class="lodge-search-row">
        <div class="lodge-search-input-wrap">
          <svg class="lodge-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          <input id="lodge-search" type="text" placeholder="Search by lodge name or number (e.g. Janus, 4456)" value="${escapeHtml(State.searchQuery)}" autocomplete="off">
          ${State.searchQuery ? '<button class="lodge-search-clear" data-action="clear-search" aria-label="Clear search">×</button>' : ''}
        </div>
        ${State.searchQuery ? `<div class="lodge-search-hint">${sorted.length} ${sorted.length === 1 ? 'match' : 'matches'} for "${escapeHtml(State.searchQuery)}"</div>` : ''}
      </div>

      <div class="find-layout">
        ${renderFilterPanel()}
        <div>
          <div class="results-header">
            <div class="results-count">
              <strong>${sorted.length}</strong> ${sorted.length === 1 ? 'lodge matches' : 'lodges match'}
            </div>
            <div class="results-controls">
              <span>Sort by</span>
              <select id="sort-select">
                <option value="match" ${State.sortBy === 'match' ? 'selected' : ''}>Best match</option>
                <option value="name" ${State.sortBy === 'name' ? 'selected' : ''}>Name (A to Z)</option>
                <option value="number" ${State.sortBy === 'number' ? 'selected' : ''}>Lodge number</option>
                <option value="members" ${State.sortBy === 'members' ? 'selected' : ''}>Largest first</option>
                <option value="centre" ${State.sortBy === 'centre' ? 'selected' : ''}>By centre</option>
              </select>
            </div>
          </div>
          ${sorted.length === 0
            ? renderEmptyResults()
            : sorted.map(renderLodgeRow).join('')
          }
        </div>
      </div>
    </div>
  `;
}

function renderEmptyResults() {
  return `
    <div class="empty-state">
      <div class="empty-state-title">No lodges match these filters</div>
      <p>Try removing one of the more specific filters. Some criteria only apply to lodges with fully structured profiles.</p>
      <div style="margin-top:16px"><button class="btn btn-secondary" data-action="reset-filters">Reset all filters</button></div>
    </div>
  `;
}

function renderLodgeRow(lodge) {
  const en = enrichedFor(lodge.id);
  const tags = [];
  if (lodge.meeting_days && lodge.meeting_days.length) {
    tags.push(`<span class="tag day">${lodge.meeting_days.map(d => d.slice(0, 3)).join(' / ')}</span>`);
  }
  if (en?.time_of_day === 'Daylight' || (lodge.name + lodge.notes).toLowerCase().includes('daylight')) {
    tags.push(`<span class="tag daylight">Daylight</span>`);
  }
  if (lodge.ritual && lodge.ritual !== 'Varies') {
    tags.push(`<span class="tag">${escapeHtml(lodge.ritual)}</span>`);
  }
  if (lodge.memberships !== null) {
    tags.push(`<span class="tag">${lodge.memberships} members</span>`);
  }
  // Age profile chip: prefer the saved profile's descriptor, fall back to
  // the enriched bucket mapped to the same 5-option vocabulary.
  let ageLabel = null;
  try {
    const stored = localStorage.getItem('pathway_profile_' + lodge.id);
    if (stored) {
      const p = JSON.parse(stored);
      if (p && p.ageProfile) ageLabel = p.ageProfile;
    }
  } catch (e) {}
  if (!ageLabel && en?.age_demographic) {
    const map = { 'Younger': 'Younger leaning', 'Mixed': 'Broad mix', 'Older': 'Mature leaning' };
    ageLabel = map[en.age_demographic] || en.age_demographic;
  }
  if (ageLabel) {
    tags.push(`<span class="tag age">Age: ${escapeHtml(ageLabel)}</span>`);
  }
  lodge.interests.forEach(i => {
    tags.push(`<span class="tag interest">${escapeHtml(i)}</span>`);
  });
  if (en) {
    tags.push(`<span class="tag profile">Full profile</span>`);
  }

  const status = lodge.matching_status;
  const statusLabel = {
    'open': 'Accepting candidates',
    'no_initiates': 'No initiates',
    'closed': 'Not progressing',
    'unknown': 'Status unknown'
  }[status];
  const statusClass = {
    'open': 'status-open',
    'no_initiates': 'status-attention',
    'closed': 'status-closed',
    'unknown': 'status-closed'
  }[status];

  return `
    <div class="lodge-row" data-lodge="${escapeHtml(lodge.id)}">
      <div>
        <div class="name-line">
          <span class="name">${escapeHtml(lodge.name)}</span>
          <span class="number">L${escapeHtml(lodge.number)}</span>
        </div>
        <div class="place">
          ${escapeHtml(lodge.centre)}<span class="sep">·</span>${escapeHtml(lodge.region)}
        </div>
        <div class="tags">${tags.join('')}</div>
      </div>
      <div class="meta">
        <div class="status-pill ${statusClass}">
          <span class="status-dot"></span>${escapeHtml(statusLabel)}
        </div>
      </div>
    </div>
  `;
}

// --- Filter panel ---
function renderFilterPanel() {
  const f = State.filters;
  const lodges = PORTAL_DATA.lodges;

  // Region counts
  const regionCounts = {};
  PORTAL_DATA.regions.forEach(r => {
    regionCounts[r] = lodges.filter(l => l.region === r).length;
  });

  // Centres (filtered by selected regions)
  const allowedCentres = f.regions.length
    ? f.regions.flatMap(r => PORTAL_DATA.centres_by_region[r] || [])
    : Object.values(PORTAL_DATA.centres_by_region).flat();

  return `
    <aside class="filter-panel">
      <div class="filter-panel-header">
        <h3>Filters</h3>
        <button class="btn-ghost btn-sm" data-action="reset-filters">Clear all</button>
      </div>

      <div class="filter-group">
        <button class="filter-group-header" data-toggle-group>
          Location <span class="chev">▼</span>
        </button>
        <div class="filter-group-body">
          <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;">Region</div>
          <div class="checklist mb-2">
            ${PORTAL_DATA.regions.map(r => `
              <label>
                <input type="checkbox" data-filter="regions" value="${escapeHtml(r)}" ${f.regions.includes(r) ? 'checked' : ''}>
                <span>${escapeHtml(r)}</span>
                <span class="count">${regionCounts[r]}</span>
              </label>
            `).join('')}
          </div>
          <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px; margin-top:10px;">Centre</div>
          <div class="checklist" style="max-height:160px; overflow-y:auto;">
            ${allowedCentres.sort().map(c => `
              <label>
                <input type="checkbox" data-filter="centres" value="${escapeHtml(c)}" ${f.centres.includes(c) ? 'checked' : ''}>
                <span>${escapeHtml(c)}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="filter-group">
        <button class="filter-group-header" data-toggle-group>
          Meeting day & time <span class="chev">▼</span>
        </button>
        <div class="filter-group-body">
          <div class="day-row mb-2">
            ${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => `
              <button class="day-pill ${f.days.includes(d) ? 'active' : ''}" data-day="${d}">${d.slice(0,3)}</button>
            `).join('')}
          </div>
          <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px; margin-top:10px;">Time of day</div>
          <div class="choice-row">
            ${['Daylight', 'Afternoon', 'Evening'].map(t => `
              <button class="choice-pill ${f.timeOfDay === t ? 'active' : ''}" data-time="${t}">${t}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="filter-group">
        <button class="filter-group-header" data-toggle-group>
          Status <span class="chev">▼</span>
        </button>
        <div class="filter-group-body">
          <div class="checklist">
            <label>
              <input type="checkbox" data-filter="matchingStatus" value="open" ${f.matchingStatus.includes('open') ? 'checked' : ''}>
              <span>Accepting candidates</span>
            </label>
            <label>
              <input type="checkbox" data-filter="matchingStatus" value="unknown" ${f.matchingStatus.includes('unknown') ? 'checked' : ''}>
              <span>Status unknown (no profile)</span>
            </label>
            <label>
              <input type="checkbox" data-filter="matchingStatus" value="no_initiates" ${f.matchingStatus.includes('no_initiates') ? 'checked' : ''}>
              <span>Joining members only (no initiates)</span>
            </label>
            <label>
              <input type="checkbox" data-filter="matchingStatus" value="closed" ${f.matchingStatus.includes('closed') ? 'checked' : ''}>
              <span>Non progressing</span>
            </label>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <button class="filter-group-header" data-toggle-group>
          Interests & character <span class="chev">▼</span>
        </button>
        <div class="filter-group-body">
          <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;">Special interest</div>
          <div class="checklist mb-2">
            ${PORTAL_DATA.all_interests.map(i => `
              <label>
                <input type="checkbox" data-filter="interests" value="${escapeHtml(i)}" ${f.interests.includes(i) ? 'checked' : ''}>
                <span>${escapeHtml(i)}</span>
              </label>
            `).join('')}
          </div>
          <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px; margin-top:10px;">Age profile</div>
          <div class="choice-row mb-2">
            ${['Younger', 'Mixed', 'Older'].map(d => `
              <button class="choice-pill ${f.ageDemographic.includes(d) ? 'active' : ''}" data-age="${d}">${d}</button>
            `).join('')}
          </div>
          <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px; margin-top:10px;">Lodge health</div>
          <div class="choice-row">
            ${['Growing', 'Stable', 'Declining'].map(h => `
              <button class="choice-pill ${f.health.includes(h) ? 'active' : ''}" data-health="${h}">${h}</button>
            `).join('')}
          </div>
          <p class="demo-hint">Age, health, and progression filters work on the ${Object.keys(PORTAL_DATA.enriched).length} lodges with full profiles in this prototype.</p>
        </div>
      </div>

      <div class="filter-group">
        <button class="filter-group-header" data-toggle-group>
          Lodge focus <span class="chev">▼</span>
        </button>
        <div class="filter-group-body">
          <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;">Top priority</div>
          <div class="checklist">
            ${['Ritual', 'Friendship', 'Charity', 'Masonic Education', 'Social Events', 'Lodge tradition'].map(p => `
              <label>
                <input type="checkbox" data-filter="priorityFocus" value="${escapeHtml(p)}" ${f.priorityFocus.includes(p) ? 'checked' : ''}>
                <span>${escapeHtml(p)}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="filter-group">
        <button class="filter-group-header" data-toggle-group>
          Practical <span class="chev">▼</span>
        </button>
        <div class="filter-group-body">
          <div class="checklist mb-2">
            <label>
              <input type="checkbox" data-filter-bool="universitiesScheme" ${f.universitiesScheme ? 'checked' : ''}>
              <span>Universities Scheme</span>
            </label>
            <label>
              <input type="checkbox" data-filter-bool="modernCommunication" ${f.modernCommunication ? 'checked' : ''}>
              <span>Modern communications (WhatsApp etc)</span>
            </label>
            <label>
              <input type="checkbox" data-filter-bool="diversityInclusive" ${f.diversityInclusive ? 'checked' : ''}>
              <span>Explicitly inclusive</span>
            </label>
          </div>
          <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;">Lodge size</div>
          <div class="flex gap-2 mb-2">
            <input type="number" placeholder="Min" id="minMembers" value="${f.minMembers ?? ''}" style="padding:6px 8px; border:1px solid var(--border-strong); border-radius:4px; width:80px; font-size:13px;">
            <input type="number" placeholder="Max" id="maxMembers" value="${f.maxMembers ?? ''}" style="padding:6px 8px; border:1px solid var(--border-strong); border-radius:4px; width:80px; font-size:13px;">
          </div>
          <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;">Max annual subscription</div>
          <input type="number" placeholder="No limit" id="maxSubscription" value="${f.maxSubscription ?? ''}" style="padding:6px 8px; border:1px solid var(--border-strong); border-radius:4px; width:120px; font-size:13px;">
          <span style="margin-left:6px; color:var(--text-secondary); font-size:13px;">£</span>
        </div>
      </div>
    </aside>
  `;
}

// --- Lodge detail ---
function renderLodgeDetail() {
  const lodge = lodgeById(State.currentLodgeId);
  if (!lodge) {
    return `<div class="page"><div class="empty-state">Lodge not found</div></div>`;
  }

  // Load the new structured profile (returns empty schema if nothing saved)
  const p = loadProfile(lodge.id);
  const completion = profileCompletion(p);
  const hasOwnProfile = hasStoredProfile(lodge.id);
  const en = enrichedFor(lodge.id);

  // Status pill (Accepting candidates / Joining only / Not progressing / Unknown).
  // Prefer the new profile's currentlyAccepting field; fall back to lodge.matching_status.
  let displayStatus = lodge.matching_status;
  if (p.currentlyAccepting === 'Yes') displayStatus = 'open';
  else if (p.currentlyAccepting === 'Yes but slow') displayStatus = 'open';
  else if (p.currentlyAccepting === 'No, no initiates currently') displayStatus = 'no_initiates';
  else if (p.currentlyAccepting === 'No, non-progressive') displayStatus = 'closed';

  const statusLabel = {
    'open': 'Accepting candidates',
    'no_initiates': 'Joining members only',
    'closed': 'Not progressing',
    'unknown': 'Status unknown'
  }[displayStatus];
  const statusClass = {
    'open': 'status-open',
    'no_initiates': 'status-attention',
    'closed': 'status-closed',
    'unknown': 'status-closed'
  }[displayStatus];

  // Lineage parse - "A 123 → B 456 → C 789"
  const lineageSteps = (lodge.lineage || '').split('→').map(s => s.trim()).filter(Boolean);

  // Quick facts - prefer new profile data, fall back to lodge record / enriched
  const meetingsSummary = (typeof summarizeMeetingRules === 'function') ? summarizeMeetingRules(p.meetingRules || []) : '';
  const factMeets = meetingsSummary || (lodge.meeting_days?.length ? lodge.meeting_days.join(', ') : '');
  const factRitual = p.ritualStandard || lodge.ritual || '';
  const factMembers = (p.subscribingMembers !== '' && p.subscribingMembers !== null && p.subscribingMembers !== undefined)
    ? p.subscribingMembers
    : (lodge.memberships ?? '');
  const factAttendance = (p.regularAttendance !== '' && p.regularAttendance !== null && p.regularAttendance !== undefined)
    ? `${p.regularAttendance} regularly attend`
    : (en?.regular_attendance ? `${en.regular_attendance} regularly attend` : '');
  const factSubscription = (p.annualSubscription !== '' && p.annualSubscription !== null && p.annualSubscription !== undefined)
    ? `\u00a3${p.annualSubscription}`
    : (en?.annual_subscription ? `\u00a3${en.annual_subscription}` : '');
  const factTime = p.meetingTime || en?.meeting_time || '';

  return `
    <div class="page">
      <div class="detail-back">
        <button data-nav="find">\u2190 Back to results</button>
      </div>

      <div class="detail-header${p.crestImage ? ' has-crest' : ''}">
        ${p.crestImage ? `<img src="${escapeHtml(p.crestImage)}" alt="${escapeHtml(lodge.name)} crest" class="detail-crest">` : ''}
        <div class="detail-header-text">
          <h1 class="detail-name">${escapeHtml(lodge.name)}</h1>
          <div class="detail-meta">
            <span class="num">L${escapeHtml(lodge.number)}</span>
            <button class="link-button" data-centre="${escapeHtml(slugify(lodge.centre))}">${escapeHtml(PORTAL_DATA.centres[lodge.centre]?.display_name || lodge.centre)}</button>
            <span class="muted">\u00b7</span>
            <span>${escapeHtml(lodge.region)}</span>
            <span class="muted">\u00b7</span>
            <span class="status-pill ${statusClass}"><span class="status-dot"></span>${escapeHtml(statusLabel)}</span>
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary" data-edit-profile="${escapeHtml(lodge.id)}">${hasOwnProfile ? 'Edit lodge profile' : 'Create lodge profile'}</button>
            ${lodge.family_tree_pdf ? `<a class="btn btn-secondary" href="${escapeHtml(lodge.family_tree_pdf)}" target="_blank" rel="noopener">View Family Tree (PDF)</a>` : ''}
            ${lodge.profile_pdf ? `<a class="btn btn-ghost btn-archive" href="${escapeHtml(lodge.profile_pdf)}" target="_blank" rel="noopener">View archived profile (PDF)</a>` : ''}
          </div>
        </div>
      </div>

      ${renderProfileStatusBanner(lodge, p)}

      <div class="detail-facts">
        <div class="fact">
          <div class="fact-label">Meets on</div>
          <div class="fact-value">
            ${factMeets ? escapeHtml(factMeets) : '<span class="muted">Not recorded</span>'}
            ${factTime ? `<span class="small">at ${escapeHtml(factTime)}</span>` : ''}
          </div>
        </div>
        <div class="fact">
          <div class="fact-label">Ritual</div>
          <div class="fact-value">${factRitual ? escapeHtml(factRitual) : '<span class="muted">\u2014</span>'}</div>
        </div>
        <div class="fact">
          <div class="fact-label">Membership</div>
          <div class="fact-value">${factMembers === '' ? '<span class="muted">\u2014</span>' : escapeHtml(String(factMembers))}<span class="small">${escapeHtml(factAttendance)}</span></div>
        </div>
        <div class="fact">
          <div class="fact-label">Annual subscription</div>
          <div class="fact-value">${factSubscription || '<span class="muted">\u2014</span>'}</div>
        </div>
      </div>

      <div class="detail-grid">
        <div>
          ${renderLodgeProfileSummary(lodge, p)}
        </div>
        <div>
          <div class="section">
            <h3>Lineage</h3>
            ${lineageSteps.length ? `
              <div class="lineage-chain">
                ${lineageSteps.map((step, i) => {
                  const isCurrent = i === lineageSteps.length - 1;
                  return `
                    <div class="lineage-step">
                      <div class="lineage-dot ${isCurrent ? 'current' : ''}"></div>
                      <div class="lineage-text ${isCurrent ? 'current' : ''}">${escapeHtml(step)}</div>
                    </div>
                    ${i < lineageSteps.length - 1 ? '<div class="lineage-arrow"></div>' : ''}
                  `;
                }).join('')}
              </div>
            ` : `<p class="muted">No lineage data recorded.</p>`}
            ${lodge.family_tree_pdf ? `<p style="margin-top:14px"><a href="${escapeHtml(lodge.family_tree_pdf)}" target="_blank" rel="noopener">View full family tree (PDF) \u2192</a></p>` : ''}
          </div>

          ${lodge.profile_pdf ? `
            <div class="section archived-pdf-note">
              <h4>Archived profile</h4>
              <p>This lodge has an older PDF profile from the previous portal. The structured profile shown on the left supersedes it, but the archived PDF remains available for reference.</p>
              <p><a href="${escapeHtml(lodge.profile_pdf)}" target="_blank" rel="noopener">Open archived profile (PDF) \u2192</a></p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}


// --- Directory (Regions & Centres) ---
function renderDirectory() {
  const tab = State.directoryTab || 'directory';
  const tabContent = tab === 'map' ? renderMapTab()
                   : tab === 'schedule' ? renderScheduleTab()
                   : renderDirectoryTab();
  return `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="eyebrow">Province directory</span>
          <h1>Regions &amp; centres</h1>
          <p class="page-header-sub">${PORTAL_DATA.regions.length} regions, ${Object.keys(PORTAL_DATA.centres).length} centres, ${PORTAL_DATA.lodges.length} lodges across the Province of Essex.</p>
        </div>
      </div>

      <div class="tabs-row">
        <button class="tab-btn ${tab === 'directory' ? 'active' : ''}" data-dirtab="directory">Directory</button>
        <button class="tab-btn ${tab === 'map' ? 'active' : ''}" data-dirtab="map">Map</button>
        <button class="tab-btn ${tab === 'schedule' ? 'active' : ''}" data-dirtab="schedule">Meeting schedule</button>
      </div>

      ${tabContent}
    </div>
  `;
}

function renderDirectoryTab() {
  return `
      <div class="directory-search-wrap">
        <svg class="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="9" cy="9" r="6"/>
          <path d="m14 14 4 4"/>
        </svg>
        <input id="directory-search" type="text" placeholder="Search by centre name, venue, town, or postcode" autocomplete="off">
        <button id="directory-clear" class="search-clear" type="button" aria-label="Clear search" style="display:none">&times;</button>
      </div>
      <div class="search-count" id="search-count">${Object.keys(PORTAL_DATA.centres).length} centres across the Province</div>

      <div id="directory-empty" class="empty-state" style="display:none">
        <div class="empty-state-title">No centres match your search</div>
        <p>Try a shorter or different term. You can search by centre name, venue, town, or postcode.</p>
      </div>

      ${PORTAL_DATA.regions.map(regionName => {
        const s = regionStats(regionName);
        return `
          <section class="region-section">
            <div class="region-section-header">
              <div>
                <h2>${escapeHtml(regionName)}</h2>
                <p class="region-section-sub">${s.centres.length} centres &middot; ${s.total} lodges</p>
              </div>
              <div class="region-stats">
                <div class="region-stat">
                  <span class="region-stat-num">${s.total}</span>
                  <span class="region-stat-label">lodges</span>
                </div>
                <div class="region-stat">
                  <span class="region-stat-num" style="color:var(--pw-green-deep)">${s.profiles}</span>
                  <span class="region-stat-label">profiles published</span>
                </div>
                <div class="region-stat">
                  <span class="region-stat-num" style="color:var(--pw-orange-deep)">${s.noProfile}</span>
                  <span class="region-stat-label">no profile</span>
                </div>
                <div class="region-stat">
                  <span class="region-stat-num" style="color:var(--ink-muted)">${s.noInitiates}</span>
                  <span class="region-stat-label">no initiates</span>
                </div>
              </div>
            </div>
            <div class="centre-grid">
              ${s.centres.sort((a, b) => a.name.localeCompare(b.name)).map(c => {
                const cs = centreStats(c);
                const colour = centreColour(c);
                return `
                  <button class="centre-card" data-centre="${escapeHtml(slugify(c.name))}" data-search="${escapeHtml([c.name, c.display_name, c.address?.venue, c.address?.postcode, ...(c.address?.lines || [])].filter(Boolean).join(' ').toLowerCase())}">
                    <div class="centre-card-photo tone-${colour}">
                      <span class="centre-card-initials">${escapeHtml(centreInitials(centreDisplayName(c)))}</span>
                    </div>
                    <div class="centre-card-body">
                      <div class="centre-card-name">${escapeHtml(centreDisplayName(c))}</div>
                      <div class="centre-card-stats">
                        <span><strong>${cs.total}</strong> lodges</span>
                        <span class="muted-sep">&middot;</span>
                        <span class="ok-text">${cs.profiles} profiles</span>
                      </div>
                      ${c.address ? `<div class="centre-card-addr">${escapeHtml(c.address.venue)}, ${escapeHtml(c.address.postcode)}</div>` : `<div class="centre-card-addr placeholder">Address to be added</div>`}
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
          </section>
        `;
      }).join('')}
  `;
}

function renderMapTab() {
  const numbered = numberedCentres();
  const colours = {
    'Essex North 1': 'blue',
    'Essex North 2': 'teal',
    'Essex South 1': 'orange',
    'Essex South 2': 'green',
  };

  // If a postcode search is active, calculate distances and tag each centre
  let centresWithDistance = numbered.map(({ centre, number }) => ({ centre, number, distance: null, inRange: true }));
  if (State.mapSearch) {
    centresWithDistance = centresWithDistance.map(item => {
      const d = (item.centre.lat && item.centre.lon)
        ? haversineMiles(State.mapSearch.lat, State.mapSearch.lon, item.centre.lat, item.centre.lon)
        : null;
      return { ...item, distance: d, inRange: d !== null && d <= State.mapSearch.distance };
    });
  }

  // Group for the key panel
  const byRegion = {};
  centresWithDistance.forEach(item => {
    byRegion[item.centre.region] = byRegion[item.centre.region] || [];
    byRegion[item.centre.region].push(item);
  });

  const inRangeCount = centresWithDistance.filter(c => c.inRange).length;
  const search = State.mapSearch;

  return `
    <div class="map-search-panel">
      <div class="map-search-fields">
        <div class="map-search-input-group">
          <label for="map-postcode" class="map-search-label">Postcode</label>
          <input type="text" id="map-postcode" placeholder="e.g. CO5 8QX" autocomplete="postal-code"
                 value="${escapeHtml(search?.input || '')}">
        </div>
        <div class="map-search-input-group narrow">
          <label for="map-distance" class="map-search-label">Within</label>
          <div class="map-distance-input">
            <input type="number" id="map-distance" min="1" max="100" value="${search?.distance || 10}">
            <span>mi</span>
          </div>
        </div>
        <button class="btn btn-primary" id="map-search-go" ${State.mapSearchLoading ? 'disabled' : ''}>
          ${State.mapSearchLoading ? 'Searching…' : 'Search'}
        </button>
        ${search ? '<button class="btn btn-secondary" id="map-search-clear">Clear</button>' : ''}
      </div>
      ${State.mapSearchError ? `<div class="map-search-error">${escapeHtml(State.mapSearchError)}</div>` : ''}
      ${search ? `
        <div class="map-search-result">
          <strong>${inRangeCount}</strong> ${inRangeCount === 1 ? 'centre' : 'centres'} within ${search.distance} miles of <strong>${escapeHtml(search.label)}</strong>${search.area ? ` (${escapeHtml(search.area)})` : ''}.
        </div>
      ` : `
        <div class="map-search-hint">Enter a UK postcode and distance to find centres in range. Lookup uses postcodes.io and needs an internet connection.</div>
      `}
    </div>
    <div class="map-layout">
      <div id="leaflet-map" class="leaflet-container"></div>
      <aside class="map-key">
        ${(() => {
          // If search active, sort centres globally by distance and show them in a flat list
          if (search) {
            const inRange = centresWithDistance.filter(c => c.inRange && c.distance !== null)
              .sort((a, b) => a.distance - b.distance);
            const outRange = centresWithDistance.filter(c => !c.inRange);
            if (inRange.length === 0) {
              return `
                <div class="map-key-empty">
                  <strong>No centres within ${search.distance} miles.</strong>
                  <p>Try increasing the distance or check the postcode.</p>
                </div>
              `;
            }
            return `
              <div class="map-key-region">
                <div class="map-key-region-header">
                  <span>In range</span>
                  <span class="map-key-count">${inRange.length}</span>
                </div>
                <ul class="map-key-list">
                  ${inRange.map(({ centre, number, distance }) => {
                    const tone = colours[centre.region] || 'magenta';
                    return `
                      <li>
                        <button class="map-key-entry" data-centre="${escapeHtml(slugify(centre.name))}">
                          <span class="map-key-num tone-${tone}">${number}</span>
                          <span class="map-key-name">${escapeHtml(centreDisplayName(centre))}</span>
                          <span class="map-key-distance">${formatDistance(distance)}</span>
                        </button>
                      </li>
                    `;
                  }).join('')}
                </ul>
              </div>
              ${outRange.length ? `
                <div class="map-key-region map-key-dim">
                  <div class="map-key-region-header">
                    <span>Out of range</span>
                    <span class="map-key-count">${outRange.length}</span>
                  </div>
                  <ul class="map-key-list">
                    ${outRange.sort((a, b) => (a.distance || 999) - (b.distance || 999)).map(({ centre, number, distance }) => {
                      const tone = colours[centre.region] || 'magenta';
                      return `
                        <li>
                          <button class="map-key-entry" data-centre="${escapeHtml(slugify(centre.name))}">
                            <span class="map-key-num tone-${tone}">${number}</span>
                            <span class="map-key-name">${escapeHtml(centreDisplayName(centre))}</span>
                            ${distance !== null ? `<span class="map-key-distance">${formatDistance(distance)}</span>` : ''}
                          </button>
                        </li>
                      `;
                    }).join('')}
                  </ul>
                </div>
              ` : ''}
            `;
          }
          // No search active: group by region as before
          return PORTAL_DATA.regions.map(region => {
            const list = byRegion[region] || [];
            if (!list.length) return '';
            const tone = colours[region] || 'magenta';
            return `
              <div class="map-key-region">
                <div class="map-key-region-header tone-${tone}">
                  <span class="map-key-swatch"></span>
                  <span>${escapeHtml(region)}</span>
                  <span class="map-key-count">${list.length}</span>
                </div>
                <ul class="map-key-list">
                  ${list.map(({ centre, number }) => `
                    <li>
                      <button class="map-key-entry" data-centre="${escapeHtml(slugify(centre.name))}">
                        <span class="map-key-num tone-${tone}">${number}</span>
                        <span class="map-key-name">${escapeHtml(centreDisplayName(centre))}</span>
                      </button>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `;
          }).join('');
        })()}
      </aside>
    </div>
  `;
}

function renderScheduleTab() {
  const sched = State.scheduleState || { day: defaultScheduleDay(), region: 'all' };
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  // Filter lodges
  let lodges = PORTAL_DATA.lodges.filter(l => l.meeting_days?.includes(sched.day));
  if (sched.region !== 'all') {
    lodges = lodges.filter(l => l.region === sched.region);
  }
  lodges.sort((a, b) => (a.centre + a.name).localeCompare(b.centre + b.name));

  // Group by centre for display
  const byCentre = {};
  lodges.forEach(l => {
    byCentre[l.centre] = byCentre[l.centre] || [];
    byCentre[l.centre].push(l);
  });

  const totalForDay = PORTAL_DATA.lodges.filter(l => l.meeting_days?.includes(sched.day)).length;

  return `
    <div class="schedule-controls">
      <div class="day-tabs">
        ${days.map(d => `
          <button class="day-tab ${sched.day === d ? 'active' : ''}" data-schedday="${d}">
            <span class="day-tab-name">${d}</span>
            <span class="day-tab-count">${PORTAL_DATA.lodges.filter(l => l.meeting_days?.includes(d)).length}</span>
          </button>
        `).join('')}
      </div>
      <div class="region-filter">
        <span class="filter-label">Region:</span>
        <button class="choice-pill ${sched.region === 'all' ? 'active' : ''}" data-schedregion="all">All</button>
        ${PORTAL_DATA.regions.map(r => `
          <button class="choice-pill ${sched.region === r ? 'active' : ''}" data-schedregion="${escapeHtml(r)}">${escapeHtml(r)}</button>
        `).join('')}
      </div>
    </div>

    <div class="schedule-summary">
      <strong>${lodges.length}</strong> ${lodges.length === 1 ? 'lodge meets' : 'lodges meet'} on ${sched.day}${sched.region !== 'all' ? ' in ' + sched.region : 's across the province'}${sched.region === 'all' ? '' : ''}.
    </div>

    ${lodges.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-title">No lodges meet on ${sched.day}${sched.region !== 'all' ? ' in ' + sched.region : ''}</div>
        <p>Try a different day or remove the region filter.</p>
      </div>
    ` : Object.entries(byCentre).map(([centreName, list]) => `
      <div class="schedule-centre-group">
        <div class="schedule-centre-header">
          <button class="link-button" data-centre="${escapeHtml(slugify(centreName))}">${escapeHtml(PORTAL_DATA.centres[centreName]?.display_name || centreName)}</button>
          <span class="muted">${list.length} ${list.length === 1 ? 'lodge' : 'lodges'}</span>
        </div>
        <div class="day-group-list">
          ${list.map(l => {
            const en = enrichedFor(l.id);
            const status = l.matching_status;
            const statusLabel = {
              'open': 'Accepting', 'no_initiates': 'No initiates',
              'closed': 'Not progressing', 'unknown': 'Unknown'
            }[status];
            const statusClass = {
              'open': 'status-open', 'no_initiates': 'status-attention',
              'closed': 'status-closed', 'unknown': 'status-closed'
            }[status];
            return `
              <button class="lodge-mini" data-lodge="${escapeHtml(l.id)}">
                <div class="lodge-mini-name">
                  <span>${escapeHtml(l.name)}</span>
                  <span class="number">L${escapeHtml(l.number)}</span>
                </div>
                <div class="lodge-mini-meta">
                  <span>${escapeHtml(l.ritual || 'Ritual unknown')}</span>
                  ${l.memberships !== null ? `<span class="muted-sep">&middot;</span><span>${l.memberships} members</span>` : ''}
                  ${en ? `<span class="muted-sep">&middot;</span><span class="badge badge-magenta">Full profile</span>` : ''}
                </div>
                <span class="status-pill ${statusClass}"><span class="status-dot"></span>${escapeHtml(statusLabel)}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `).join('')}
  `;
}

function defaultScheduleDay() {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  let d = days[new Date().getDay()];
  if (d === 'Sunday') d = 'Monday'; // no lodges meet on Sunday
  return d;
}

// ===== Leaflet map initialisation =====
function initLeafletMap() {
  if (typeof L === 'undefined') {
    const container = document.getElementById('leaflet-map');
    if (container) {
      container.innerHTML = '<div class="map-fallback">The map library failed to load. Check your internet connection and try again.</div>';
    }
    return;
  }
  const container = document.getElementById('leaflet-map');
  if (!container) return;

  // Bounds for Essex
  const map = L.map(container, {
    center: [51.78, 0.55],
    zoom: 10,
    scrollWheelZoom: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Add a marker for each centre. Markers carry the index from the side key.
  const numbered = numberedCentres();
  const markers = [];
  const colours = {
    'Essex North 1': '#1E5BCC',
    'Essex North 2': '#16B8C7',
    'Essex South 1': '#F37029',
    'Essex South 2': '#2FA94D',
  };
  const search = State.mapSearch;
  numbered.forEach(({ centre: c, number }) => {
    if (!c.lat || !c.lon) return;
    const colour = colours[c.region] || '#D946A8';
    let inRange = true;
    let distance = null;
    if (search) {
      distance = haversineMiles(search.lat, search.lon, c.lat, c.lon);
      inRange = distance <= search.distance;
    }
    const dimClass = (search && !inRange) ? ' centre-marker-dim' : '';
    const icon = L.divIcon({
      className: 'centre-marker' + dimClass,
      html: `<div class="centre-marker-pin${dimClass}" style="border-color:${colour}; color:${colour}"><span>${number}</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    const marker = L.marker([c.lat, c.lon], { icon, opacity: (search && !inRange) ? 0.45 : 1 }).addTo(map);
    const displayName = c.display_name || c.name;
    marker.bindPopup(`
      <div class="map-popup">
        <div class="map-popup-num" style="background:${colour}">${number}</div>
        <strong>${escapeHtml(displayName)}</strong>
        <div class="map-popup-meta">${escapeHtml(c.region)} &middot; ${c.lodge_ids.length} ${c.lodge_ids.length === 1 ? 'lodge' : 'lodges'}</div>
        ${distance !== null ? `<div class="map-popup-distance">${formatDistance(distance)} from search point</div>` : ''}
        ${c.address ? `<div class="map-popup-addr">${escapeHtml(c.address.venue)}, ${escapeHtml(c.address.postcode)}</div>` : ''}
        <button class="map-popup-link" data-centre="${escapeHtml(slugify(c.name))}">Open centre page &rarr;</button>
      </div>
    `);
    markers.push(marker);
  });

  // If a search is active, draw the circle and a pin for the search point
  if (search) {
    const radiusMetres = search.distance * 1609.344;
    L.circle([search.lat, search.lon], {
      radius: radiusMetres,
      color: '#D946A8',
      weight: 2,
      fillColor: '#D946A8',
      fillOpacity: 0.08,
    }).addTo(map);
    // Search-point pin
    const searchIcon = L.divIcon({
      className: 'search-point-marker',
      html: `<div class="search-point-pin"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([search.lat, search.lon], { icon: searchIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`<div class="map-popup"><strong>${escapeHtml(search.label)}</strong>${search.area ? `<div class="map-popup-meta">${escapeHtml(search.area)}</div>` : ''}<div class="map-popup-addr">Search centre, ${search.distance} mile radius</div></div>`);
    // Fit map to the circle bounds
    const circleBounds = L.latLng(search.lat, search.lon).toBounds(radiusMetres * 2.4);
    map.fitBounds(circleBounds, { padding: [20, 20] });
    return;
  }

  // Fit map to all markers
  if (markers.length) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}


// --- Centre detail ---
function renderCentre() {
  const centre = centreById(State.currentCentreId);
  if (!centre) {
    return `<div class="page"><div class="empty-state">Centre not found</div></div>`;
  }
  const s = centreStats(centre);
  const colour = centreColour(centre);
  const addr = centre.address;

  // Group lodges by day for a useful breakdown
  const byDay = {};
  s.lodges.forEach(l => {
    (l.meeting_days || ['Unscheduled']).forEach(d => {
      byDay[d] = byDay[d] || [];
      byDay[d].push(l);
    });
  });
  const dayOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','Unscheduled'];

  return `
    <div class="page">
      <div class="detail-back">
        <button data-nav="directory">&larr; Back to directory</button>
      </div>

      <div class="centre-hero">
        <div class="centre-hero-photo tone-${colour}">
          <span class="centre-hero-initials">${escapeHtml(centreInitials(centreDisplayName(centre)))}</span>
        </div>
        <div class="centre-hero-body">
          <span class="eyebrow">${escapeHtml(centre.region)}</span>
          <h1>${escapeHtml(centreDisplayName(centre))}</h1>
          ${addr ? `
            <address class="centre-address">
              <strong>${escapeHtml(addr.venue)}</strong><br>
              ${addr.lines.map(l => escapeHtml(l)).join('<br>')}<br>
              <span class="mono">${escapeHtml(addr.postcode)}</span>
            </address>
          ` : `<p class="address-placeholder">Address to be added through the admin interface.</p>`}
        </div>
      </div>

      <div class="detail-facts" style="margin-bottom:24px">
        <div class="fact">
          <div class="fact-label">Total lodges</div>
          <div class="fact-value">${s.total}</div>
        </div>
        <div class="fact">
          <div class="fact-label">Profiles published</div>
          <div class="fact-value" style="color:var(--pw-green-deep)">${s.profiles}</div>
        </div>
        <div class="fact">
          <div class="fact-label">No profile yet</div>
          <div class="fact-value" style="color:var(--pw-orange-deep)">${s.noProfile}</div>
        </div>
        <div class="fact">
          <div class="fact-label">No initiates</div>
          <div class="fact-value" style="color:var(--ink-muted)">${s.noInitiates}</div>
        </div>
      </div>

      ${centre.data_gap_note ? `
        <div class="data-gap-note">
          <div class="data-gap-icon">!</div>
          <div>
            <strong>Data gap</strong>
            <p>${escapeHtml(centre.data_gap_note)}</p>
          </div>
        </div>
      ` : ''}

      <div class="section">
        <h3>Lodges meeting here</h3>
        <p class="subtle-text" style="margin-bottom:18px">${s.total === 0 ? 'No lodge records on file for this centre yet.' : 'Grouped by meeting day. Click any lodge to open its profile.'}</p>
        ${dayOrder.filter(d => byDay[d]).map(day => `
          <div class="day-group">
            <div class="day-group-header">${escapeHtml(day)}</div>
            <div class="day-group-list">
              ${byDay[day].sort((a,b) => a.name.localeCompare(b.name)).map(l => {
                const en = enrichedFor(l.id);
                const status = l.matching_status;
                const statusLabel = {
                  'open': 'Accepting',
                  'no_initiates': 'No initiates',
                  'closed': 'Not progressing',
                  'unknown': 'Unknown'
                }[status];
                const statusClass = {
                  'open': 'status-open',
                  'no_initiates': 'status-attention',
                  'closed': 'status-closed',
                  'unknown': 'status-closed'
                }[status];
                return `
                  <button class="lodge-mini" data-lodge="${escapeHtml(l.id)}">
                    <div class="lodge-mini-name">
                      <span>${escapeHtml(l.name)}</span>
                      <span class="number">L${escapeHtml(l.number)}</span>
                    </div>
                    <div class="lodge-mini-meta">
                      <span>${escapeHtml(l.ritual || 'Ritual unknown')}</span>
                      ${l.memberships !== null ? `<span class="muted-sep">&middot;</span><span>${l.memberships} members</span>` : ''}
                      ${en ? `<span class="muted-sep">&middot;</span><span class="badge badge-magenta">Full profile</span>` : ''}
                    </div>
                    <span class="status-pill ${statusClass}"><span class="status-dot"></span>${escapeHtml(statusLabel)}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}



// --- Family Trees ---
function renderTrees() {
  const lineages = PORTAL_DATA.lineages;
  if (!lineages) return '<div class="page"><div class="empty-state">Lineage data not available</div></div>';
  const roots = lineages.roots.slice().sort((a, b) => {
    return (lineages.nodes[b].descendants) - (lineages.nodes[a].descendants);
  });
  const totalLodgesInGraph = Object.keys(lineages.nodes).length;
  const totalInData = Object.values(lineages.nodes).filter(n => n.in_data).length;
  return `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="eyebrow">Province genealogy</span>
          <h1>Family Trees</h1>
          <p class="page-header-sub">${roots.length} founding lodges seeded the ${totalInData} lodges in the Province today. ${totalLodgesInGraph - totalInData} ancestors appear in the lineage but sit outside Essex or have since been erased.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" data-action="trees-collapse">Collapse all</button>
          <button class="btn btn-secondary" data-action="trees-expand">Expand all</button>
        </div>
      </div>

      <div class="directory-search-wrap">
        <svg class="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="9" cy="9" r="6"/>
          <path d="m14 14 4 4"/>
        </svg>
        <input id="tree-search" type="text" placeholder="Search by lodge name or number" autocomplete="off">
        <button id="tree-clear" class="search-clear" type="button" aria-label="Clear search" style="display:none">&times;</button>
      </div>
      <div class="search-count" id="tree-search-count">${roots.length} founding lodges &middot; ${totalLodgesInGraph} lodges across all generations</div>

      <div class="tree-forest">
        ${roots.map(rootRef => renderTreeRoot(rootRef)).join('')}
      </div>
    </div>
  `;
}

function renderTreeRoot(rootRef) {
  const node = PORTAL_DATA.lineages.nodes[rootRef];
  const children = PORTAL_DATA.lineages.children[rootRef] || [];
  const isExpanded = State.treesExpanded[rootRef] === true;
  const descCount = node.descendants;
  return `
    <section class="tree-root" data-root="${escapeHtml(rootRef)}">
      <div class="tree-root-header">
        <button class="tree-toggle" data-toggle-tree="${escapeHtml(rootRef)}" aria-expanded="${isExpanded}">
          <span class="tree-toggle-chev ${isExpanded ? 'open' : ''}">&#9656;</span>
          <span class="tree-root-name">${escapeHtml(node.name)}</span>
          ${node.number ? `<span class="tree-num">L${escapeHtml(node.number)}</span>` : ''}
          ${!node.in_data ? '<span class="tree-extra-province">outside Essex</span>' : ''}
        </button>
        <span class="tree-root-count">${descCount} ${descCount === 1 ? 'descendant' : 'descendants'}</span>
      </div>
      ${isExpanded ? `<ul class="tree-list">${children.map(c => renderTreeNode(c, 1)).join('')}</ul>` : ''}
    </section>
  `;
}

function renderTreeNode(ref, depth) {
  const node = PORTAL_DATA.lineages.nodes[ref];
  if (!node) return '';
  const children = PORTAL_DATA.lineages.children[ref] || [];
  const hasChildren = children.length > 0;
  return `
    <li class="tree-node" data-ref="${escapeHtml(ref)}" data-search="${escapeHtml((node.name + ' ' + (node.number || '')).toLowerCase())}">
      <div class="tree-row">
        <span class="tree-dot ${node.in_data ? 'in-data' : 'ancestor'}"></span>
        ${node.in_data && node.lodge_id
          ? `<button class="tree-name link-button" data-lodge="${escapeHtml(node.lodge_id)}">${escapeHtml(node.name)}</button>`
          : `<span class="tree-name ${node.in_data ? '' : 'ancestor'}">${escapeHtml(node.name)}</span>`
        }
        ${node.number ? `<span class="tree-num">L${escapeHtml(node.number)}</span>` : ''}
        ${!node.in_data ? '<span class="tree-extra-province">outside Essex</span>' : ''}
        ${hasChildren ? `<span class="tree-row-count">${children.length} direct${node.descendants > children.length ? `, ${node.descendants} total` : ''}</span>` : ''}
      </div>
      ${hasChildren ? `<ul class="tree-list">${children.map(c => renderTreeNode(c, depth + 1)).join('')}</ul>` : ''}
    </li>
  `;
}

// --- Admin ---
// ===== Admin page helpers =====
// Compute everything from currently-stored profiles. No event log yet - we derive
// activity and worklist on the fly from lastEditedAt / submittedAt timestamps.

function _adminAllProfiles() {
  const all = [];
  for (const lodge of PORTAL_DATA.lodges) {
    if (!hasStoredProfile(lodge.id)) continue;
    const profile = loadProfile(lodge.id);
    const mostRecent = profile.lastEditedAt || profile.submittedAt || '';
    all.push({ lodge, profile, mostRecentDate: mostRecent });
  }
  return all;
}

function _adminStats() {
  const profiles = _adminAllProfiles();
  let submitted = 0;
  let dueSoon = 0;
  let overdue = 0;
  for (const item of profiles) {
    if (item.profile.submittedAt) submitted++;
    const months = _monthsSince(item.mostRecentDate);
    if (months !== null) {
      if (months >= 36) overdue++;
      else if (months >= 30) dueSoon++;
    }
  }
  const outstanding = PORTAL_DATA.lodges.length - profiles.length;
  return {
    totalLodges: PORTAL_DATA.lodges.length,
    totalProfiles: profiles.length,
    submitted,
    dueSoon,
    overdue,
    outstanding
  };
}

function _adminRecentActivity(days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const events = [];
  for (const lodge of PORTAL_DATA.lodges) {
    if (!hasStoredProfile(lodge.id)) continue;
    const profile = loadProfile(lodge.id);
    if (profile.submittedAt) {
      const d = new Date(profile.submittedAt);
      if (!isNaN(d.getTime()) && d >= cutoff) {
        events.push({ lodge, date: d, dateIso: profile.submittedAt, type: 'submitted' });
      }
    }
    if (profile.lastEditedAt && profile.lastEditedAt !== profile.submittedAt) {
      const d = new Date(profile.lastEditedAt);
      if (!isNaN(d.getTime()) && d >= cutoff) {
        events.push({ lodge, date: d, dateIso: profile.lastEditedAt, type: 'edited' });
      }
    }
  }
  events.sort((a, b) => b.date - a.date);
  return events;
}

function _adminWorklist() {
  const all = _adminAllProfiles();
  const overdue = [];
  const dueSoon = [];
  for (const item of all) {
    const months = _monthsSince(item.mostRecentDate);
    if (months === null) continue;
    const entry = { ...item, months: Math.floor(months) };
    if (months >= 36) overdue.push(entry);
    else if (months >= 30) dueSoon.push(entry);
  }
  // Oldest first within each bucket
  overdue.sort((a, b) => b.months - a.months);
  dueSoon.sort((a, b) => b.months - a.months);

  // Outstanding: lodges that have never had a profile saved in the portal.
  // Sorted by centre then lodge name so admins can work through systematically.
  const outstanding = [];
  for (const lodge of PORTAL_DATA.lodges) {
    if (!hasStoredProfile(lodge.id)) {
      outstanding.push(lodge);
    }
  }
  outstanding.sort((a, b) => {
    const c = (a.centre || '').localeCompare(b.centre || '');
    if (c !== 0) return c;
    return (a.name || '').localeCompare(b.name || '');
  });

  return { overdue, dueSoon, outstanding };
}

function _adminFormatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) { return ''; }
}

function renderAdmin() {
  const stats = _adminStats();
  const activity = _adminRecentActivity(30);
  const worklist = _adminWorklist();

  return `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="eyebrow">Admin</span>
          <h1>Province dashboard</h1>
          <p class="page-header-sub">Overview of lodge profile health and recent activity.</p>
        </div>
      </div>

      <div class="admin-stats">
        <div class="admin-stat">
          <div class="admin-stat-number">${stats.totalLodges}</div>
          <div class="admin-stat-label">Lodges in Province</div>
        </div>
        <div class="admin-stat">
          <div class="admin-stat-number">${stats.submitted}</div>
          <div class="admin-stat-label">Profiles submitted</div>
        </div>
        <div class="admin-stat ${stats.outstanding > 0 ? 'info' : ''}">
          <div class="admin-stat-number">${stats.outstanding}</div>
          <div class="admin-stat-label">Outstanding</div>
        </div>
        <div class="admin-stat ${stats.dueSoon > 0 ? 'warning' : ''}">
          <div class="admin-stat-number">${stats.dueSoon}</div>
          <div class="admin-stat-label">Due soon</div>
        </div>
        <div class="admin-stat ${stats.overdue > 0 ? 'critical' : ''}">
          <div class="admin-stat-number">${stats.overdue}</div>
          <div class="admin-stat-label">Overdue</div>
        </div>
      </div>

      <div class="admin-section">
        <h2>Recent activity</h2>
        <p class="admin-section-sub">Profile submissions and edits in the last 30 days, most recent first.</p>
        ${activity.length ? `
          <div class="admin-activity-list">
            ${activity.map(e => `
              <div class="admin-activity-item">
                <span class="admin-activity-date">${escapeHtml(_adminFormatDate(e.dateIso))}</span>
                <button class="link-button admin-activity-lodge" data-lodge="${escapeHtml(e.lodge.id)}">${escapeHtml(e.lodge.name)} <span class="num mono">L${escapeHtml(e.lodge.number)}</span></button>
                <span class="admin-activity-action ${e.type}">${e.type === 'submitted' ? 'submitted to Province' : 'profile edited'}</span>
              </div>
            `).join('')}
          </div>
        ` : `<p class="muted">No profile activity in the last 30 days.</p>`}
      </div>

      <div class="admin-section">
        <h2>Needs attention</h2>
        <p class="admin-section-sub">Lodges whose profiles need refreshing, oldest first.</p>

        ${worklist.overdue.length ? `
          <div class="admin-worklist-block overdue">
            <h3>Overdue <span class="admin-worklist-count">${worklist.overdue.length}</span></h3>
            <p class="admin-worklist-intro">Past the 36-month review point. Contact lodges to refresh.</p>
            <div class="admin-worklist">
              ${worklist.overdue.map(item => `
                <button class="admin-worklist-item" data-lodge="${escapeHtml(item.lodge.id)}">
                  <div class="admin-worklist-name">
                    <strong>${escapeHtml(item.lodge.name)}</strong>
                    <span class="num mono">L${escapeHtml(item.lodge.number)}</span>
                    <span class="muted">${escapeHtml(item.lodge.centre)}</span>
                  </div>
                  <div class="admin-worklist-age">${item.months} months stale</div>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${worklist.dueSoon.length ? `
          <div class="admin-worklist-block due-soon">
            <h3>Due soon <span class="admin-worklist-count">${worklist.dueSoon.length}</span></h3>
            <p class="admin-worklist-intro">Between 30 and 36 months stale. Worth reaching out.</p>
            <div class="admin-worklist">
              ${worklist.dueSoon.map(item => `
                <button class="admin-worklist-item" data-lodge="${escapeHtml(item.lodge.id)}">
                  <div class="admin-worklist-name">
                    <strong>${escapeHtml(item.lodge.name)}</strong>
                    <span class="num mono">L${escapeHtml(item.lodge.number)}</span>
                    <span class="muted">${escapeHtml(item.lodge.centre)}</span>
                  </div>
                  <div class="admin-worklist-age">${item.months} months stale</div>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${worklist.outstanding.length ? `
          <div class="admin-worklist-block outstanding">
            <h3>Profile outstanding <span class="admin-worklist-count">${worklist.outstanding.length}</span></h3>
            <p class="admin-worklist-intro">These lodges have not yet completed a profile in the portal. Grouped by centre.</p>
            <div class="admin-worklist">
              ${worklist.outstanding.map(lodge => `
                <button class="admin-worklist-item" data-lodge="${escapeHtml(lodge.id)}">
                  <div class="admin-worklist-name">
                    <strong>${escapeHtml(lodge.name)}</strong>
                    <span class="num mono">L${escapeHtml(lodge.number)}</span>
                    <span class="muted">${escapeHtml(lodge.centre)}</span>
                  </div>
                  <div class="admin-worklist-age">No profile</div>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${!worklist.overdue.length && !worklist.dueSoon.length && !worklist.outstanding.length ? `
          <p class="muted">All lodges have an up-to-date profile. Nothing to chase.</p>
        ` : ''}
      </div>
    </div>
  `;
}

