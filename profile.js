// Pathway Portal profile editor - helpers, render functions, handlers

// ===== Configuration =====
// PLACEHOLDER: Replace with the real Provincial Membership Team email address.
const PROVINCE_EMAIL = 'membership@essexprovince.org.uk';

// ===== Lodge Profile editor =====

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function profileKey(lodgeId) { return 'pathway_profile_' + lodgeId; }

function loadProfile(lodgeId) {
  let loaded = null;
  try {
    const stored = localStorage.getItem(profileKey(lodgeId));
    if (stored) loaded = JSON.parse(stored);
  } catch (e) {}
  // Priority: localStorage override > baked-in example profile > old enriched
  // demo data > empty defaults. localStorage always wins so the user's own
  // edits never get clobbered by a baked-in example.
  if (!loaded) {
    if (typeof getExampleProfile === 'function') {
      loaded = getExampleProfile(lodgeId);
    }
  }
  if (!loaded) {
    const en = PORTAL_DATA.enriched[lodgeId];
    loaded = en ? enrichedToProfile(en) : emptyProfile();
  }
  // Merge with current schema to ensure any newly-added fields exist as defaults
  return Object.assign({}, emptyProfile(), loaded);
}

// Check whether a profile exists for this lodge from any source: the user's
// localStorage override OR a baked-in example. Used to tell "draft profile"
// apart from "no profile at all" on the lodge detail view and in the admin
// dashboard's Outstanding worklist.
function hasStoredProfile(lodgeId) {
  try {
    if (localStorage.getItem(profileKey(lodgeId))) return true;
  } catch (e) {}
  if (typeof hasExampleProfile === 'function' && hasExampleProfile(lodgeId)) return true;
  return false;
}

function emptyMeetingRule() { return { ordinal: '', day: '', months: [] }; }

function emptyProfile() {
  return {
    // Lodge identity
    crestImage: '',
    // Meeting pattern
    meetingRules: [], timeOfDay: '', meetingDuration: '', meetsAt: '',
    loiFrequency: '', loiDay: '', loiTime: '', loiLocation: '', loiNotes: '',
    // Membership and health
    subscribingMembers: '', regularAttendance: '',
    ageProfile: '', ageNotes: '',
    health: '', lodgeCommunity: '',
    typicalJoiningRoute: '',
    // Officers
    nonProgressive: false,
    membersBelowIM: '', inProgressiveOffice: '',
    provGrandLodgeOfficers: '', grandLodgeOfficers: '',
    // Candidates
    orfCount: '', lastInitiation: '', currentlyAccepting: '',
    initiates_12m: '', joiners_12m: '', lost_12m: '',
    progressionPace: '', progressionNotes: '',
    // Ritual and education
    ritual: '', ritualQuality: '', ritualNotes: '',
    educationPractices: [], educationNotes: '',
    consecratedYear: '', sponsoringLodge: '',
    // Costs
    joiningFee: '', annualSubscription: '',
    festiveBoardCount: '', festiveBoardCost: '',
    regaliaRequired: [], regaliaOtherDetails: '',
    paymentMethods: [],
    // Lodge character
    lodgeEmphases: [],
    // Lodge culture (spectrum pickers)
    cultureRitual: '', cultureMeetingPace: '', cultureFestiveBoard: '',
    cultureVisiting: '',
    // Social and family life
    familyInclusionApproach: '', ladiesFestivalFormat: '',
    familyEvents: [], familyEventsOtherDetails: '',
    familyLifeNotes: '',
    // Interests and communication
    lodgeInterests: [], interestOtherDetails: '',
    universityName: '',
    communicationChannels: [],
    // Royal Arch
    raRepresentative: '', raCompanionsInLodge: '',
    raChapters: [],
    // Profile narrative ("Tell your story")
    whyJoin: '', background: '', traditionsNarrative: '',
    charityNarrative: '', memberExpectations: '',
    costsNarrative: '', summary: '',
    // Approval
    preparedBy: '', approvedByLodge: false,
    approvedDate: '', reviewDate: '',
    // Submission state
    submittedAt: '',
    lastEditedAt: ''
  };
}

function enrichedToProfile(en) {
  const p = emptyProfile();
  // Map only the fields that still exist post-rebuild
  if (en.time_of_day) {
    if (en.time_of_day === 'Daylight' || en.time_of_day === 'Afternoon') p.timeOfDay = 'Daylight (start before 4pm)';
    else if (en.time_of_day === 'Evening') p.timeOfDay = 'Evening (start post 4pm)';
  }
  if (en.festive_board_count !== undefined) p.festiveBoardCount = en.festive_board_count;
  if (en.candidates_waiting !== undefined) p.orfCount = en.candidates_waiting;
  if (en.regular_attendance !== undefined) p.regularAttendance = en.regular_attendance;
  if (en.annual_subscription !== undefined) p.annualSubscription = en.annual_subscription;
  if (en.ritual_notes) p.ritualNotes = en.ritual_notes;
  if (en.initiates_12_months !== undefined) p.initiates_12m = en.initiates_12_months;
  if (en.joiners_12_months !== undefined) p.joiners_12m = en.joiners_12_months;
  if (en.summary) p.summary = en.summary;
  if (en.consecrated_year) p.consecratedYear = en.consecrated_year;
  if (en.sponsoring_lodge) p.sponsoringLodge = en.sponsoring_lodge;
  // Older demo data used "Older" / "Mixed" / "Younger" - map to nearest new descriptor
  if (en.age_demographic) {
    if (en.age_demographic === 'Younger') p.ageProfile = 'Younger leaning';
    else if (en.age_demographic === 'Older') p.ageProfile = 'Mature leaning';
    else if (en.age_demographic === 'Mixed') p.ageProfile = 'Broad mix';
  }
  if (en.age_notes) p.ageNotes = en.age_notes;
  // Older demo data used single-word health values
  if (en.health) {
    if (en.health === 'Growing') p.health = 'Growing (more joining than leaving)';
    else if (en.health === 'Stable') p.health = 'Stable (numbers holding steady)';
    else if (en.health === 'Declining') p.health = 'Declining (more leaving than joining)';
  }
  if (en.diversity_statement) p.lodgeCommunity = en.diversity_statement;
  return p;
}

function commitProfile(lodgeId, profile) {
  try {
    // Stamp the profile with the last-edited time before persisting. This date
    // is shown to candidates so they know how fresh the figures are.
    profile.lastEditedAt = new Date().toISOString();
    localStorage.setItem(profileKey(lodgeId), JSON.stringify(profile));
    State.profileSaveStatus = 'saved';
    State.profileLastSavedAt = new Date().toISOString();
  } catch (e) {
    State.profileSaveStatus = 'error';
  }
  updateSaveIndicator();
}

function scheduleProfileSave(lodgeId) {
  if (State.profileAutosaveTimer) clearTimeout(State.profileAutosaveTimer);
  State.profileSaveStatus = 'saving';
  updateSaveIndicator();
  State.profileAutosaveTimer = setTimeout(() => {
    commitProfile(lodgeId, State.editingProfile);
  }, 600);
}

function updateSaveIndicator() {
  const el = document.querySelector('#profile-save-status');
  if (!el) return;
  if (State.profileSaveStatus === 'saving') {
    el.innerHTML = '<span class="save-dot saving"></span>Saving\u2026';
    el.className = 'profile-save-indicator saving';
  } else if (State.profileSaveStatus === 'saved') {
    el.innerHTML = '<span class="save-dot saved"></span>Saved a moment ago';
    el.className = 'profile-save-indicator saved';
  } else if (State.profileSaveStatus === 'error') {
    el.innerHTML = '<span class="save-dot error"></span>Could not save';
    el.className = 'profile-save-indicator error';
  }
}

// Section field lists, returned as a function because some sections vary based on state
function sectionFieldsFor(profile) {
  return {
    meeting: ['meetingRulesComplete','timeOfDay','meetingDuration','meetsAt'],
    membership: ['subscribingMembers','regularAttendance','ageProfile','health','lodgeCommunity'],
    officers: profile.nonProgressive
      ? ['membersBelowIM','provGrandLodgeOfficers','grandLodgeOfficers']
      : ['membersBelowIM','inProgressiveOffice','provGrandLodgeOfficers','grandLodgeOfficers'],
    candidates: profile.nonProgressive
      ? ['orfCount','currentlyAccepting','lastInitiation','typicalJoiningRoute']
      : ['orfCount','currentlyAccepting','lastInitiation','progressionPace','typicalJoiningRoute'],
    ritual: ['ritual','ritualQuality','educationPractices'],
    costs: ['joiningFee','annualSubscription','festiveBoardCount','festiveBoardCost','regaliaRequired'],
    character: ['lodgeEmphases','cultureRitual','cultureMeetingPace','cultureFestiveBoard','cultureVisiting'],
    socialFamily: ['familyInclusionApproach','ladiesFestivalFormat','familyEvents'],
    interests: ['lodgeInterests','communicationChannels'],
    royalArch: ['raCompanionsInLodge','raChapters'],
    narrative: ['whyJoin','background','traditionsNarrative','charityNarrative','memberExpectations','summary'],
    metadata: ['preparedBy']
  };
}

function profileCompletion(profile) {
  const sf = sectionFieldsFor(profile);
  const fields = [];
  Object.values(sf).forEach(arr => arr.forEach(f => fields.push(f)));
  let filled = 0;
  fields.forEach(f => { if (isFieldFilled(profile, f)) filled++; });
  return { filled, total: fields.length, percent: Math.round(filled / fields.length * 100) };
}

function sectionCompletion(profile, fieldList) {
  let filled = 0;
  fieldList.forEach(f => { if (isFieldFilled(profile, f)) filled++; });
  return { filled, total: fieldList.length };
}

function isFieldFilled(profile, f) {
  if (f === 'meetingRulesComplete') {
    const rules = profile.meetingRules || [];
    return rules.some(r => r.ordinal && r.day && r.months && r.months.length > 0);
  }
  if (f === 'raChapters') {
    const chapters = profile.raChapters || [];
    return chapters.some(c => typeof c === 'string' && c.trim().length > 0);
  }
  const v = profile[f];
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return !isNaN(v);
  if (typeof v === 'boolean') return v === true;
  return false;
}

function summarizeMeetingRules(rules) {
  if (!rules || rules.length === 0) return '';
  return rules
    .filter(r => r.ordinal && r.day && r.months && r.months.length > 0)
    .map(r => {
      let monthStr;
      if (r.months.length === 12) monthStr = 'every month';
      else if (r.months.length === 11) {
        const excluded = MONTHS_SHORT.find(m => !r.months.includes(m));
        monthStr = 'every month except ' + excluded;
      } else if (r.months.length === 1) monthStr = r.months[0];
      else monthStr = r.months.join(', ');
      return `${r.ordinal} ${r.day} in ${monthStr}`;
    })
    .join('; ');
}

function deriveDaysFromRules(rules) {
  const days = new Set();
  (rules || []).forEach(r => { if (r.day) days.add(r.day); });
  return Array.from(days);
}

function deriveMeetingsPerYear(rules) {
  return (rules || []).reduce((sum, r) => sum + (r.months ? r.months.length : 0), 0);
}

function renderMeetingRule(rule, idx, totalRules) {
  return `
    <div class="meeting-rule" data-rule-idx="${idx}">
      <div class="meeting-rule-header">
        <span class="meeting-rule-label">Pattern ${idx + 1}</span>
        ${totalRules > 1 ? `<button type="button" class="meeting-rule-remove" data-remove-rule="${idx}">Remove</button>` : ''}
      </div>
      <div class="meeting-rule-body">
        <div class="meeting-rule-when">
          <span class="meeting-rule-phrase">On the</span>
          <select data-rule-ordinal="${idx}">
            <option value="">\u2014</option>
            <option ${rule.ordinal === '1st' ? 'selected' : ''}>1st</option>
            <option ${rule.ordinal === '2nd' ? 'selected' : ''}>2nd</option>
            <option ${rule.ordinal === '3rd' ? 'selected' : ''}>3rd</option>
            <option ${rule.ordinal === '4th' ? 'selected' : ''}>4th</option>
            <option ${rule.ordinal === 'Last' ? 'selected' : ''}>Last</option>
          </select>
          <select data-rule-day="${idx}">
            <option value="">\u2014</option>
            ${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => `<option ${rule.day === d ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
          <span class="meeting-rule-phrase">of the month</span>
        </div>
        <div class="meeting-rule-months-label">In these months:</div>
        <div class="month-pills">
          ${MONTHS_SHORT.map(m => `<button type="button" class="month-pill ${(rule.months || []).includes(m) ? 'active' : ''}" data-toggle-month="${idx}:${m}">${m}</button>`).join('')}
        </div>
        <div class="month-quick">
          <span class="month-quick-label">Quick:</span>
          <button type="button" class="quick-btn" data-month-quick="${idx}:all">All months</button>
          <button type="button" class="quick-btn" data-month-quick="${idx}:not-aug">All except August</button>
          <button type="button" class="quick-btn" data-month-quick="${idx}:sept-april">Sept to April</button>
          <button type="button" class="quick-btn" data-month-quick="${idx}:clear">Clear</button>
        </div>
      </div>
    </div>
  `;
}

function renderMeetingRulesField(profile) {
  const rules = (profile.meetingRules && profile.meetingRules.length > 0) ? profile.meetingRules : [emptyMeetingRule()];
  const summary = summarizeMeetingRules(rules);
  const totalMeetings = deriveMeetingsPerYear(rules);
  const days = deriveDaysFromRules(rules);
  return `
    <div class="profile-field">
      <label class="profile-field-label">Meeting pattern</label>
      <div class="field-help">Most lodges meet on the same day each month \u2013 add one pattern below. If your lodge meets on different weeks in different months (like the 4th Saturday in January but the 3rd Saturday in March), add a pattern for each one.</div>
      <div class="meeting-rules-list">
        ${rules.map((r, i) => renderMeetingRule(r, i, rules.length)).join('')}
      </div>
      <button type="button" class="btn btn-secondary btn-sm meeting-rule-add" data-add-rule>+ Add another pattern</button>
      ${summary ? `
        <div class="meeting-rule-summary">
          <div class="summary-line"><strong>Reads as:</strong> ${escapeHtml(summary)}</div>
          <div class="summary-stats">
            <span>${totalMeetings} ${totalMeetings === 1 ? 'meeting' : 'meetings'} per year</span>
            ${days.length > 0 ? `<span class="muted-sep">\u00b7</span><span>Days: ${days.join(', ')}</span>` : ''}
          </div>
        </div>
      ` : `<div class="meeting-rule-summary placeholder">Pick an ordinal, day, and at least one month for the summary to appear here.</div>`}
    </div>
  `;
}

function field({label, help, name, type, value, options, placeholder, rows, helpMuted, helpStyle, inputStyle}) {
  const id = 'fld-' + name;
  let control = '';
  if (type === 'text' || type === 'number' || type === 'date') {
    control = `<input id="${id}" name="${name}" type="${type}" value="${escapeHtml(value ?? '')}" placeholder="${escapeHtml(placeholder || '')}"${inputStyle ? ` style="${escapeHtml(inputStyle)}"` : ''} data-profile-field>`;
  } else if (type === 'textarea') {
    control = `<textarea id="${id}" name="${name}" rows="${rows || 4}" placeholder="${escapeHtml(placeholder || '')}"${inputStyle ? ` style="${escapeHtml(inputStyle)}"` : ''} data-profile-field>${escapeHtml(value || '')}</textarea>`;
  } else if (type === 'select') {
    control = `<select id="${id}" name="${name}"${inputStyle ? ` style="${escapeHtml(inputStyle)}"` : ''} data-profile-field>
      <option value="">Please choose\u2026</option>
      ${options.map(o => `<option value="${escapeHtml(o)}" ${o === value ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}
    </select>`;
  } else if (type === 'checkbox') {
    control = `<label class="checkbox-row"><input type="checkbox" id="${id}" name="${name}" ${value ? 'checked' : ''} data-profile-field-bool><span>${escapeHtml(label)}</span></label>`;
    return `<div class="profile-field"><div class="checkbox-field">${control}${help ? `<span class="field-help">${escapeHtml(help)}</span>` : ''}</div></div>`;
  }
  return `
    <div class="profile-field">
      <label for="${id}" class="profile-field-label">${escapeHtml(label)}</label>
      ${help ? `<div class="field-help"${helpStyle ? ` style="${escapeHtml(helpStyle)}"` : ''}>${escapeHtml(help)}</div>` : ''}
      ${control}
      ${helpMuted ? `<div class="field-help-muted">${escapeHtml(helpMuted)}</div>` : ''}
    </div>
  `;
}

// Multi-choice (flat) helper
function multiChoice(label, help, name, options, value) {
  const v = value || [];
  return `
    <div class="profile-field">
      <label class="profile-field-label">${escapeHtml(label)}</label>
      ${help ? `<div class="field-help">${escapeHtml(help)}</div>` : ''}
      <div class="multi-choice">
        ${options.map(o => `
          <label class="multi-choice-item">
            <input type="checkbox" name="${name}" value="${escapeHtml(o)}" ${v.includes(o) ? 'checked' : ''} data-profile-field-multi>
            <span>${escapeHtml(o)}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

// Multi-choice (grouped) helper for Special interests
function multiChoiceGrouped(label, help, name, groups, value) {
  const v = value || [];
  return `
    <div class="profile-field">
      <label class="profile-field-label">${escapeHtml(label)}</label>
      ${help ? `<div class="field-help">${escapeHtml(help)}</div>` : ''}
      <div class="multi-choice-grouped">
        ${groups.map(g => `
          <div class="multi-choice-group">
            <div class="multi-choice-group-header">${escapeHtml(g.title)}</div>
            <div class="multi-choice">
              ${g.options.map(o => `
                <label class="multi-choice-item">
                  <input type="checkbox" name="${name}" value="${escapeHtml(o)}" ${v.includes(o) ? 'checked' : ''} data-profile-field-multi>
                  <span>${escapeHtml(o)}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Spectrum picker - three-option A / Balanced / B
function spectrumChoice(name, label, description, optionA, optionB, value) {
  const isBalanced = value === 'Balanced';
  return `
    <div class="profile-field spectrum-field">
      <label class="profile-field-label">${escapeHtml(label)}</label>
      ${description ? `<div class="field-help">${escapeHtml(description)}</div>` : ''}
      <div class="spectrum-row">
        <button type="button" class="spectrum-pill ${value === optionA ? 'active' : ''}" data-spectrum="${escapeHtml(name)}" data-spectrum-value="${escapeHtml(optionA)}">${escapeHtml(optionA)}</button>
        <button type="button" class="spectrum-pill ${isBalanced ? 'active' : ''}" data-spectrum="${escapeHtml(name)}" data-spectrum-value="Balanced">Balanced</button>
        <button type="button" class="spectrum-pill ${value === optionB ? 'active' : ''}" data-spectrum="${escapeHtml(name)}" data-spectrum-value="${escapeHtml(optionB)}">${escapeHtml(optionB)}</button>
      </div>
    </div>
  `;
}

function sectionCard(id, title, intro, content) {
  return `
    <section id="${id}" class="profile-section">
      <header class="profile-section-header">
        <h2>${escapeHtml(title)}</h2>
        ${intro ? `<p class="profile-section-intro">${escapeHtml(intro)}</p>` : ''}
      </header>
      <div class="profile-section-body">${content}</div>
    </section>
  `;
}

// ===== Section renderers =====

function renderMeetingSection(p) {
  // Build centre dropdown options from PORTAL_DATA.centres
  const centreOptions = Object.keys(PORTAL_DATA.centres || {})
    .map(key => (PORTAL_DATA.centres[key] && PORTAL_DATA.centres[key].display_name) || key)
    .sort((a, b) => a.localeCompare(b));

  const body = `
    ${renderMeetingRulesField(p)}
    ${field({ label: 'Time of day', help: 'Helps candidates with work commitments understand the schedule.', name: 'timeOfDay', type: 'select', value: p.timeOfDay, options: ['Daylight (start before 4pm)','Evening (start post 4pm)'] })}
    ${field({ label: 'Typical meeting length', help: 'How long the formal meeting usually lasts. This does NOT include the Festive Board afterwards. Pick the range that fits most meetings.', name: 'meetingDuration', type: 'select', value: p.meetingDuration, options: ['1-2 hours','2-3 hours','3-4 hours','4+ hours'] })}
    ${field({ label: 'Where the lodge meets', help: 'Choose the centre where this lodge holds its meetings.', name: 'meetsAt', type: 'select', value: p.meetsAt, options: centreOptions })}
    <h4 class="subsection-title">Lodge of Instruction</h4>
    <div class="field-row">
      ${field({ label: 'LoI frequency', help: 'How often does the LoI meet?', name: 'loiFrequency', type: 'select', value: p.loiFrequency, options: ['Weekly','Fortnightly','Monthly','Other','None'] })}
      ${field({ label: 'LoI day', help: 'Day of the week the LoI sits.', name: 'loiDay', type: 'select', value: p.loiDay, options: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] })}
    </div>
    <div class="field-row">
      ${field({ label: 'LoI time', help: 'Start time.', name: 'loiTime', type: 'text', value: p.loiTime, placeholder: '19:30' })}
      ${field({ label: 'LoI location', help: 'Where the LoI meets, if different from the lodge meeting venue.', name: 'loiLocation', type: 'text', value: p.loiLocation, placeholder: '' })}
    </div>
    ${field({ label: 'Additional information about the LoI', help: 'LoIs rarely meet every single week year-round. Use this space to describe the actual rhythm in plain language. For example: "Weekly except August and the week of the Lodge meeting" or "Monthly during the Lodge season, paused over summer".', name: 'loiNotes', type: 'textarea', value: p.loiNotes, rows: 2 })}
  `;
  return sectionCard('sec-meeting', 'Meeting pattern', 'When and where the lodge meets. This is the first thing candidates ask about.', body);
}

function renderMembershipSection(p) {
  const body = `
    <div class="field-row">
      ${field({ label: 'Subscribing members', help: 'Current total membership of the lodge.', name: 'subscribingMembers', type: 'number', value: p.subscribingMembers, placeholder: '55' })}
      ${field({ label: 'Regular attendance', help: 'Typical number attending a regular meeting.', name: 'regularAttendance', type: 'number', value: p.regularAttendance, placeholder: '30' })}
    </div>
    ${field({ label: 'Overall age profile', help: 'Pick the descriptor that best matches the age mix of your lodge today. Use the notes field below for nuance.', name: 'ageProfile', type: 'select', value: p.ageProfile, options: ['Broad mix','Younger leaning','Mid-life leaning','Mature leaning','Senior'] })}
    ${field({ label: 'Notes on age profile', help: 'For example: "Mostly mid-50s and 60s but with three recent under-40 initiates."', name: 'ageNotes', type: 'textarea', value: p.ageNotes, rows: 2 })}
    ${field({ label: 'Lodge health', help: 'Be honest about the trend. If your lodge is looking to grow, candidates appreciate knowing there is room for them.', name: 'health', type: 'select', value: p.health, options: ['Growing (more joining than leaving)','Stable (numbers holding steady)','Declining (more leaving than joining)'] })}
    ${field({ label: 'Lodge community', help: 'Describe who currently makes up the lodge \u2014 professions, community ties, age and background mix. This is the most useful field for matching candidates with peers, so be specific and honest. A lodge of City professionals is fine. A lodge with strong local roots is fine. A mixed bag is fine. Just be accurate about what your lodge actually is.', name: 'lodgeCommunity', type: 'textarea', value: p.lodgeCommunity, rows: 4 })}
  `;
  return sectionCard('sec-membership', 'Membership and health', 'Be candid. The matching tool relies on accurate, honest answers.', body);
}

function renderOfficersSection(p) {
  const inProgressiveField = p.nonProgressive ? '' : field({
    label: 'Members currently in a progressive Office',
    help: 'Brethren currently holding a progressive Office (excluding Past Masters).',
    name: 'inProgressiveOffice', type: 'number', value: p.inProgressiveOffice, placeholder: '8'
  });
  const body = `
    ${field({ label: 'Non-progressive Lodge', help: 'Tick this if the Lodge does not progress members through the Offices (for example, a Past Masters Lodge or an honorific Lodge).', name: 'nonProgressive', type: 'checkbox', value: p.nonProgressive })}
    ${field({ label: 'Total members below the rank of Installed Master', help: 'Total members in the Lodge who have not yet served as Worshipful Master.', name: 'membersBelowIM', type: 'number', value: p.membersBelowIM, placeholder: '18' })}
    ${inProgressiveField}
    ${field({ label: 'Provincial Grand Officers', help: 'Number of brethren holding Provincial rank.', name: 'provGrandLodgeOfficers', type: 'number', value: p.provGrandLodgeOfficers, placeholder: '5' })}
    ${field({ label: 'Grand Officers', help: 'Number of brethren holding Grand Lodge rank.', name: 'grandLodgeOfficers', type: 'number', value: p.grandLodgeOfficers, placeholder: '2' })}
  `;
  return sectionCard('sec-officers', 'Officers and ranks', 'Helps the membership team understand the structure of your lodge.', body);
}

function renderCandidatesSection(p) {
  const paceField = p.nonProgressive ? '' : field({
    label: 'Progression pace',
    help: 'How long does a typical candidate take to progress through the three degrees, from Initiation to Master Mason?',
    name: 'progressionPace', type: 'select', value: p.progressionPace,
    options: [
      'Fast \u2014 Master Mason within 6 months of initiation',
      'Standard \u2014 Master Mason 6 to 18 months after initiation',
      'Slow \u2014 Master Mason takes over 18 months from initiation'
    ]
  });
  const body = `
    ${field({ label: 'How members typically join', help: 'Different lodges grow membership differently. This helps the team match candidates to a route that suits them.', name: 'typicalJoiningRoute', type: 'select', value: p.typicalJoiningRoute, options: ['Mix of routes','Mostly through family ties','Mostly through introduction','Often cold approach'] })}
    <div class="field-row">
      ${field({ label: 'Currently accepting candidates?', help: 'Is the lodge actively seeking new members at the moment?', name: 'currentlyAccepting', type: 'select', value: p.currentlyAccepting, options: ['Yes','Yes but slow','No, no initiates currently','No, non-progressive'] })}
      ${field({ label: 'Candidates currently waiting (ORF)', help: 'Number of potential candidates in the pipeline.', name: 'orfCount', type: 'number', value: p.orfCount, placeholder: '0' })}
    </div>
    ${field({ label: 'Date of last initiation', help: 'Most recent initiation ceremony.', name: 'lastInitiation', type: 'date', value: p.lastInitiation })}
    ${paceField}
    ${p.nonProgressive ? '' : field({ label: 'Notes on progression', help: 'For example: "We aim to get a candidate to Master Mason in successive meetings."', name: 'progressionNotes', type: 'textarea', value: p.progressionNotes, rows: 2 })}
    <h4 class="subsection-title">Recent intake</h4>
    <div class="field-row">
      ${field({ label: 'Initiates in the last 12 months', help: 'New Entered Apprentices in the past year.', name: 'initiates_12m', type: 'number', value: p.initiates_12m, placeholder: '0' })}
      ${field({ label: 'Joining members in the last 12 months', help: 'Brethren joining from another lodge in the past year.', name: 'joiners_12m', type: 'number', value: p.joiners_12m, placeholder: '0' })}
    </div>
    ${field({ label: 'Members lost in the last 12 months', help: 'Resignations, deaths, exclusions.', name: 'lost_12m', type: 'number', value: p.lost_12m, placeholder: '0' })}
  `;
  return sectionCard('sec-candidates', 'Candidates and progression', 'Numbers help the team understand the lodge\u2019s current capacity and pace.', body);
}

function renderRitualSection(p) {
  const educationOptions = [
    'Lodge Mentor scheme',
    'Solomon used regularly',
    'Papers and presentations',
    'Education evenings at LoI',
    'Encouragement to give explanations',
    'Visits to other lodges',
    'Study circle or reading group',
    'None of the above'
  ];
  const body = `
    ${field({ label: 'Ritual used', help: 'The ritual style your lodge works.', name: 'ritual', type: 'select', value: p.ritual, options: ['Emulation','Taylors','Universal','East End','Logic','West End','Calvers','Lux','Nigerian','Non Ritual Lodge','Varies','Other'] })}
    ${field({ label: 'Ritual standard', help: 'How polished is the ritual at your lodge? Be honest \u2014 candidates have different preferences. Some want word-perfect ritual, others prefer a more relaxed environment where they will not feel pressured if they need help with their parts.', name: 'ritualQuality', type: 'select', value: p.ritualQuality, options: [
      'Polished \u2014 ritual learned by heart, ceremonies run with precision',
      'Confident \u2014 ritual delivered reliably with occasional book use',
      'Working at it \u2014 ritual sometimes prompted or read'
    ] })}
    ${field({ label: 'Ritual notes', help: 'For example: "Ritual is shared widely with younger members encouraged to participate."', name: 'ritualNotes', type: 'textarea', value: p.ritualNotes, rows: 3 })}
    ${multiChoice('Masonic education practices', 'Masonic education means anything that helps a brother understand the Craft beyond the ritual itself. Tick whatever your lodge genuinely does. Honest answers help candidates find a lodge that matches their interests.', 'educationPractices', educationOptions, p.educationPractices)}
    ${field({ label: 'Education notes', help: 'For example: "Our Mentor scheme pairs new candidates with someone from another generation. Papers happen roughly once a quarter."', name: 'educationNotes', type: 'textarea', value: p.educationNotes, rows: 2 })}
    <h4 class="subsection-title">Lodge background</h4>
    <div class="field-row">
      ${field({ label: 'Year consecrated', help: 'The year the lodge was formed.', name: 'consecratedYear', type: 'number', value: p.consecratedYear, placeholder: '1961' })}
      ${field({ label: 'Sponsoring lodge', help: 'The lodge that sponsored your consecration.', name: 'sponsoringLodge', type: 'text', value: p.sponsoringLodge, placeholder: 'Springfield Lodge No. 3183' })}
    </div>
  `;
  return sectionCard('sec-ritual', 'Ritual and education', 'How your lodge works and what it teaches.', body);
}

function calculateAnnualCost(p) {
  const sub = parseFloat(p.annualSubscription);
  const count = parseInt(p.festiveBoardCount);
  const opt = p.festiveBoardCost;
  if (isNaN(sub)) return { ready: false, display: 'Fill in the inputs above to see the calculation.' };
  // Round outwards to nearest \u00a325 - low end floored, high end ceiled - so the
  // headline range is conservative and reads as the estimate it is.
  const floor25 = n => Math.floor(n / 25) * 25;
  const ceil25 = n => Math.ceil(n / 25) * 25;
  if (opt === 'No Festive Board / lunch only') {
    return { ready: true, display: `\u00a3${sub} per year`, rounded: false };
  }
  if (isNaN(count) || !opt) return { ready: false, display: 'Fill in the inputs above to see the calculation.' };
  if (opt === '\u00a320 to \u00a330') {
    return { ready: true, display: `\u00a3${floor25(sub + count * 20)} to \u00a3${ceil25(sub + count * 30)} per year`, rounded: true };
  }
  if (opt === '\u00a330 to \u00a340') {
    return { ready: true, display: `\u00a3${floor25(sub + count * 30)} to \u00a3${ceil25(sub + count * 40)} per year`, rounded: true };
  }
  if (opt === '\u00a340+') {
    return { ready: true, display: `From \u00a3${ceil25(sub + count * 40)} per year`, rounded: true };
  }
  return { ready: false, display: 'Fill in the inputs above to see the calculation.' };
}

function renderCostsSection(p) {
  const regaliaOptions = [
    'Master Mason Apron (worn after Raising)',
    'Past Master / Master\u2019s Apron (for those who have served as Worshipful Master)',
    'White gloves',
    'Provincial tie (worn at Provincial events)',
    'Lodge tie (specific to this Lodge)',
    'Ritual book (purchased by candidate, not provided)',
    'Other Lodge-specific regalia (describe below)'
  ];
  const hasRegaliaOther = (p.regaliaRequired || []).includes('Other Lodge-specific regalia (describe below)');
  const cost = calculateAnnualCost(p);
  const body = `
    <div class="field-row">
      ${field({ label: 'Joining fee (one-off)', help: 'Pounds. Includes Grand Lodge and Provincial registration where applicable.', name: 'joiningFee', type: 'number', value: p.joiningFee, placeholder: '250' })}
      ${field({ label: 'Annual subscription', help: 'Pounds per year.', name: 'annualSubscription', type: 'number', value: p.annualSubscription, placeholder: '168' })}
    </div>
    <div class="field-row">
      ${field({ label: 'Festive Boards per year', help: 'How many meetings include a Festive Board?', name: 'festiveBoardCount', type: 'number', value: p.festiveBoardCount, placeholder: '3', inputStyle: 'margin-top: auto;' })}
      ${field({ label: 'Festive Board cost per meeting', help: 'Average cost per Festive Board (Installation usually higher).', name: 'festiveBoardCost', type: 'select', value: p.festiveBoardCost, options: ['No Festive Board / lunch only','\u00a320 to \u00a330','\u00a330 to \u00a340','\u00a340+'] })}
    </div>
    <div class="calculated-field ${cost.ready ? 'ready' : 'pending'}">
      <div class="calculated-field-label">Typical annual cost</div>
      <div class="calculated-field-value">${escapeHtml(cost.display)}</div>
      <div class="calculated-field-note">${cost.rounded ? 'Rounded to the nearest \u00a325. ' : ''}Excludes the one-off joining fee, voluntary alms and charity collections, and one-off costs like regalia.</div>
    </div>
    ${multiChoice('Regalia and other items the lodge expects members to have', 'Tick everything members are expected to purchase at some point during their membership. Timing (after Initiation, after Raising, on Installation, etc.) belongs in the Costs narrative further down.', 'regaliaRequired', regaliaOptions, p.regaliaRequired)}
    ${field({ label: 'Other regalia details', help: 'If your lodge has any other specific regalia requirements not listed above, describe them here. Leave blank if not applicable.', name: 'regaliaOtherDetails', type: 'textarea', value: p.regaliaOtherDetails, rows: 2 })}
    ${multiChoice('Payment methods accepted', 'Tick all that apply.', 'paymentMethods', ['Standing Order','Bank Transfer','Online card payment','Cash','Cheque'], p.paymentMethods)}
  `;
  return sectionCard('sec-costs', 'Costs', 'Be specific. Candidates appreciate knowing what to budget for.', body);
}

function renderCharacterSection(p) {
  const emphasesOptions = ['Ritual','Lodge tradition','Masonic Education','Administration','Meetings','Festive Board','Social Events','Charity','Support for new members'];
  const body = `
    ${multiChoice('Lodge emphases', 'Tick the things your lodge is particularly known for, above and beyond what every lodge does. Most lodges value all of these to some degree \u2014 what we want to capture here is what your lodge does especially well or has especially strong tradition in. It is perfectly fine to tick none, one, or several.', 'lodgeEmphases', emphasesOptions, p.lodgeEmphases)}
    <h4 class="subsection-title">Lodge culture</h4>
    <p class="subsection-intro">There are no wrong answers here. The matching tool helps candidates find the lodge that fits them, and candidates have very different preferences. For each spectrum below, pick the option that best describes your lodge as members would actually experience it. If your lodge genuinely sits in the middle, pick Balanced. Some lodges find this section a useful prompt to think about their own identity \u2014 even if you have not deliberately defined these things, you can probably describe them honestly.</p>
    ${spectrumChoice('cultureRitual', 'Ritual approach', 'How would members describe the lodge\u2019s relationship with ritual?', 'Traditional and word-perfect', 'Relaxed and supportive', p.cultureRitual)}
    ${spectrumChoice('cultureMeetingPace', 'Meeting pace', 'How does the lodge handle the flow of its meetings?', 'Punctual and brisk', 'Leisurely and unhurried', p.cultureMeetingPace)}
    ${spectrumChoice('cultureFestiveBoard', 'Festive Board character', 'What is the atmosphere like at the Festive Board?', 'Formal and structured', 'Lively and social', p.cultureFestiveBoard)}
    ${spectrumChoice('cultureVisiting', 'Welcome to visitors', 'How does the lodge approach hosting visitors from other lodges?', 'Active visiting culture', 'Members-focused', p.cultureVisiting)}
  `;
  return sectionCard('sec-character', 'Lodge character', 'This is where the matching tool earns its keep.', body);
}

function renderSocialFamilySection(p) {
  const familyEventsOptions = [
    'Summer BBQ or garden party',
    'Christmas family event',
    'Children\u2019s events',
    'Couples dinners / social evenings',
    'Day trips or outings',
    'Charity events with families',
    'Lodge holidays or group trips',
    'Other (describe below)'
  ];
  const hasFamilyOther = (p.familyEvents || []).includes('Other (describe below)');
  const body = `
    ${field({ label: 'Family inclusion approach', help: 'How would you describe your lodge\u2019s approach to involving partners, families, and friends?', name: 'familyInclusionApproach', type: 'select', value: p.familyInclusionApproach, options: [
      'Active \u2014 families regularly involved in lodge life',
      'Moderate \u2014 several family-inclusive events through the year',
      'Limited \u2014 mainly the Ladies Festival',
      'Members-focused \u2014 little family involvement'
    ] })}
    ${field({ label: 'Ladies Festival or Ladies Night format', help: 'Some lodges run a full weekend away at a hotel, some a single evening at a local venue. Be honest about your actual practice rather than what you aspire to.', name: 'ladiesFestivalFormat', type: 'select', value: p.ladiesFestivalFormat, options: [
      'Annual single evening',
      'Annual weekend (Friday through Sunday)',
      'Biennial',
      'Occasional / informal arrangements',
      'No regular Ladies event'
    ] })}
    ${multiChoice('Family-inclusive events through the year', 'Tick any regular events where partners, families, or close friends are welcomed. Do not include the Ladies Festival itself \u2014 that is captured above.', 'familyEvents', familyEventsOptions, p.familyEvents)}
    ${field({ label: 'Other family event details', help: 'Any family-inclusive events not listed above? Describe them here. Leave blank if not applicable.', name: 'familyEventsOtherDetails', type: 'textarea', value: p.familyEventsOtherDetails, rows: 2 })}
    ${field({ label: 'Notes on family and social life', help: 'Anything else worth describing about how your lodge approaches family inclusion. Especially useful for candidates with young families weighing up the time commitment.', name: 'familyLifeNotes', type: 'textarea', value: p.familyLifeNotes, rows: 3 })}
  `;
  return sectionCard('sec-social-family', 'Social and family life', 'Lots of candidates, especially those with young families, want to know whether and how their lodge involves partners, families, and friends beyond the formal meetings. Be honest \u2014 there is no right answer here, just different candidates wanting different things.', body);
}

function renderInterestsSection(p) {
  const interestGroups = [
    { title: 'Sport and outdoor', options: ['Cricket','Golf','Rugby','Football','Country sports (shooting, fishing)','Sailing','Motorcycling','Aviation'] },
    { title: 'Profession and background', options: ['Armed Forces / Veterans','Emergency Services (Blue Light)','School alumni / Old Boys','Round Table / Apex','University-linked'] },
    { title: 'Lodge type', options: ['Young Freemasons (under 40)','Past Masters Lodge','Officeholder Lodge (Almoners, ADC, Stewards, etc.)'] },
    { title: 'Other', options: ['Arts and music','Religious / faith-based','Ethnic or cultural community','Other (describe below)'] }
  ];
  const hasUniversityLinked = (p.lodgeInterests || []).includes('University-linked');
  const channels = ['Email','Post','Telephone','WhatsApp group','Facebook page','Instagram','Web site','Lodge magazine','Video conferences'];
  const body = `
    ${multiChoiceGrouped('Special interests', 'Tick any that genuinely describe your lodge. Most lodges have one or two. Some have none, and that is fine too.', 'lodgeInterests', interestGroups, p.lodgeInterests)}
    ${hasUniversityLinked ? field({ label: 'Which university?', help: 'Name the university your lodge is linked with.', name: 'universityName', type: 'text', value: p.universityName, placeholder: 'Anglia Ruskin University, Chelmsford' }) : ''}
    ${field({ label: 'Other interest details', help: 'Describe any other special interest your lodge has. Leave blank if not applicable.', name: 'interestOtherDetails', type: 'textarea', value: p.interestOtherDetails, rows: 2 })}
    <h4 class="subsection-title">Communication</h4>
    ${multiChoice('Channels your lodge uses', 'Tick all that apply.', 'communicationChannels', channels, p.communicationChannels)}
  `;
  return sectionCard('sec-interests', 'Interests and communication', 'What your lodge is about and how it stays in touch with members.', body);
}

function renderRoyalArchChapterRow(chapter, idx, total) {
  return `
    <div class="ra-chapter-row" data-chapter-idx="${idx}">
      <input type="text" value="${escapeHtml(chapter || '')}" placeholder="Chapter name and number" data-chapter-input="${idx}">
      ${total > 1 ? `<button type="button" class="meeting-rule-remove" data-remove-chapter="${idx}">Remove</button>` : ''}
    </div>
  `;
}

function renderRoyalArchSection(p) {
  const chapters = (p.raChapters && p.raChapters.length > 0) ? p.raChapters : [''];
  const body = `
    ${field({ label: 'Lodge Royal Arch Representative', help: 'Brother responsible for Royal Arch promotion.', name: 'raRepresentative', type: 'text', value: p.raRepresentative })}
    ${field({ label: 'Royal Arch Companions in the lodge', help: 'Number of members who are also Royal Arch Companions.', name: 'raCompanionsInLodge', type: 'number', value: p.raCompanionsInLodge, placeholder: '12' })}
    <div class="profile-field">
      <label class="profile-field-label">Royal Arch Chapters affiliated to lodge members</label>
      <div class="field-help">Add a Chapter for each one that has Lodge members as Companions. There is no need to count members per Chapter.</div>
      <div class="ra-chapters-list">
        ${chapters.map((c, i) => renderRoyalArchChapterRow(c, i, chapters.length)).join('')}
      </div>
      <button type="button" class="btn btn-secondary btn-sm meeting-rule-add" data-add-chapter>+ Add another Chapter</button>
    </div>
  `;
  return sectionCard('sec-royal-arch', 'Royal Arch', 'Most lodges have a Royal Arch link. Optional.', body);
}

function renderNarrativeSection(p) {
  const body = `
    ${field({
      label: 'Why join this lodge?',
      help: 'Imagine a candidate who has narrowed it down to three or four lodges and is about to choose. What would make them pick yours? Be honest and specific \u2014 generic claims about friendship and tradition apply to every lodge. The genuine difference might be something small: a particular Past Master who mentors brilliantly, the after-meeting drinks at a specific pub, the warmth of the welcome to visitors.',
      name: 'whyJoin', type: 'textarea', value: p.whyJoin, rows: 4,
      helpMuted: 'Prompts if you are stuck: What do members say when they first attend? What do visitors comment on? What would members miss if the lodge folded tomorrow?'
    })}
    ${field({ label: 'Background and history', help: 'When was the lodge formed and why? Any moments in its history members are proud of? Famous past members? Hall Stone Lodge status? Keep it warm and human, not a chronology.', name: 'background', type: 'textarea', value: p.background, rows: 4 })}
    ${field({ label: 'Traditions and character', help: 'What does your lodge do that others do not? Specific traditions at Installation, unusual elements at the Festive Board, themed evenings, military uniforms, dress code particulars. The little rituals around the formal ritual.', name: 'traditionsNarrative', type: 'textarea', value: p.traditionsNarrative, rows: 4 })}
    ${field({ label: 'Charity work', help: 'Which causes does your lodge support, and how? Any standout amounts raised, members involved in trustee or volunteer roles, local causes the lodge has a long association with. Can a brother propose a charity he cares about?', name: 'charityNarrative', type: 'textarea', value: p.charityNarrative, rows: 3 })}
    ${field({ label: 'What is expected of members', help: 'Be candid. Attendance expectations, dress code, ritual learning, financial commitment beyond the subscription, LoI attendance, participation in social and family events. Better the candidate knows now than feels mis-sold later. If your lodge is relaxed about attendance, say so \u2014 that is appealing to plenty of people.', name: 'memberExpectations', type: 'textarea', value: p.memberExpectations, rows: 4 })}
    ${field({ label: 'Anything else about costs', help: 'The annual cost is calculated above. Use this space only for anything else worth knowing \u2014 for example, expected charitable giving beyond alms, or one-off costs at particular career stages. Most lodges can leave this blank.', name: 'costsNarrative', type: 'textarea', value: p.costsNarrative, rows: 2 })}
    ${field({
      label: 'One-line summary',
      help: 'If a candidate read only one sentence about your lodge, what should it say? This appears at the top of the candidate-facing profile.',
      name: 'summary', type: 'textarea', value: p.summary, rows: 2,
      helpMuted: 'Tip: write this last. After filling everything else in, the summary often writes itself.'
    })}
  `;
  return sectionCard('sec-narrative', 'Tell your story', 'The structured questions above tell candidates what your lodge does. This is where you tell them what your lodge feels like. Do not repeat what has been captured already \u2014 focus on what makes your lodge worth joining.', body);
}

function renderCrestBlock(p) {
  if (p.crestImage) {
    return `
      <div class="crest-block has-crest">
        <div class="crest-preview-wrap">
          <img src="${escapeHtml(p.crestImage)}" alt="Lodge crest" class="crest-preview-img">
        </div>
        <div class="crest-block-text">
          <h3>Lodge crest</h3>
          <p class="crest-help">This image appears on the lodge profile page and at the top of the candidate preview.</p>
          <div class="crest-actions">
            <label class="btn btn-secondary btn-sm">
              Replace crest
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" data-crest-upload>
            </label>
            <button type="button" class="btn btn-ghost btn-sm" data-action="remove-crest">Remove</button>
          </div>
        </div>
      </div>
    `;
  }
  return `
    <div class="crest-block">
      <div class="crest-placeholder">
        <div class="crest-placeholder-icon" aria-hidden="true">\u2756</div>
      </div>
      <div class="crest-block-text">
        <h3>Lodge crest</h3>
        <p class="crest-help">Upload a crest or logo to appear at the top of the lodge profile and the candidate preview. JPEG, PNG, or WebP up to 5MB. The image will be resized for storage.</p>
        <label class="btn btn-secondary btn-sm">
          Choose crest image
          <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" data-crest-upload>
        </label>
      </div>
    </div>
  `;
}

function renderMetadataSection(p) {
  const body = `
    ${field({ label: 'Profile prepared by', help: 'Your name and role. Usually the Secretary.', name: 'preparedBy', type: 'text', value: p.preparedBy, placeholder: 'John Smith, Secretary' })}
    <div class="profile-field">
      <label class="profile-field-label">Lodge approval</label>
      <div class="field-help">Tick when the lodge has formally approved this profile, and record the date.</div>
      <div class="approval-block">
        <label class="approval-check">
          <input type="checkbox" id="fld-approvedByLodge" name="approvedByLodge" ${p.approvedByLodge ? 'checked' : ''} data-profile-field-bool>
          <span>Approved by the lodge</span>
        </label>
        <div class="approval-date">
          <label for="fld-approvedDate" class="approval-date-label">Date approved</label>
          <input id="fld-approvedDate" name="approvedDate" type="date" value="${escapeHtml(p.approvedDate || '')}" data-profile-field>
        </div>
      </div>
    </div>
    <div class="field-row">
      ${field({ label: 'Review date', help: 'Auto-fills from the approval date above. Adjust if needed.', name: 'reviewDate', type: 'date', value: p.reviewDate })}
    </div>
    <div class="review-callout">
      <strong>Province recommendation:</strong> This profile should be reviewed at least every 3 years to keep member counts, costs, and lodge character accurate. If anything material changes sooner (a sharp drop or rise in membership, a change in meeting pattern, a significant cost increase), update the profile then rather than waiting for the review date.
    </div>
  `;
  return sectionCard('sec-metadata', 'Sign-off', 'Once the lodge has reviewed and approved this profile, mark it here. The submit button below sends it to the Provincial Membership Team.', body);
}

function formatSubmissionDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) { return ''; }
}

function renderSubmitBlock(p) {
  const canSubmit = p.approvedByLodge === true;
  const previouslySubmitted = !!p.submittedAt;
  return `
    <div class="submit-block">
      ${previouslySubmitted ? `<div class="submit-status">This profile was last submitted on ${escapeHtml(formatSubmissionDate(p.submittedAt))}.</div>` : ''}
      <p class="submit-intro">Before you submit, you can preview how the profile will look to candidates. Then send it to the Provincial Membership Team using the button below.</p>
      <div class="submit-actions">
        <button type="button" class="btn btn-secondary" data-action="toggle-preview">Preview as a candidate would see it</button>
        <button type="button" class="btn btn-primary submit-button" data-action="submit-profile"${canSubmit ? '' : ' disabled'}>
          ${previouslySubmitted ? 'Resubmit profile to Provincial Membership Team' : 'Submit profile to Provincial Membership Team'}
        </button>
      </div>
      ${!canSubmit ? '<div class="submit-hint">Tick &ldquo;Approved by the lodge&rdquo; in the Sign-off section above before submitting.</div>' : ''}
    </div>
  `;
}

function renderProfileSubmitted(lodge, p) {
  const submittedDate = formatSubmissionDate(p.submittedAt);
  return `
    <div class="page profile-page">
      <div class="submission-confirmation">
        <div class="confirmation-tick" aria-hidden="true">\u2713</div>
        <h1>Thank you</h1>
        <p class="confirmation-lead">Your profile for <strong>${escapeHtml(lodge.name)}</strong> has been submitted to the Provincial Membership Team.</p>
        ${submittedDate ? `<p class="confirmation-meta">Submitted ${escapeHtml(submittedDate)}</p>` : ''}
        <div class="confirmation-body">
          <p>The team will review what you have shared and use it to match prospective candidates to your lodge.</p>
          <p>If you have any questions, want to follow up on a specific candidate, or need to update your profile, please contact the Provincial Membership Team at <a href="mailto:${escapeHtml(PROVINCE_EMAIL)}">${escapeHtml(PROVINCE_EMAIL)}</a>.</p>
          <p>Thank you for the time and care you have put into describing your lodge \u2014 it really does make a difference to candidates finding the right home.</p>
        </div>
        <div class="confirmation-actions">
          <button type="button" class="btn btn-primary" data-back="${escapeHtml(lodge.id)}">Return to lodge page</button>
          <button type="button" class="btn btn-secondary" data-action="return-to-edit">Continue editing</button>
        </div>
      </div>
    </div>
  `;
}

function renderProfileEdit() {
  const lodge = lodgeById(State.currentLodgeId);
  if (!lodge) return '<div class="page"><div class="empty-state">Lodge not found</div></div>';
  if (!State.editingProfile || State.editingProfile._lodgeId !== lodge.id) {
    State.editingProfile = loadProfile(lodge.id);
    State.editingProfile._lodgeId = lodge.id;
    State.profileSaveStatus = 'idle';
  }
  const p = State.editingProfile;
  const completion = profileCompletion(p);
  if (State.profilePreview) return renderProfilePreview(lodge, p);
  if (State.profileSubmittedView) return renderProfileSubmitted(lodge, p);
  const sf = sectionFieldsFor(p);
  return `
    <div class="page profile-page">
      <div class="profile-header">
        <div>
          <button class="btn-ghost btn-sm" data-back="${escapeHtml(lodge.id)}">\u2190 Back to ${escapeHtml(lodge.name)}</button>
          <h1>Lodge profile: ${escapeHtml(lodge.name)} <span class="num mono">L${escapeHtml(lodge.number)}</span></h1>
          <p class="profile-header-sub">${escapeHtml(lodge.centre)} \u00b7 ${escapeHtml(lodge.region)} \u00b7 This profile helps the membership team match candidates to your lodge.</p>
        </div>
        <div class="profile-header-actions">
          <span id="profile-save-status" class="profile-save-indicator idle"><span class="save-dot"></span>Ready</span>
          <button class="btn btn-secondary" data-action="toggle-preview">Preview</button>
        </div>
      </div>
      <div class="save-banner">
        <strong>Your work is safe.</strong> This form saves automatically every time you type or tick something. You can close this window any time and pick up exactly where you left off when you come back. Look for the &ldquo;Saved a moment ago&rdquo; indicator at the top right of the form to confirm.
      </div>
      <div class="profile-progress">
        <div class="profile-progress-bar"><div class="profile-progress-fill" style="width:${completion.percent}%"></div></div>
        <div class="profile-progress-text"><strong>${completion.percent}%</strong> complete \u00b7 ${completion.filled} of ${completion.total} key fields filled in</div>
      </div>
      <div class="profile-layout">
        <aside class="profile-nav">
          <div class="profile-nav-title">Sections</div>
          ${[
            ['#sec-meeting', 'Meeting pattern', sectionCompletion(p, sf.meeting)],
            ['#sec-membership', 'Membership & health', sectionCompletion(p, sf.membership)],
            ['#sec-officers', 'Officers', sectionCompletion(p, sf.officers)],
            ['#sec-candidates', 'Candidates & progression', sectionCompletion(p, sf.candidates)],
            ['#sec-ritual', 'Ritual & education', sectionCompletion(p, sf.ritual)],
            ['#sec-costs', 'Costs', sectionCompletion(p, sf.costs)],
            ['#sec-character', 'Lodge character', sectionCompletion(p, sf.character)],
            ['#sec-social-family', 'Social & family life', sectionCompletion(p, sf.socialFamily)],
            ['#sec-interests', 'Interests & communication', sectionCompletion(p, sf.interests)],
            ['#sec-royal-arch', 'Royal Arch', sectionCompletion(p, sf.royalArch)],
            ['#sec-narrative', 'Tell your story', sectionCompletion(p, sf.narrative)],
            ['#sec-metadata', 'Sign-off', sectionCompletion(p, sf.metadata)],
          ].map(([href, label, sec]) => `
            <a href="${href}" class="profile-nav-item">
              <span class="profile-nav-label">${escapeHtml(label)}</span>
              <span class="profile-nav-count ${sec.filled === sec.total ? 'done' : sec.filled === 0 ? '' : 'partial'}">${sec.filled}/${sec.total}</span>
            </a>
          `).join('')}
        </aside>
        <form class="profile-form" id="profile-form" onsubmit="return false">
          ${renderCrestBlock(p)}
          ${renderMeetingSection(p)}
          ${renderMembershipSection(p)}
          ${renderOfficersSection(p)}
          ${renderCandidatesSection(p)}
          ${renderRitualSection(p)}
          ${renderCostsSection(p)}
          ${renderCharacterSection(p)}
          ${renderSocialFamilySection(p)}
          ${renderInterestsSection(p)}
          ${renderRoyalArchSection(p)}
          ${renderNarrativeSection(p)}
          ${renderMetadataSection(p)}
          ${renderSubmitBlock(p)}
        </form>
      </div>
    </div>
  `;
}

function renderProfilePreview(lodge, p) {
  const cost = calculateAnnualCost(p);

  // ---- Atmosphere lines from culture spectrums ----
  const atmosphereLines = [];
  if (p.cultureRitual === 'Traditional and word-perfect') {
    atmosphereLines.push('We take a traditional, word-perfect approach to our ceremonies.');
  } else if (p.cultureRitual === 'Relaxed and supportive') {
    atmosphereLines.push('Our approach to ceremonies is relaxed and supportive - we help each other through it.');
  } else if (p.cultureRitual === 'Balanced') {
    atmosphereLines.push('We balance tradition with a supportive approach to our ceremonies.');
  }
  if (p.cultureMeetingPace === 'Punctual and brisk') {
    atmosphereLines.push('Our meetings are punctual and businesslike.');
  } else if (p.cultureMeetingPace === 'Leisurely and unhurried') {
    atmosphereLines.push('We take our time over our meetings rather than rushing.');
  } else if (p.cultureMeetingPace === 'Balanced') {
    atmosphereLines.push('Our meetings have a steady, comfortable pace.');
  }
  if (p.cultureFestiveBoard === 'Formal and structured') {
    atmosphereLines.push('The Festive Board (the meal and sociable evening after the meeting) is formal and structured.');
  } else if (p.cultureFestiveBoard === 'Lively and social') {
    atmosphereLines.push('The Festive Board (the meal and sociable evening after the meeting) is one of the real highlights - lively, social, and welcoming.');
  } else if (p.cultureFestiveBoard === 'Balanced') {
    atmosphereLines.push('The Festive Board (the meal and sociable evening after the meeting) is friendly and balanced - some formality, plenty of conversation.');
  }
  if (p.cultureVisiting === 'Active visiting culture') {
    atmosphereLines.push('Members regularly visit other lodges, and we warmly welcome visitors to ours.');
  } else if (p.cultureVisiting === 'Members-focused') {
    atmosphereLines.push('Our focus is very much on our own members and meetings.');
  }

  // ---- Status badge ----
  let acceptingBadge = '';
  if (p.currentlyAccepting === 'Yes') {
    acceptingBadge = '<span class="preview-status-badge open">Currently welcoming new candidates</span>';
  } else if (p.currentlyAccepting === 'Yes but slow') {
    acceptingBadge = '<span class="preview-status-badge slow">Welcoming new candidates - there may be a short wait</span>';
  } else if (p.currentlyAccepting === 'No, no initiates currently') {
    acceptingBadge = '<span class="preview-status-badge paused">Not taking new candidates at the moment</span>';
  } else if (p.currentlyAccepting === 'No, non-progressive') {
    acceptingBadge = '<span class="preview-status-badge closed">This lodge is no longer taking new candidates</span>';
  }

  // ---- Special interests (excluding "Other" placeholder) ----
  const interests = (p.lodgeInterests || []).filter(i => i && i !== 'Other (describe below)');
  const interestsHtml = interests.length ? `
    <section>
      <h3>Special interests</h3>
      <div class="preview-tag-row">
        ${interests.map(i => `<span class="preview-tag">${escapeHtml(i)}</span>`).join('')}
      </div>
      ${p.universityName ? `<p style="margin-top:8px"><strong>University:</strong> ${escapeHtml(p.universityName)}</p>` : ''}
      ${p.interestOtherDetails ? `<p style="margin-top:8px">${escapeHtml(p.interestOtherDetails)}</p>` : ''}
    </section>
  ` : '';

  // ---- Lodge emphases (what the lodge cares about most) ----
  const emphases = (p.lodgeEmphases || []).filter(e => e);
  const emphasesHtml = emphases.length ? `
    <section>
      <h3>What this lodge values</h3>
      <p>These are the parts of lodge life we particularly enjoy and put effort into:</p>
      <div class="preview-tag-row">
        ${emphases.map(e => `<span class="preview-tag emphasis">${escapeHtml(e)}</span>`).join('')}
      </div>
    </section>
  ` : '';

  // ---- Family-inclusive life ----
  const familyEvents = (p.familyEvents || []).filter(e => e && e !== 'Other (describe below)');
  const familyHtml = (p.familyInclusionApproach || familyEvents.length || p.familyLifeNotes) ? `
    <section>
      <h3>Family and social life</h3>
      ${p.familyInclusionApproach ? `<p><strong>How we include families:</strong> ${escapeHtml(p.familyInclusionApproach)}</p>` : ''}
      ${familyEvents.length ? `
        <p><strong>Events through the year that include partners and families:</strong></p>
        <div class="preview-tag-row">
          ${familyEvents.map(e => `<span class="preview-tag">${escapeHtml(e)}</span>`).join('')}
        </div>
      ` : ''}
      ${p.familyEventsOtherDetails ? `<p style="margin-top:8px">${escapeHtml(p.familyEventsOtherDetails)}</p>` : ''}
      ${p.familyLifeNotes ? `<p style="margin-top:8px">${escapeHtml(p.familyLifeNotes)}</p>` : ''}
    </section>
  ` : '';

  // ---- At a glance facts panel ----
  // Build a list of (label, value) facts that we have data for. Only renders if we have at least 3 facts.
  // Cost info is intentionally NOT here - it has its own section below with full caveats.
  const meetingCount = (p.meetingRules || []).reduce((sum, r) => sum + ((r.months || []).length || 0), 0);
  const facts = [];
  if (meetingCount > 0) {
    facts.push(['Meetings per year', `${meetingCount} ${meetingCount === 1 ? 'meeting' : 'meetings'}`]);
  }
  if (p.meetsAt) facts.push(['Meets at', p.meetsAt]);
  if (p.timeOfDay) facts.push(['Time of day', p.timeOfDay]);
  if (p.meetingDuration) facts.push(['Meeting length', p.meetingDuration]);
  if (p.subscribingMembers !== '' && p.subscribingMembers !== null && p.subscribingMembers !== undefined) {
    facts.push(['Subscribing members', `Around ${p.subscribingMembers}`]);
  }

  const factsHtml = facts.length >= 3 ? `
    <section class="preview-glance">
      <h3>At a glance</h3>
      <dl class="preview-facts">
        ${facts.map(([k, v]) => `<div class="preview-fact"><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(String(v))}</dd></div>`).join('')}
      </dl>
    </section>
  ` : '';

  // ---- Fallback intro if whyJoin not filled ----
  // Brief, factual, never auto-invents personality. Just frames the lodge for the candidate.
  let introHtml = '';
  if (p.whyJoin) {
    introHtml = `<section><p class="lead">${escapeHtml(p.whyJoin)}</p></section>`;
  } else {
    introHtml = `<section><p class="lead">${escapeHtml(lodge.name)} meets in ${escapeHtml(lodge.centre)}, in the ${escapeHtml(lodge.region)} region of the Province of Essex.</p></section>`;
  }

  return `
    <div class="page profile-page profile-preview">
      <div class="profile-preview-header">
        <button class="btn-ghost btn-sm" data-action="toggle-preview">\u2190 Back to editor</button>
        <h2>Preview: how candidates will see this profile</h2>
      </div>
      <article class="profile-doc">
        <header class="profile-doc-header">
          ${p.crestImage ? `<img src="${escapeHtml(p.crestImage)}" alt="${escapeHtml(lodge.name)} crest" class="profile-doc-crest">` : ''}
          <h1>${escapeHtml(lodge.name)} <span class="mono">L${escapeHtml(lodge.number)}</span></h1>
          <p>${escapeHtml(lodge.centre)} \u00b7 ${escapeHtml(lodge.region)}</p>
          ${acceptingBadge}
        </header>

        ${introHtml}

        ${factsHtml}

        ${atmosphereLines.length ? `
          <section>
            <h3>Our atmosphere</h3>
            ${atmosphereLines.map(l => `<p>${escapeHtml(l)}</p>`).join('')}
          </section>
        ` : ''}

        ${p.lodgeCommunity ? `
          <section>
            <h3>Our members</h3>
            <p>${escapeHtml(p.lodgeCommunity)}</p>
          </section>
        ` : ''}

        ${emphasesHtml}

        ${interestsHtml}

        ${familyHtml}

        <section>
          <h3>When and where we meet</h3>
          <p><strong>Meeting schedule:</strong> ${escapeHtml(summarizeMeetingRules(p.meetingRules || []) || 'To be confirmed')}</p>
          ${p.meetsAt ? `<p><strong>Venue:</strong> ${escapeHtml(p.meetsAt)}</p>` : ''}
          ${p.timeOfDay ? `<p><strong>Time of day:</strong> ${escapeHtml(p.timeOfDay)}</p>` : ''}
          ${p.meetingDuration ? `<p><strong>How long a meeting takes:</strong> roughly ${escapeHtml(p.meetingDuration)} from start to finish.</p>` : ''}
        </section>

        <section>
          <h3>What it costs</h3>
          ${p.joiningFee ? `<p><strong>One-off joining fee:</strong> \u00a3${escapeHtml(p.joiningFee)}</p>` : ''}
          ${cost.ready ? `<p><strong>Typical annual cost:</strong> ${escapeHtml(cost.display)}</p>` : ''}
          <p class="preview-cost-note">${p.lastEditedAt ? `These figures are ballpark estimates correct as of ${escapeHtml(formatSubmissionDate(p.lastEditedAt))}.` : 'These figures are ballpark estimates correct at the time the lodge last updated this profile.'} They assume you attend every meeting and Festive Board during the year.</p>
          <p class="preview-cost-note">The annual cost covers your subscription and meals at the Festive Boards. Members buy their own regalia (the formal items worn in meetings) at certain points along the way - your future lodge will explain when and what you need.</p>
        </section>

        ${p.memberExpectations ? `
          <section>
            <h3>What we ask of members</h3>
            <p>${escapeHtml(p.memberExpectations)}</p>
          </section>
        ` : ''}

        ${p.background ? `
          <section class="preview-background">
            <h3>A little about our history</h3>
            <p>${escapeHtml(p.background)}</p>
          </section>
        ` : ''}
      </article>
    </div>
  `;
}

// ===== Profile editor event handlers =====
on('click', '[data-edit-profile]', (e, el) => {
  navigate('profile-edit', { lodgeId: el.dataset.editProfile });
});

on('input', '[data-profile-field]', (e, el) => {
  if (!State.editingProfile) return;
  const name = el.name;
  let value = el.value;
  if (el.type === 'number') value = value === '' ? '' : Number(value);
  State.editingProfile[name] = value;

  // When approval date is set and review date is empty, auto-fill review date
  // with a date 3 years later. The secretary can override it after if they like.
  if (name === 'approvedDate' && value && !State.editingProfile.reviewDate) {
    const approved = new Date(value);
    if (!isNaN(approved.getTime())) {
      const review = new Date(approved);
      review.setFullYear(review.getFullYear() + 3);
      State.editingProfile.reviewDate = review.toISOString().split('T')[0];
      scheduleProfileSave(State.currentLodgeId);
      render();
      return;
    }
  }

  scheduleProfileSave(State.currentLodgeId);
});

// Select changes (dropdowns) may toggle conditional fields, so re-render
on('change', 'select[data-profile-field]', (e, el) => {
  if (!State.editingProfile) return;
  State.editingProfile[el.name] = el.value;
  scheduleProfileSave(State.currentLodgeId);
  render();
});

on('change', '[data-profile-field-bool]', (e, el) => {
  if (!State.editingProfile) return;
  State.editingProfile[el.name] = el.checked;
  scheduleProfileSave(State.currentLodgeId);
  // Re-render in case this checkbox toggles conditional fields (e.g. nonProgressive)
  render();
});

on('change', '[data-profile-field-multi]', (e, el) => {
  if (!State.editingProfile) return;
  const name = el.name;
  const arr = State.editingProfile[name] || [];
  const value = el.value;
  if (el.checked) { if (!arr.includes(value)) arr.push(value); }
  else { const i = arr.indexOf(value); if (i >= 0) arr.splice(i, 1); }
  State.editingProfile[name] = arr;
  scheduleProfileSave(State.currentLodgeId);
  // Re-render in case this multi toggles a conditional "Other" textarea
  render();
});

on('click', '[data-spectrum]', (e, el) => {
  if (!State.editingProfile) return;
  const name = el.dataset.spectrum;
  const value = el.dataset.spectrumValue;
  // Toggle off if already selected, otherwise set
  if (State.editingProfile[name] === value) {
    State.editingProfile[name] = '';
  } else {
    State.editingProfile[name] = value;
  }
  scheduleProfileSave(State.currentLodgeId);
  render();
});

on('click', '[data-action="submit-profile"]', () => {
  if (!State.editingProfile) return;
  if (!State.editingProfile.approvedByLodge) return;
  // Mark profile as submitted with timestamp
  State.editingProfile.submittedAt = new Date().toISOString();
  // Force an immediate save (don't wait for debounce) so the timestamp lands in localStorage
  if (State.profileAutosaveTimer) clearTimeout(State.profileAutosaveTimer);
  commitProfile(State.currentLodgeId, State.editingProfile);
  State.profileSubmittedView = true;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
});

on('click', '[data-action="return-to-edit"]', () => {
  State.profileSubmittedView = false;
  render();
});

// ===== Crest upload =====
// Resizes images to a max dimension before storing as a base64 data URL,
// keeping localStorage usage modest regardless of the source file size.
on('change', '[data-crest-upload]', (e, el) => {
  if (!State.editingProfile) return;
  const file = el.files && el.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file (JPEG, PNG, or WebP).');
    el.value = '';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('That image is larger than 5MB. Please choose a smaller file.');
    el.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 600;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round(height * (maxDim / width));
          width = maxDim;
        } else {
          width = Math.round(width * (maxDim / height));
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      // White background under PNG transparency so JPEG output reads cleanly
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        State.editingProfile.crestImage = dataUrl;
        // Save immediately so the image is committed before user navigates away
        if (State.profileAutosaveTimer) clearTimeout(State.profileAutosaveTimer);
        commitProfile(State.currentLodgeId, State.editingProfile);
        render();
      } catch (err) {
        alert('Could not process that image. Try a different file.');
      }
      el.value = '';
    };
    img.onerror = () => {
      alert('Could not read that image. Try a different file.');
      el.value = '';
    };
    img.src = ev.target.result;
  };
  reader.onerror = () => {
    alert('Could not read that file.');
    el.value = '';
  };
  reader.readAsDataURL(file);
});

on('click', '[data-action="remove-crest"]', () => {
  if (!State.editingProfile) return;
  if (!confirm('Remove the lodge crest?')) return;
  State.editingProfile.crestImage = '';
  if (State.profileAutosaveTimer) clearTimeout(State.profileAutosaveTimer);
  commitProfile(State.currentLodgeId, State.editingProfile);
  render();
});

on('click', '[data-action="toggle-preview"]', () => {
  State.profilePreview = !State.profilePreview;
  render();
});

on('click', '[data-back]', (e, el) => {
  navigate('lodge', { lodgeId: el.dataset.back });
});

// Meeting rules handlers
function _ensureRules() {
  if (!State.editingProfile.meetingRules || State.editingProfile.meetingRules.length === 0) {
    State.editingProfile.meetingRules = [emptyMeetingRule()];
  }
}

on('change', '[data-rule-ordinal]', (e, el) => {
  if (!State.editingProfile) return;
  _ensureRules();
  const idx = parseInt(el.dataset.ruleOrdinal);
  State.editingProfile.meetingRules[idx].ordinal = el.value;
  scheduleProfileSave(State.currentLodgeId);
  render();
});

on('change', '[data-rule-day]', (e, el) => {
  if (!State.editingProfile) return;
  _ensureRules();
  const idx = parseInt(el.dataset.ruleDay);
  State.editingProfile.meetingRules[idx].day = el.value;
  scheduleProfileSave(State.currentLodgeId);
  render();
});

on('click', '[data-toggle-month]', (e, el) => {
  if (!State.editingProfile) return;
  _ensureRules();
  const [idxStr, month] = el.dataset.toggleMonth.split(':');
  const idx = parseInt(idxStr);
  const months = State.editingProfile.meetingRules[idx].months || [];
  const i = months.indexOf(month);
  if (i >= 0) months.splice(i, 1);
  else months.push(month);
  months.sort((a, b) => MONTHS_SHORT.indexOf(a) - MONTHS_SHORT.indexOf(b));
  State.editingProfile.meetingRules[idx].months = months;
  scheduleProfileSave(State.currentLodgeId);
  render();
});

on('click', '[data-month-quick]', (e, el) => {
  if (!State.editingProfile) return;
  _ensureRules();
  const [idxStr, quick] = el.dataset.monthQuick.split(':');
  const idx = parseInt(idxStr);
  let months = [];
  if (quick === 'all') months = [...MONTHS_SHORT];
  else if (quick === 'not-aug') months = MONTHS_SHORT.filter(m => m !== 'Aug');
  else if (quick === 'sept-april') months = ['Jan','Feb','Mar','Apr','Sep','Oct','Nov','Dec'];
  else if (quick === 'clear') months = [];
  State.editingProfile.meetingRules[idx].months = months;
  scheduleProfileSave(State.currentLodgeId);
  render();
});

on('click', '[data-add-rule]', () => {
  if (!State.editingProfile) return;
  _ensureRules();
  State.editingProfile.meetingRules.push(emptyMeetingRule());
  scheduleProfileSave(State.currentLodgeId);
  render();
});

on('click', '[data-remove-rule]', (e, el) => {
  if (!State.editingProfile) return;
  _ensureRules();
  const idx = parseInt(el.dataset.removeRule);
  State.editingProfile.meetingRules.splice(idx, 1);
  if (State.editingProfile.meetingRules.length === 0) {
    State.editingProfile.meetingRules = [emptyMeetingRule()];
  }
  scheduleProfileSave(State.currentLodgeId);
  render();
});

// Royal Arch Chapters handlers
function _ensureChapters() {
  if (!State.editingProfile.raChapters || State.editingProfile.raChapters.length === 0) {
    State.editingProfile.raChapters = [''];
  }
}

on('input', '[data-chapter-input]', (e, el) => {
  if (!State.editingProfile) return;
  _ensureChapters();
  const idx = parseInt(el.dataset.chapterInput);
  State.editingProfile.raChapters[idx] = el.value;
  scheduleProfileSave(State.currentLodgeId);
});

on('click', '[data-add-chapter]', () => {
  if (!State.editingProfile) return;
  _ensureChapters();
  State.editingProfile.raChapters.push('');
  scheduleProfileSave(State.currentLodgeId);
  render();
});

on('click', '[data-remove-chapter]', (e, el) => {
  if (!State.editingProfile) return;
  _ensureChapters();
  const idx = parseInt(el.dataset.removeChapter);
  State.editingProfile.raChapters.splice(idx, 1);
  if (State.editingProfile.raChapters.length === 0) {
    State.editingProfile.raChapters = [''];
  }
  scheduleProfileSave(State.currentLodgeId);
  render();
});

// ===== Cache-proof inline style injection =====
// External CSS files can be cached aggressively by the browser, defeating
// alignment fixes. Injecting a <style> tag into the document head bypasses
// that entirely and guarantees these rules are applied.
(function injectProfileAlignmentStyles() {
  if (document.getElementById('profile-alignment-styles')) return;
  const style = document.createElement('style');
  style.id = 'profile-alignment-styles';
  style.textContent = `
    .field-row .profile-field {
      display: flex !important;
      flex-direction: column !important;
    }
    .field-row .profile-field > input,
    .field-row .profile-field > select,
    .field-row .profile-field > textarea {
      margin-top: auto !important;
    }
  `;
  document.head.appendChild(style);
})();

// =====================================================================
// READ-ONLY LODGE PROFILE SUMMARY (rendered on the lodge detail page)
// =====================================================================

// Render a value, or '' if empty/blank
function _v(value) {
  if (value === null || value === undefined || value === '') return '';
  return escapeHtml(String(value));
}

// Wrap a label/value pair if value is non-empty
function _pair(label, value, opts) {
  if (value === null || value === undefined || value === '') return '';
  const isHtml = opts && opts.html;
  return `<p><strong>${escapeHtml(label)}:</strong> ${isHtml ? value : escapeHtml(String(value))}</p>`;
}

// Render a list of tags from an array
function _tags(arr, className) {
  if (!arr || !arr.length) return '';
  return `<div class="profile-tag-row">${arr.map(item => `<span class="profile-tag ${className || ''}">${escapeHtml(item)}</span>`).join('')}</div>`;
}

// Format a date string (ISO or YYYY-MM-DD) to a friendly UK date, or '' if blank
function _date(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) { return ''; }
}

// Render a spectrum value as a styled pill in context of its scale
function _spectrum(label, value, optionA, optionB) {
  if (!value) return '';
  let position = 'middle';
  if (value === optionA) position = 'left';
  else if (value === optionB) position = 'right';
  return `
    <div class="profile-spectrum-display">
      <div class="profile-spectrum-label">${escapeHtml(label)}</div>
      <div class="profile-spectrum-track">
        <div class="profile-spectrum-end ${position === 'left' ? 'active' : ''}">${escapeHtml(optionA)}</div>
        <div class="profile-spectrum-mid ${position === 'middle' ? 'active' : ''}">Balanced</div>
        <div class="profile-spectrum-end ${position === 'right' ? 'active' : ''}">${escapeHtml(optionB)}</div>
      </div>
    </div>
  `;
}

// Render the status banner for a profile (submitted, draft, or none)
// Calculate months between two dates (approximate but good enough for thresholds)
function _monthsSince(iso) {
  if (!iso) return null;
  try {
    const then = new Date(iso);
    if (isNaN(then.getTime())) return null;
    const now = new Date();
    const ms = now.getTime() - then.getTime();
    if (ms < 0) return 0;
    return ms / (1000 * 60 * 60 * 24 * 30.44); // average month length in days
  } catch (e) { return null; }
}

function renderProfileStatusBanner(lodge, p) {
  const submitted = !!p.submittedAt;
  const hasOwnData = hasStoredProfile(lodge.id);
  const en = enrichedFor(lodge.id);
  const completion = profileCompletion(p);

  // Freshness check - based on the most recent edit (or submission if no edit stamp)
  const freshnessDate = p.lastEditedAt || p.submittedAt;
  const monthsOld = _monthsSince(freshnessDate);
  const overdue = monthsOld !== null && monthsOld >= 36;
  const dueSoon = monthsOld !== null && monthsOld >= 30 && monthsOld < 36;
  const monthsRounded = monthsOld !== null ? Math.floor(monthsOld) : null;

  // Overdue takes precedence over everything except "no profile at all"
  if (overdue && (submitted || hasOwnData)) {
    return `
      <div class="profile-status-banner overdue">
        <div class="profile-status-icon" style="background:#C53030">!</div>
        <div class="profile-status-text">
          <strong>Review overdue.</strong>
          This profile has not been updated for ${monthsRounded} months. Provincial recommendation is review every 36 months. Contact the lodge to refresh the profile.
          ${submitted ? `Last submitted ${escapeHtml(_date(p.submittedAt))}.` : ''}
        </div>
      </div>
    `;
  }
  if (dueSoon && (submitted || hasOwnData)) {
    return `
      <div class="profile-status-banner due-soon">
        <div class="profile-status-icon" style="background:#D97706">\u26A0</div>
        <div class="profile-status-text">
          <strong>Review due soon.</strong>
          This profile has not been updated for ${monthsRounded} months. It will be due for a refresh at 36 months. Consider reaching out to the lodge.
          ${submitted ? `Last submitted ${escapeHtml(_date(p.submittedAt))}.` : ''}
        </div>
      </div>
    `;
  }

  if (submitted) {
    return `
      <div class="profile-status-banner submitted">
        <div class="profile-status-icon">\u2713</div>
        <div class="profile-status-text">
          <strong>Profile submitted to Provincial Membership Team on ${escapeHtml(_date(p.submittedAt))}.</strong>
          ${p.preparedBy ? `Prepared by ${escapeHtml(p.preparedBy)}.` : ''}
          ${p.reviewDate ? `Next review due ${escapeHtml(_date(p.reviewDate))}.` : ''}
        </div>
      </div>
    `;
  }
  if (hasOwnData) {
    return `
      <div class="profile-status-banner draft">
        <div class="profile-status-text">
          <strong>Profile in draft.</strong>
          ${completion.percent}% complete. This profile has been started but not yet submitted to the Provincial Membership Team.
          ${p.lastEditedAt ? ` Last edited ${escapeHtml(_date(p.lastEditedAt))}.` : ''}
        </div>
      </div>
    `;
  }
  if (en) {
    return `
      <div class="profile-status-banner sample">
        <div class="profile-status-text">
          <strong>Sample data shown.</strong>
          This information was carried over from earlier records. The lodge has not yet prepared a formal profile in the new portal.
        </div>
      </div>
    `;
  }
  return `
    <div class="profile-status-banner none">
      <div class="profile-status-text">
        <strong>No profile yet.</strong>
        This lodge has not yet completed a profile. Use Create lodge profile above to get started.
      </div>
    </div>
  `;
}

// Render the structured profile summary - read-only view for the lodge detail page
function renderLodgeProfileSummary(lodge, p) {
  // Build each section, only including those with data to show
  const sections = [];

  // About this lodge - narrative
  const aboutParts = [];
  if (p.summary) aboutParts.push(`<p class="profile-summary-intro">${escapeHtml(p.summary)}</p>`);
  if (p.whyJoin) aboutParts.push(`<h4>Why join this lodge</h4><p>${escapeHtml(p.whyJoin)}</p>`);
  if (p.background) aboutParts.push(`<h4>Background and history</h4><p>${escapeHtml(p.background)}</p>`);
  if (p.traditionsNarrative) aboutParts.push(`<h4>Traditions and ritual style</h4><p>${escapeHtml(p.traditionsNarrative)}</p>`);
  if (p.charityNarrative) aboutParts.push(`<h4>Charity work</h4><p>${escapeHtml(p.charityNarrative)}</p>`);
  if (p.memberExpectations) aboutParts.push(`<h4>What we ask of members</h4><p>${escapeHtml(p.memberExpectations)}</p>`);
  if (p.costsNarrative) aboutParts.push(`<h4>Notes on costs</h4><p>${escapeHtml(p.costsNarrative)}</p>`);
  if (aboutParts.length) {
    sections.push(`<div class="section"><h3>About this lodge</h3>${aboutParts.join('')}</div>`);
  }

  // Meeting pattern
  const meetingParts = [];
  const meetingsSummary = (typeof summarizeMeetingRules === 'function') ? summarizeMeetingRules(p.meetingRules || []) : '';
  if (meetingsSummary) meetingParts.push(_pair('Meets', meetingsSummary));
  if (p.meetsAt) meetingParts.push(_pair('Venue', p.meetsAt));
  if (p.timeOfDay) meetingParts.push(_pair('Time of day', p.timeOfDay));
  if (p.meetingDuration) meetingParts.push(_pair('Typical meeting length', p.meetingDuration));
  if (p.loiLocation) meetingParts.push(_pair('Lodge of Instruction', p.loiLocation));
  if (p.loiFrequency) meetingParts.push(_pair('LoI frequency', p.loiFrequency));
  if (p.loiDay) meetingParts.push(_pair('LoI day', p.loiDay));
  if (p.loiTime) meetingParts.push(_pair('LoI start time', p.loiTime));
  if (p.loiNotes) meetingParts.push(`<p>${escapeHtml(p.loiNotes)}</p>`);
  if (meetingParts.length) {
    sections.push(`<div class="section"><h3>Meeting pattern</h3>${meetingParts.join('')}</div>`);
  }

  // Membership and health
  const membershipParts = [];
  if (p.subscribingMembers !== '' && p.subscribingMembers !== null) membershipParts.push(_pair('Subscribing members', p.subscribingMembers));
  if (p.regularAttendance !== '' && p.regularAttendance !== null) membershipParts.push(_pair('Regular attendance', p.regularAttendance));
  if (p.ageProfile) membershipParts.push(_pair('Age profile', p.ageProfile));
  if (p.ageNotes) membershipParts.push(`<p>${escapeHtml(p.ageNotes)}</p>`);
  if (p.health) membershipParts.push(_pair('Lodge health', p.health));
  if (p.lodgeCommunity) membershipParts.push(`<h4>Lodge community</h4><p>${escapeHtml(p.lodgeCommunity)}</p>`);
  if (p.lodgeOnHold) membershipParts.push(`<p class="profile-warning">This lodge is currently on hold.</p>`);
  if (membershipParts.length) {
    sections.push(`<div class="section"><h3>Membership and health</h3>${membershipParts.join('')}</div>`);
  }

  // Officers
  const officerParts = [];
  if (p.membersBelowIM !== '' && p.membersBelowIM !== null) officerParts.push(_pair('Members below Installed Master', p.membersBelowIM));
  if (p.inProgressiveOffice !== '' && p.inProgressiveOffice !== null && !p.nonProgressive) officerParts.push(_pair('Currently in progressive office', p.inProgressiveOffice));
  if (p.provGrandLodgeOfficers !== '' && p.provGrandLodgeOfficers !== null) officerParts.push(_pair('Provincial Grand Lodge Officers', p.provGrandLodgeOfficers));
  if (p.grandLodgeOfficers !== '' && p.grandLodgeOfficers !== null) officerParts.push(_pair('Grand Lodge Officers', p.grandLodgeOfficers));
  if (officerParts.length) {
    sections.push(`<div class="section"><h3>Officers and ranks</h3>${officerParts.join('')}</div>`);
  }

  // Candidates and progression
  const candidateParts = [];
  if (p.typicalJoiningRoute) candidateParts.push(_pair('How members typically join', p.typicalJoiningRoute));
  if (p.currentlyAccepting) candidateParts.push(_pair('Currently accepting candidates', p.currentlyAccepting));
  if (p.orfCount !== '' && p.orfCount !== null) candidateParts.push(_pair('Candidates currently waiting (ORF)', p.orfCount));
  if (p.lastInitiation) candidateParts.push(_pair('Date of last initiation', _date(p.lastInitiation)));
  if (p.progressionPace && !p.nonProgressive) candidateParts.push(_pair('Progression pace', p.progressionPace));
  if (p.progressionNotes && !p.nonProgressive) candidateParts.push(`<p>${escapeHtml(p.progressionNotes)}</p>`);
  if (p.nonProgressive) candidateParts.push(`<p class="profile-note"><em>This is a non-progressive lodge.</em></p>`);
  const has12mData = (p.initiates_12m !== '' && p.initiates_12m !== null) || (p.joiners_12m !== '' && p.joiners_12m !== null) || (p.lost_12m !== '' && p.lost_12m !== null);
  if (has12mData) {
    candidateParts.push('<h4>Last 12 months</h4>');
    if (p.initiates_12m !== '' && p.initiates_12m !== null) candidateParts.push(_pair('Initiates', p.initiates_12m));
    if (p.joiners_12m !== '' && p.joiners_12m !== null) candidateParts.push(_pair('Joining members', p.joiners_12m));
    if (p.lost_12m !== '' && p.lost_12m !== null) candidateParts.push(_pair('Members lost', p.lost_12m));
  }
  if (candidateParts.length) {
    sections.push(`<div class="section"><h3>Candidates and progression</h3>${candidateParts.join('')}</div>`);
  }

  // Ritual and education
  const ritualParts = [];
  if (p.ritual) ritualParts.push(_pair('Ritual used', p.ritual));
  if (p.ritualQuality) ritualParts.push(_pair('Ritual standard', p.ritualQuality));
  if (p.ritualNotes) ritualParts.push(`<p>${escapeHtml(p.ritualNotes)}</p>`);
  if (p.educationPractices && p.educationPractices.length) {
    ritualParts.push('<h4>Masonic education practices</h4>');
    ritualParts.push(_tags(p.educationPractices, 'practice'));
  }
  if (p.educationNotes) ritualParts.push(`<p>${escapeHtml(p.educationNotes)}</p>`);
  if (p.consecratedYear) ritualParts.push(_pair('Year consecrated', p.consecratedYear));
  if (p.sponsoringLodge) ritualParts.push(_pair('Sponsoring lodge', p.sponsoringLodge));
  if (ritualParts.length) {
    sections.push(`<div class="section"><h3>Ritual and education</h3>${ritualParts.join('')}</div>`);
  }

  // Costs
  const costParts = [];
  if (p.joiningFee !== '' && p.joiningFee !== null) costParts.push(_pair('Joining fee', `\u00a3${p.joiningFee}`));
  if (p.annualSubscription !== '' && p.annualSubscription !== null) costParts.push(_pair('Annual subscription', `\u00a3${p.annualSubscription}`));
  if (p.festiveBoardCount !== '' && p.festiveBoardCount !== null) costParts.push(_pair('Festive Boards per year', p.festiveBoardCount));
  if (p.festiveBoardCost) costParts.push(_pair('Festive Board cost per meeting', p.festiveBoardCost));
  const cost = (typeof calculateAnnualCost === 'function') ? calculateAnnualCost(p) : { ready: false, display: '' };
  if (cost.ready) costParts.push(`<p class="profile-calculated"><strong>Typical annual cost: ${escapeHtml(cost.display)}</strong> (excludes joining fee, alms, one-off regalia)</p>`);
  if (p.regaliaRequired && p.regaliaRequired.length) {
    costParts.push('<h4>Regalia and equipment members are expected to have</h4>');
    costParts.push(_tags(p.regaliaRequired, 'regalia'));
  }
  if (p.regaliaOtherDetails) costParts.push(`<p>${escapeHtml(p.regaliaOtherDetails)}</p>`);
  if (p.paymentMethods && p.paymentMethods.length) {
    costParts.push('<h4>Payment methods accepted</h4>');
    costParts.push(_tags(p.paymentMethods, 'payment'));
  }
  if (costParts.length) {
    sections.push(`<div class="section"><h3>Costs and regalia</h3>${costParts.join('')}</div>`);
  }

  // Lodge character - emphases and culture
  const characterParts = [];
  if (p.lodgeEmphases && p.lodgeEmphases.length) {
    characterParts.push('<h4>What this lodge emphasises</h4>');
    characterParts.push(_tags(p.lodgeEmphases, 'emphasis'));
  }
  const cultureRows = [];
  if (p.cultureRitual) cultureRows.push(_spectrum('Ritual approach', p.cultureRitual, 'Traditional and word-perfect', 'Relaxed and supportive'));
  if (p.cultureMeetingPace) cultureRows.push(_spectrum('Meeting pace', p.cultureMeetingPace, 'Punctual and brisk', 'Leisurely and unhurried'));
  if (p.cultureFestiveBoard) cultureRows.push(_spectrum('Festive Board character', p.cultureFestiveBoard, 'Formal and structured', 'Lively and social'));
  if (p.cultureVisiting) cultureRows.push(_spectrum('Welcome to visitors', p.cultureVisiting, 'Active visiting culture', 'Members-focused'));
  if (cultureRows.length) {
    characterParts.push('<h4>Lodge culture</h4>');
    characterParts.push(`<div class="profile-spectrum-list">${cultureRows.join('')}</div>`);
  }
  if (characterParts.length) {
    sections.push(`<div class="section"><h3>Lodge character</h3>${characterParts.join('')}</div>`);
  }

  // Social and family life
  const socialParts = [];
  if (p.familyInclusionApproach) socialParts.push(_pair('Family inclusion approach', p.familyInclusionApproach));
  if (p.ladiesFestivalFormat) socialParts.push(_pair('Ladies Festival format', p.ladiesFestivalFormat));
  if (p.familyEvents && p.familyEvents.length) {
    socialParts.push('<h4>Family-inclusive events</h4>');
    socialParts.push(_tags(p.familyEvents, 'family'));
  }
  if (p.familyEventsOtherDetails) socialParts.push(`<p>${escapeHtml(p.familyEventsOtherDetails)}</p>`);
  if (p.familyLifeNotes) socialParts.push(`<p>${escapeHtml(p.familyLifeNotes)}</p>`);
  if (socialParts.length) {
    sections.push(`<div class="section"><h3>Social and family life</h3>${socialParts.join('')}</div>`);
  }

  // Interests and communication
  const interestParts = [];
  if (p.lodgeInterests && p.lodgeInterests.length) {
    interestParts.push('<h4>Special interests</h4>');
    interestParts.push(_tags(p.lodgeInterests, 'interest'));
  }
  if (p.universityName) interestParts.push(_pair('University', p.universityName));
  if (p.interestOtherDetails) interestParts.push(`<p>${escapeHtml(p.interestOtherDetails)}</p>`);
  if (p.communicationChannels && p.communicationChannels.length) {
    interestParts.push('<h4>Communication channels</h4>');
    interestParts.push(_tags(p.communicationChannels, 'channel'));
  }
  if (interestParts.length) {
    sections.push(`<div class="section"><h3>Special interests and communication</h3>${interestParts.join('')}</div>`);
  }

  // Royal Arch
  const raChapters = (p.raChapters || []).filter(c => c && c.trim());
  const hasRA = p.raRepresentative || (p.raCompanionsInLodge !== '' && p.raCompanionsInLodge !== null) || raChapters.length;
  if (hasRA) {
    const raParts = [];
    if (p.raRepresentative) raParts.push(_pair('Lodge Royal Arch Representative', p.raRepresentative));
    if (p.raCompanionsInLodge !== '' && p.raCompanionsInLodge !== null) raParts.push(_pair('Royal Arch Companions in the lodge', p.raCompanionsInLodge));
    if (raChapters.length) {
      raParts.push(`<h4>Chapters that Lodge members are Companions of</h4>`);
      raParts.push(`<ul class="profile-list">${raChapters.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>`);
    }
    sections.push(`<div class="section"><h3>Royal Arch</h3>${raParts.join('')}</div>`);
  }

  // Sign-off - only show if profile is approved/submitted
  if (p.approvedByLodge || p.submittedAt) {
    const signoffParts = [];
    if (p.preparedBy) signoffParts.push(_pair('Prepared by', p.preparedBy));
    if (p.approvedByLodge && p.approvedDate) signoffParts.push(_pair('Approved by the lodge on', _date(p.approvedDate)));
    if (p.submittedAt) signoffParts.push(_pair('Submitted to Province on', _date(p.submittedAt)));
    if (p.reviewDate) signoffParts.push(_pair('Next review due', _date(p.reviewDate)));
    if (signoffParts.length) {
      sections.push(`<div class="section"><h3>Sign-off</h3>${signoffParts.join('')}</div>`);
    }
  }

  if (sections.length === 0) {
    return `
      <div class="section">
        <h3>About this lodge</h3>
        <p>This lodge does not yet have a structured profile in the portal. Use Create lodge profile above to get started.</p>
      </div>
    `;
  }
  return sections.join('');
}
