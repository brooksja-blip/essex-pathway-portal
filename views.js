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
  // Age profile chip - shows the bucket (Younger / Mixed / Older) when a profile is set
  if (en?.age_demographic) {
    tags.push(`<span class="tag age">Age: ${escapeHtml(en.age_demographic)}</span>`);
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
  const en = enrichedFor(lodge.id);

  const statusLabel = {
    'open': 'Accepting candidates',
    'no_initiates': 'Joining members only',
    'closed': 'Not progressing',
    'unknown': 'Status unknown'
  }[lodge.matching_status];
  const statusClass = {
    'open': 'status-open',
    'no_initiates': 'status-attention',
    'closed': 'status-closed',
    'unknown': 'status-closed'
  }[lodge.matching_status];

  // Lineage parse - "A 123 → B 456 → C 789"
  const lineageSteps = (lodge.lineage || '').split('→').map(s => s.trim()).filter(Boolean);

  return `
    <div class="page">
      <div class="detail-back">
        <button data-nav="find">← Back to results</button>
      </div>

      <div class="detail-header">
        <h1 class="detail-name">${escapeHtml(lodge.name)}${en?._demo === true ? '<span class="demo-badge">Demo profile</span>' : ''}</h1>
        <div class="detail-meta">
          <span class="num">L${escapeHtml(lodge.number)}</span>
          <button class="link-button" data-centre="${escapeHtml(slugify(lodge.centre))}">${escapeHtml(PORTAL_DATA.centres[lodge.centre]?.display_name || lodge.centre)}</button>
          <span class="muted">·</span>
          <span>${escapeHtml(lodge.region)}</span>
          <span class="muted">·</span>
          <span class="status-pill ${statusClass}"><span class="status-dot"></span>${escapeHtml(statusLabel)}</span>
        </div>
        <div class="detail-actions">
          <button class="btn btn-primary" data-edit-profile="${escapeHtml(lodge.id)}">Edit lodge profile</button>
          ${lodge.profile_pdf ? `<a class="btn btn-secondary" href="${escapeHtml(lodge.profile_pdf)}" target="_blank" rel="noopener">View Lodge Profile (PDF)</a>` : ''}
          ${lodge.family_tree_pdf ? `<a class="btn btn-secondary" href="${escapeHtml(lodge.family_tree_pdf)}" target="_blank" rel="noopener">View Family Tree (PDF)</a>` : ''}
        </div>
      </div>

      <div class="detail-facts">
        <div class="fact">
          <div class="fact-label">Meets on</div>
          <div class="fact-value">
            ${lodge.meeting_days?.length ? lodge.meeting_days.join(', ') : '<span class="muted">Schedule not parsed</span>'}
            ${en?.meeting_time ? `<span class="small">at ${escapeHtml(en.meeting_time)}</span>` : ''}
          </div>
        </div>
        <div class="fact">
          <div class="fact-label">Ritual</div>
          <div class="fact-value">${escapeHtml(lodge.ritual || '—')}</div>
        </div>
        <div class="fact">
          <div class="fact-label">Membership</div>
          <div class="fact-value">${lodge.memberships ?? '—'}<span class="small">${en?.regular_attendance ? `${en.regular_attendance} regularly attend` : ''}</span></div>
        </div>
        <div class="fact">
          <div class="fact-label">Annual subscription</div>
          <div class="fact-value">${en?.annual_subscription ? `£${en.annual_subscription}` : '<span class="muted">—</span>'}<span class="small">${en?.meal_costs_separate === false ? 'meals included' : en?.meal_costs_separate ? 'meals extra' : ''}</span></div>
        </div>
      </div>

      <div class="detail-grid">
        <div>
          ${en ? `
            <div class="section">
              <h3>Summary</h3>
              <p>${escapeHtml(en.summary)}</p>
            </div>

            <div class="section">
              <h3>The lodge in detail</h3>
              ${en.consecrated_year ? `<p><strong>Consecrated:</strong> ${en.consecrated_year}${en.sponsoring_lodge ? ` · Sponsored by ${escapeHtml(en.sponsoring_lodge)}` : ''}</p>` : ''}
              ${en.meets_at ? `<p><strong>Meets at:</strong> ${escapeHtml(en.meets_at)}</p>` : ''}
              ${en.festive_board_notes ? `<p><strong>Festive Board:</strong> ${escapeHtml(en.festive_board_notes)}</p>` : ''}
              ${en.lodge_of_instruction ? `<p><strong>Lodge of Instruction:</strong> ${escapeHtml(en.lodge_of_instruction)}</p>` : ''}
              ${en.social_events?.length ? `<p><strong>Social calendar:</strong> ${en.social_events.map(escapeHtml).join(', ')}</p>` : ''}
              ${en.ritual_notes ? `<p><strong>Ritual notes:</strong> ${escapeHtml(en.ritual_notes)}</p>` : ''}
              ${en.masonic_education_notes ? `<p><strong>Masonic education:</strong> ${escapeHtml(en.masonic_education_notes)}</p>` : ''}
              ${en.diversity_statement ? `<p><strong>Inclusion:</strong> ${escapeHtml(en.diversity_statement)}</p>` : ''}
              ${en.universities_scheme ? `<p><strong>Universities Scheme:</strong> ${escapeHtml(en.universities_scheme_notes || 'Yes')}</p>` : ''}
            </div>

            ${en.lodge_priorities?.length ? `
              <div class="section">
                <h3>What this lodge prioritises</h3>
                <p class="subtle-text">Ranked by the lodge itself.</p>
                <ol class="priority-list">
                  ${en.lodge_priorities.map((p, i) => `
                    <li><span class="priority-num">${String(i+1).padStart(2,'0')}</span><span>${escapeHtml(p)}</span></li>
                  `).join('')}
                </ol>
              </div>
            ` : ''}

            ${en.candidate_motivations_served?.length ? `
              <div class="section">
                <h3>Reasons to join this lodge</h3>
                <p class="subtle-text">Motivations this lodge is likely to satisfy.</p>
                <ul class="motivation-list">
                  ${en.candidate_motivations_served.map(m => `<li><span class="priority-num">·</span><span>${escapeHtml(m)}</span></li>`).join('')}
                </ul>
              </div>
            ` : ''}
          ` : `
            <div class="section">
              <h3>About this lodge</h3>
              <p>This lodge does not yet have a fully structured profile in the portal. Basic information from the source data is shown below. The lodge profile PDF, where available, contains the full briefing the membership team would want.</p>
              <p>The schedule, ritual, and membership count above come from the source data and are accurate. Other matching criteria require the profile PDF to be structured.</p>
              ${lodge.profile_pdf ? `<p><a href="${escapeHtml(lodge.profile_pdf)}" target="_blank" rel="noopener">Open the lodge profile PDF →</a></p>` : '<p class="muted">No lodge profile PDF is published yet for this lodge.</p>'}
            </div>
          `}
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
            ${lodge.family_tree_pdf ? `<p style="margin-top:14px"><a href="${escapeHtml(lodge.family_tree_pdf)}" target="_blank" rel="noopener">View full family tree (PDF) →</a></p>` : ''}
          </div>

          ${en ? `
            <div class="section">
              <h3>Membership health</h3>
              <p><strong>Health:</strong> ${escapeHtml(en.health || '—')}</p>
              ${en.age_demographic ? `<p><strong>Age profile:</strong> ${escapeHtml(en.age_demographic)}${en.age_notes ? '. ' + escapeHtml(en.age_notes) : ''}</p>` : ''}
              ${en.candidates_waiting !== undefined ? `<p><strong>Candidates waiting:</strong> ${en.candidates_waiting}</p>` : ''}
              ${en.initiates_12_months !== undefined ? `<p><strong>Initiates last 12 months:</strong> ${en.initiates_12_months}</p>` : ''}
              ${en.joiners_12_months !== undefined ? `<p><strong>Joining members last 12 months:</strong> ${en.joiners_12_months}</p>` : ''}
              ${en.progression_pace ? `<p><strong>Progression pace:</strong> ${escapeHtml(en.progression_pace)}${en.progression_notes ? '. ' + escapeHtml(en.progression_notes) : ''}</p>` : ''}
              ${en.communication_channels?.length ? `<p><strong>Communication:</strong> ${en.communication_channels.map(escapeHtml).join(', ')}</p>` : ''}
            </div>
          ` : ''}

          ${en?._demo ? `
            <div class="section" style="background:var(--accent-orange-soft); border-color:var(--accent-orange);">
              <h4 style="color:var(--accent-orange); margin-bottom:8px;">Demo profile</h4>
              <p style="font-size:14px; margin-bottom:0;">This lodge's structured profile is fabricated for the prototype. Real data would come from the lodge profile PDF parsed through the admin interface.</p>
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
function renderAdmin() {
  return `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="eyebrow">Admin</span>
          <h1>Lodge data management</h1>
          <p class="page-header-sub">Where the team will structure profile PDFs into matchable data.</p>
        </div>
      </div>

      <div class="admin-shell">
        <div class="admin-shell-title">Admin interface goes here</div>
        <p class="admin-shell-desc">
          In the full build, this is where authorised members of the team will edit lodge records, structure
          information from profile PDFs into the matching fields, mark lodges as currently accepting candidates,
          and update lineage information. The prototype shows the working face of the portal. The admin side
          is the next phase.
        </p>
        <div class="flex gap-2" style="justify-content:center">
          <button class="btn btn-secondary" data-nav="find">Back to Find a Lodge</button>
        </div>
      </div>
    </div>
  `;
}

