// Pathway Portal profile editor - helpers, render functions, handlers

// ===== Lodge Profile editor =====

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function profileKey(lodgeId) { return 'pathway_profile_' + lodgeId; }

function loadProfile(lodgeId) {
  try {
    const stored = localStorage.getItem(profileKey(lodgeId));
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  const en = PORTAL_DATA.enriched[lodgeId];
  if (en) return enrichedToProfile(en);
  return emptyProfile();
}

function emptyMeetingRule() { return { ordinal: '', day: '', months: [] }; }

function emptyProfile() {
  return {
    meetingRules: [], meetingFrequency: '', timeOfDay: '', meetingTime: '',
    averageDurationMinutes: '', meetsAt: '',
    loiFrequency: '', loiDay: '', loiTime: '', loiLocation: '',
    subscribingMembers: '', regularAttendance: '', youngestMember: '', oldestMember: '',
    ageDemographic: '', ageNotes: '',
    health: '', diversityInclusive: false, diversityStatement: '',
    lightBluesInOffice: '', lightBluesTotal: '', grandLodgeOfficers: '', provGrandLodgeOfficers: '',
    orfCount: '', lastInitiation: '', currentlyAccepting: '',
    initiates_12m: '', joiners_12m: '', lost_12m: '',
    raRepresentative: '', raCompanionsInLodge: '', raChapterAffiliated: '',
    ritual: '', ritualQuality: '', ritualNotes: '',
    masonicEducation: '', masonicEducationNotes: '',
    mentorActive: false, solomonUsed: false,
    consecratedYear: '', sponsoringLodge: '',
    progressionPace: '', progressionNotes: '',
    joiningFee: '', annualSubscription: '', festiveBoardCount: '', festiveBoardCost: '',
    almsCollection: '', raffleContribution: '', regaliaNotes: '', averageAnnualCost: '',
    paymentMethods: [],
    priorities: [], motivationsServed: [],
    universitiesScheme: false, universitiesSchemeNotes: '', interestTags: [],
    socialEvents: '', communicationChannels: [],
    background: '', meetingDetailsNarrative: '', healthNarrative: '', ritualNarrative: '',
    charityNarrative: '', socialNarrative: '', expectationsNarrative: '', costsNarrative: '', summary: '',
    preparedBy: '', approvedByLodge: false, approvedDate: '', reviewDate: '',
  };
}

function enrichedToProfile(en) {
  const p = emptyProfile();
  if (en.meeting_time) p.meetingTime = en.meeting_time;
  if (en.time_of_day) p.timeOfDay = en.time_of_day;
  if (en.festive_board_count !== undefined) p.festiveBoardCount = en.festive_board_count;
  if (en.lodge_of_instruction) p.loiLocation = en.lodge_of_instruction;
  if (en.social_events) p.socialEvents = en.social_events.join(', ');
  if (en.universities_scheme !== undefined) p.universitiesScheme = en.universities_scheme;
  if (en.universities_scheme_notes) p.universitiesSchemeNotes = en.universities_scheme_notes;
  if (en.progression_pace) p.progressionPace = en.progression_pace;
  if (en.progression_notes) p.progressionNotes = en.progression_notes;
  if (en.diversity_inclusive !== undefined) p.diversityInclusive = en.diversity_inclusive;
  if (en.diversity_statement) p.diversityStatement = en.diversity_statement;
  if (en.candidates_waiting !== undefined) p.orfCount = en.candidates_waiting;
  if (en.health) p.health = en.health;
  if (en.age_demographic) p.ageDemographic = en.age_demographic;
  if (en.age_notes) p.ageNotes = en.age_notes;
  if (en.regular_attendance !== undefined) p.regularAttendance = en.regular_attendance;
  if (en.annual_subscription !== undefined) p.annualSubscription = en.annual_subscription;
  if (en.ritual_quality) p.ritualQuality = en.ritual_quality;
  if (en.ritual_notes) p.ritualNotes = en.ritual_notes;
  if (en.masonic_education) p.masonicEducation = en.masonic_education;
  if (en.masonic_education_notes) p.masonicEducationNotes = en.masonic_education_notes;
  if (en.lodge_priorities) p.priorities = en.lodge_priorities;
  if (en.candidate_motivations_served) p.motivationsServed = en.candidate_motivations_served;
  if (en.communication_channels) p.communicationChannels = en.communication_channels;
  if (en.initiates_12_months !== undefined) p.initiates_12m = en.initiates_12_months;
  if (en.joiners_12_months !== undefined) p.joiners_12m = en.joiners_12_months;
  if (en.summary) p.summary = en.summary;
  if (en.consecrated_year) p.consecratedYear = en.consecrated_year;
  if (en.sponsoring_lodge) p.sponsoringLodge = en.sponsoring_lodge;
  if (en.meets_at) p.meetsAt = en.meets_at;
  return p;
}

function commitProfile(lodgeId, profile) {
  try {
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

function profileCompletion(profile) {
  const fields = ['meetingFrequency','meetingRulesComplete','timeOfDay','meetingTime','meetsAt','subscribingMembers','regularAttendance','ageDemographic','health','lightBluesInOffice','lightBluesTotal','orfCount','currentlyAccepting','lastInitiation','progressionPace','ritual','ritualQuality','joiningFee','annualSubscription','festiveBoardCost','averageAnnualCost','priorities','motivationsServed','communicationChannels','interestTags','background','meetingDetailsNarrative','healthNarrative','ritualNarrative','charityNarrative','expectationsNarrative','costsNarrative','summary','preparedBy'];
  let filled = 0;
  fields.forEach(f => {
    if (f === 'meetingRulesComplete') {
      const rules = profile.meetingRules || [];
      if (rules.some(r => r.ordinal && r.day && r.months && r.months.length > 0)) filled++;
      return;
    }
    const v = profile[f];
    if (Array.isArray(v) && v.length > 0) filled++;
    else if (typeof v === 'string' && v.trim().length > 0) filled++;
    else if (typeof v === 'number' && !isNaN(v)) filled++;
    else if (typeof v === 'boolean' && v === true) filled++;
  });
  return { filled, total: fields.length, percent: Math.round(filled / fields.length * 100) };
}

function sectionCompletion(profile, fieldList) {
  let filled = 0;
  fieldList.forEach(f => {
    if (f === 'meetingRulesComplete') {
      const rules = profile.meetingRules || [];
      if (rules.some(r => r.ordinal && r.day && r.months && r.months.length > 0)) filled++;
      return;
    }
    const v = profile[f];
    if (Array.isArray(v) && v.length > 0) filled++;
    else if (typeof v === 'string' && v.trim().length > 0) filled++;
    else if (typeof v === 'number' && !isNaN(v)) filled++;
    else if (typeof v === 'boolean' && v === true) filled++;
  });
  return { filled, total: fieldList.length };
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

function field({label, help, name, type, value, options, placeholder, rows}) {
  const id = 'fld-' + name;
  let control = '';
  if (type === 'text' || type === 'number' || type === 'date') {
    control = `<input id="${id}" name="${name}" type="${type}" value="${escapeHtml(value ?? '')}" placeholder="${escapeHtml(placeholder || '')}" data-profile-field>`;
  } else if (type === 'textarea') {
    control = `<textarea id="${id}" name="${name}" rows="${rows || 4}" placeholder="${escapeHtml(placeholder || '')}" data-profile-field>${escapeHtml(value || '')}</textarea>`;
  } else if (type === 'select') {
    control = `<select id="${id}" name="${name}" data-profile-field>
      <option value="">Please choose\u2026</option>
      ${options.map(o => `<option value="${escapeHtml(o)}" ${o === value ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}
    </select>`;
  } else if (type === 'checkbox') {
    control = `<label class="checkbox-row"><input type="checkbox" id="${id}" name="${name}" ${value ? 'checked' : ''} data-profile-field-bool><span>${escapeHtml(label)}</span></label>`;
    return `<div class="profile-field"><div class="checkbox-field">${control}${help ? `<span class="field-help">${escapeHtml(help)}</span>` : ''}</div></div>`;
  } else if (type === 'rank') {
    const items = (value && value.length) ? value : options.slice();
    control = `<div class="rank-list" data-profile-field-rank data-name="${escapeHtml(name)}">
      ${items.map((item, i) => `
        <div class="rank-item" data-item="${escapeHtml(item)}">
          <span class="rank-num">${i+1}</span>
          <span class="rank-label">${escapeHtml(item)}</span>
          <div class="rank-buttons">
            <button type="button" data-rank-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">\u2191</button>
            <button type="button" data-rank-down="${i}" ${i === items.length - 1 ? 'disabled' : ''} aria-label="Move down">\u2193</button>
          </div>
        </div>
      `).join('')}
    </div>`;
  }
  return `
    <div class="profile-field">
      <label for="${id}" class="profile-field-label">${escapeHtml(label)}</label>
      ${help ? `<div class="field-help">${escapeHtml(help)}</div>` : ''}
      ${control}
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

function renderMeetingSection(p) {
  const body = `
    ${renderMeetingRulesField(p)}
    ${field({ label: 'Meeting frequency overall', help: 'How the lodge would describe its meeting rhythm. The total number of meetings per year is calculated from the patterns above.', name: 'meetingFrequency', type: 'select', value: p.meetingFrequency, options: ['Monthly','Bi-monthly','Quarterly','Other'] })}
    <div class="field-row">
      ${field({ label: 'Time of day', help: 'Helps candidates with work commitments understand the schedule.', name: 'timeOfDay', type: 'select', value: p.timeOfDay, options: ['Daylight','Afternoon','Evening'] })}
      ${field({ label: 'Meeting starts at', help: 'Time the formal meeting opens.', name: 'meetingTime', type: 'text', value: p.meetingTime, placeholder: '18:00' })}
    </div>
    ${field({ label: 'Average meeting length', help: 'How long does the meeting plus Festive Board usually last? In minutes.', name: 'averageDurationMinutes', type: 'number', value: p.averageDurationMinutes, placeholder: '180' })}
    ${field({ label: 'Where the lodge meets', help: 'Venue name, if not the centre default.', name: 'meetsAt', type: 'text', value: p.meetsAt, placeholder: 'Chelmsford Masonic Hall' })}
    <h4 class="subsection-title">Lodge of Instruction</h4>
    <div class="field-row">
      ${field({ label: 'LoI frequency', help: 'How often does the LoI meet?', name: 'loiFrequency', type: 'select', value: p.loiFrequency, options: ['Weekly','Fortnightly','Monthly','Other','None'] })}
      ${field({ label: 'LoI day', help: 'Day of the week the LoI sits.', name: 'loiDay', type: 'select', value: p.loiDay, options: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] })}
    </div>
    <div class="field-row">
      ${field({ label: 'LoI time', help: 'Start time.', name: 'loiTime', type: 'text', value: p.loiTime, placeholder: '19:30' })}
      ${field({ label: 'LoI location', help: 'Where the LoI meets, if different from the lodge meeting venue.', name: 'loiLocation', type: 'text', value: p.loiLocation, placeholder: '' })}
    </div>
  `;
  return sectionCard('sec-meeting', 'Meeting pattern', 'When and where the lodge meets. This is the first thing candidates ask about.', body);
}

function renderMembershipSection(p) {
  const body = `
    <div class="field-row">
      ${field({ label: 'Subscribing members', help: 'Current total membership of the lodge.', name: 'subscribingMembers', type: 'number', value: p.subscribingMembers, placeholder: '55' })}
      ${field({ label: 'Regular attendance', help: 'Typical number attending a regular meeting.', name: 'regularAttendance', type: 'number', value: p.regularAttendance, placeholder: '30' })}
    </div>
    <div class="field-row">
      ${field({ label: 'Youngest member age', help: 'Approximate is fine.', name: 'youngestMember', type: 'number', value: p.youngestMember, placeholder: '25' })}
      ${field({ label: 'Oldest member age', help: 'Approximate is fine.', name: 'oldestMember', type: 'number', value: p.oldestMember, placeholder: '88' })}
    </div>
    ${field({ label: 'Overall age profile', help: 'How a candidate might describe the age mix.', name: 'ageDemographic', type: 'select', value: p.ageDemographic, options: ['Younger','Mixed','Older'] })}
    ${field({ label: 'Notes on age profile', help: 'For example: "Tends older overall but with a meaningful contingent of under-40s from the university link."', name: 'ageNotes', type: 'textarea', value: p.ageNotes, rows: 2 })}
    ${field({ label: 'Lodge health', help: 'Be honest. If you are looking to grow, candidates appreciate knowing.', name: 'health', type: 'select', value: p.health, options: ['Growing','Stable','Declining'] })}
    ${field({ label: 'Lodge is explicitly inclusive', help: 'Tick if your lodge has stated diversity and inclusion as a value.', name: 'diversityInclusive', type: 'checkbox', value: p.diversityInclusive })}
    ${field({ label: 'Inclusion statement', help: 'In your own words, how does the lodge approach diversity?', name: 'diversityStatement', type: 'textarea', value: p.diversityStatement, rows: 2 })}
  `;
  return sectionCard('sec-membership', 'Membership and health', 'Be candid. The matching tool relies on accurate numbers.', body);
}

function renderOfficersSection(p) {
  const body = `
    <div class="field-row">
      ${field({ label: 'Light Blues currently in office', help: 'Brethren below Past Master rank holding an office.', name: 'lightBluesInOffice', type: 'number', value: p.lightBluesInOffice, placeholder: '3' })}
      ${field({ label: 'Light Blues total (MM, FC, EA)', help: 'Total Light Blues in the lodge.', name: 'lightBluesTotal', type: 'number', value: p.lightBluesTotal, placeholder: '8' })}
    </div>
    <div class="field-row">
      ${field({ label: 'Grand Lodge Officers', help: 'Number of brethren holding Grand Lodge rank.', name: 'grandLodgeOfficers', type: 'number', value: p.grandLodgeOfficers, placeholder: '2' })}
      ${field({ label: 'Provincial Grand Lodge Officers', help: 'Number of brethren holding Provincial rank.', name: 'provGrandLodgeOfficers', type: 'number', value: p.provGrandLodgeOfficers, placeholder: '5' })}
    </div>
  `;
  return sectionCard('sec-officers', 'Officers and ranks', 'Helps the membership team understand the structure of your lodge.', body);
}

function renderCandidatesSection(p) {
  const body = `
    <div class="field-row">
      ${field({ label: 'Currently accepting candidates?', help: 'Is the lodge actively seeking new members at the moment?', name: 'currentlyAccepting', type: 'select', value: p.currentlyAccepting, options: ['Yes','Yes but slow','No, no initiates currently','No, non-progressive'] })}
      ${field({ label: 'Candidates currently waiting (ORF)', help: 'Number of potential candidates in the pipeline.', name: 'orfCount', type: 'number', value: p.orfCount, placeholder: '0' })}
    </div>
    ${field({ label: 'Date of last initiation', help: 'Most recent initiation ceremony.', name: 'lastInitiation', type: 'date', value: p.lastInitiation })}
    ${field({ label: 'Progression pace', help: 'How quickly does a candidate typically reach Master Mason?', name: 'progressionPace', type: 'select', value: p.progressionPace, options: ['Fast','Standard','Steady','Not progressing'] })}
    ${field({ label: 'Notes on progression', help: 'For example: "We aim to get a candidate to Master Mason in successive meetings."', name: 'progressionNotes', type: 'textarea', value: p.progressionNotes, rows: 2 })}
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
  const body = `
    ${field({ label: 'Ritual used', help: 'The ritual style your lodge works.', name: 'ritual', type: 'select', value: p.ritual, options: ['Emulation','Taylors','Universal','East End','Logic','West End','Calvers','Lux','Nigerian','Non Ritual Lodge','Varies','Other'] })}
    ${field({ label: 'Ritual standard', help: 'How would you describe the standard of work?', name: 'ritualQuality', type: 'select', value: p.ritualQuality, options: ['Exceptional','High','Good','Moderate'] })}
    ${field({ label: 'Ritual notes', help: 'For example: "Ritual is shared widely with younger members encouraged to participate."', name: 'ritualNotes', type: 'textarea', value: p.ritualNotes, rows: 3 })}
    ${field({ label: 'Masonic education emphasis', help: 'How active is masonic education in your lodge?', name: 'masonicEducation', type: 'select', value: p.masonicEducation, options: ['Active','Moderate','Light'] })}
    ${field({ label: 'Education notes', help: 'For example: "Active Lodge Mentor. Encourages use of Solomon."', name: 'masonicEducationNotes', type: 'textarea', value: p.masonicEducationNotes, rows: 2 })}
    ${field({ label: 'Lodge Mentor active', help: 'Tick if your lodge has an active Mentor scheme.', name: 'mentorActive', type: 'checkbox', value: p.mentorActive })}
    ${field({ label: 'Solomon used regularly', help: 'Tick if your lodge encourages use of Solomon (UGLE\u2019s online learning platform).', name: 'solomonUsed', type: 'checkbox', value: p.solomonUsed })}
    <h4 class="subsection-title">Lodge background</h4>
    <div class="field-row">
      ${field({ label: 'Year consecrated', help: 'The year the lodge was formed.', name: 'consecratedYear', type: 'number', value: p.consecratedYear, placeholder: '1961' })}
      ${field({ label: 'Sponsoring lodge', help: 'The lodge that sponsored your consecration.', name: 'sponsoringLodge', type: 'text', value: p.sponsoringLodge, placeholder: 'Springfield Lodge No. 3183' })}
    </div>
  `;
  return sectionCard('sec-ritual', 'Ritual and education', 'How your lodge works and what it teaches.', body);
}

function renderCostsSection(p) {
  const body = `
    <div class="field-row">
      ${field({ label: 'Joining fee (one-off)', help: 'Pounds. Includes Grand Lodge and Provincial registration where applicable.', name: 'joiningFee', type: 'number', value: p.joiningFee, placeholder: '250' })}
      ${field({ label: 'Annual subscription', help: 'Pounds per year.', name: 'annualSubscription', type: 'number', value: p.annualSubscription, placeholder: '168' })}
    </div>
    <div class="field-row">
      ${field({ label: 'Festive Boards per year', help: 'How many meetings include a Festive Board?', name: 'festiveBoardCount', type: 'number', value: p.festiveBoardCount, placeholder: '3' })}
      ${field({ label: 'Festive Board cost per meeting', help: 'Average pounds per Festive Board.', name: 'festiveBoardCost', type: 'number', value: p.festiveBoardCost, placeholder: '35' })}
    </div>
    <div class="field-row">
      ${field({ label: 'Alms collection (typical)', help: 'Voluntary charity collection during the meeting. Pounds.', name: 'almsCollection', type: 'number', value: p.almsCollection, placeholder: '2' })}
      ${field({ label: 'Raffle contribution (typical)', help: 'If a raffle is held. Pounds.', name: 'raffleContribution', type: 'number', value: p.raffleContribution, placeholder: '2' })}
    </div>
    ${field({ label: 'Average annual cost (ballpark)', help: 'Total a typical brother spends per year.', name: 'averageAnnualCost', type: 'number', value: p.averageAnnualCost, placeholder: '500' })}
    ${field({ label: 'Regalia and other items', help: 'When does a candidate need to purchase regalia, gloves, Provincial tie, etc?', name: 'regaliaNotes', type: 'textarea', value: p.regaliaNotes, rows: 2 })}
    <div class="profile-field">
      <label class="profile-field-label">Payment methods accepted</label>
      <div class="field-help">Tick all that apply.</div>
      <div class="multi-choice">
        ${['Standing Order','Bank Transfer','Online card payment','Cash','Cheque'].map(o => `
          <label class="multi-choice-item">
            <input type="checkbox" name="paymentMethods" value="${o}" ${(p.paymentMethods || []).includes(o) ? 'checked' : ''} data-profile-field-multi>
            <span>${o}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
  return sectionCard('sec-costs', 'Costs', 'Be specific. Candidates appreciate knowing what to budget for.', body);
}

function renderCharacterSection(p) {
  const priorityOptions = ['Ritual','Lodge tradition','Masonic Education','Administration','Meetings','Festive Board','Social Events','Charity','Support for new members'];
  const motivationOptions = ['Discussion and lectures on history and tradition','Respect and status accorded to each other','Helping members to be a "Better Man"','Discussion and lectures on symbolism and mystical aspects','Conviviality, friendship, and escape from everyday life','History of family connections in the Lodge','Strength of pre-existing friendships','Active support for charity'];
  const body = `
    ${field({ label: 'Lodge priorities, ranked', help: 'Rank these aspects of lodge life by importance, most important first. Use the arrows to reorder.', name: 'priorities', type: 'rank', value: p.priorities, options: priorityOptions })}
    <div class="profile-field">
      <label class="profile-field-label">Motivations this lodge satisfies</label>
      <div class="field-help">Which reasons for becoming a Freemason is your lodge well-placed to satisfy?</div>
      <div class="multi-choice">
        ${motivationOptions.map(o => `
          <label class="multi-choice-item">
            <input type="checkbox" name="motivationsServed" value="${escapeHtml(o)}" ${(p.motivationsServed || []).includes(o) ? 'checked' : ''} data-profile-field-multi>
            <span>${escapeHtml(o)}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
  return sectionCard('sec-character', 'Lodge character', 'This is where the matching tool earns its keep.', body);
}

function renderInterestsSection(p) {
  const interests = ['Daylight','Universities Scheme','Old Boys / Alumni','Round Table','Golf','Cricket','Football','Rugby','Aviation','Military','Emergency Services','Almoners','ADC','Other special interest'];
  const channels = ['Email','Post','Telephone','WhatsApp group','Facebook page','Instagram','Web site','Lodge magazine','Video conferences'];
  const body = `
    ${field({ label: 'Universities Scheme participant', help: 'Tick if your lodge is part of the UGLE Universities Scheme.', name: 'universitiesScheme', type: 'checkbox', value: p.universitiesScheme })}
    ${field({ label: 'Universities Scheme details', help: 'Which university is your lodge linked with?', name: 'universitiesSchemeNotes', type: 'text', value: p.universitiesSchemeNotes, placeholder: 'Anglia Ruskin University, Chelmsford' })}
    <div class="profile-field">
      <label class="profile-field-label">Special interests</label>
      <div class="field-help">Tick any that describe your lodge.</div>
      <div class="multi-choice">
        ${interests.map(o => `
          <label class="multi-choice-item">
            <input type="checkbox" name="interestTags" value="${escapeHtml(o)}" ${(p.interestTags || []).includes(o) ? 'checked' : ''} data-profile-field-multi>
            <span>${escapeHtml(o)}</span>
          </label>
        `).join('')}
      </div>
    </div>
    <h4 class="subsection-title">Communication</h4>
    <div class="profile-field">
      <label class="profile-field-label">Channels your lodge uses</label>
      <div class="field-help">Tick all that apply.</div>
      <div class="multi-choice">
        ${channels.map(o => `
          <label class="multi-choice-item">
            <input type="checkbox" name="communicationChannels" value="${escapeHtml(o)}" ${(p.communicationChannels || []).includes(o) ? 'checked' : ''} data-profile-field-multi>
            <span>${escapeHtml(o)}</span>
          </label>
        `).join('')}
      </div>
    </div>
    ${field({ label: 'Social events through the year', help: 'List the regular social events.', name: 'socialEvents', type: 'textarea', value: p.socialEvents, rows: 2 })}
  `;
  return sectionCard('sec-interests', 'Interests and communication', 'How your lodge stays in touch with members.', body);
}

function renderRoyalArchSection(p) {
  const body = `
    ${field({ label: 'Lodge Royal Arch Representative', help: 'Brother responsible for Royal Arch promotion.', name: 'raRepresentative', type: 'text', value: p.raRepresentative })}
    ${field({ label: 'Royal Arch Companions in the lodge', help: 'Number of members who are also Royal Arch Companions.', name: 'raCompanionsInLodge', type: 'number', value: p.raCompanionsInLodge, placeholder: '12' })}
    ${field({ label: 'Affiliated Royal Arch Chapter', help: 'Name of the Chapter, if any.', name: 'raChapterAffiliated', type: 'text', value: p.raChapterAffiliated })}
  `;
  return sectionCard('sec-royal-arch', 'Royal Arch', 'Most lodges have a Royal Arch link. Optional.', body);
}

function renderNarrativeSection(p) {
  const body = `
    ${field({ label: 'Background and history', help: 'How and when the lodge was formed, points of interest, Hall Stone Lodge status, special interests.', name: 'background', type: 'textarea', value: p.background, rows: 5 })}
    ${field({ label: 'Meeting details (narrative)', help: 'Describe the meeting pattern in your own words.', name: 'meetingDetailsNarrative', type: 'textarea', value: p.meetingDetailsNarrative, rows: 4 })}
    ${field({ label: 'Health of the lodge (narrative)', help: 'Be honest.', name: 'healthNarrative', type: 'textarea', value: p.healthNarrative, rows: 4 })}
    ${field({ label: 'Ritual, traditions, and administration (narrative)', help: 'Describe ritual variations, traditions, how the lodge makes decisions.', name: 'ritualNarrative', type: 'textarea', value: p.ritualNarrative, rows: 5 })}
    ${field({ label: 'Charity (narrative)', help: 'What does your lodge do for charity?', name: 'charityNarrative', type: 'textarea', value: p.charityNarrative, rows: 4 })}
    ${field({ label: 'Social events (narrative)', help: 'Ladies Festival, Gala Dinner, family events.', name: 'socialNarrative', type: 'textarea', value: p.socialNarrative, rows: 3 })}
    ${field({ label: 'Expectations of members (narrative)', help: 'Dress code, communication, payment of fees, attendance at LoI.', name: 'expectationsNarrative', type: 'textarea', value: p.expectationsNarrative, rows: 5 })}
    ${field({ label: 'Costs (narrative)', help: 'Walk through the costs above in your own words.', name: 'costsNarrative', type: 'textarea', value: p.costsNarrative, rows: 3 })}
    ${field({ label: 'Summary', help: 'A short paragraph capturing what makes your lodge distinctive.', name: 'summary', type: 'textarea', value: p.summary, rows: 3 })}
  `;
  return sectionCard('sec-narrative', 'Profile narrative', 'These sections form the candidate-facing profile.', body);
}

function renderMetadataSection(p) {
  const body = `
    ${field({ label: 'Profile prepared by', help: 'Your name and role. Usually the Secretary.', name: 'preparedBy', type: 'text', value: p.preparedBy, placeholder: 'John Smith, Secretary' })}
    ${field({ label: 'Approved by the lodge', help: 'Tick when the lodge has reviewed and approved this profile.', name: 'approvedByLodge', type: 'checkbox', value: p.approvedByLodge })}
    <div class="field-row">
      ${field({ label: 'Date approved', help: 'When the lodge formally approved this profile.', name: 'approvedDate', type: 'date', value: p.approvedDate })}
      ${field({ label: 'Review date', help: 'When this profile is next due for review.', name: 'reviewDate', type: 'date', value: p.reviewDate })}
    </div>
  `;
  return sectionCard('sec-metadata', 'Approval', 'Once the lodge has reviewed and approved this profile, mark it here.', body);
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
  const sectionFields = {
    meeting: ['meetingRulesComplete','meetingFrequency','timeOfDay','meetingTime','meetsAt'],
    membership: ['subscribingMembers','regularAttendance','ageDemographic','health'],
    officers: ['lightBluesInOffice','lightBluesTotal'],
    candidates: ['orfCount','currentlyAccepting','lastInitiation','progressionPace'],
    ritual: ['ritual','ritualQuality'],
    costs: ['joiningFee','annualSubscription','festiveBoardCost','averageAnnualCost'],
    character: ['priorities','motivationsServed'],
    interests: ['interestTags','communicationChannels'],
    narrative: ['background','meetingDetailsNarrative','healthNarrative','ritualNarrative','charityNarrative','expectationsNarrative','costsNarrative','summary'],
    metadata: ['preparedBy']
  };
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
      <div class="profile-progress">
        <div class="profile-progress-bar"><div class="profile-progress-fill" style="width:${completion.percent}%"></div></div>
        <div class="profile-progress-text"><strong>${completion.percent}%</strong> complete \u00b7 ${completion.filled} of ${completion.total} key fields filled in</div>
      </div>
      <div class="profile-layout">
        <aside class="profile-nav">
          <div class="profile-nav-title">Sections</div>
          ${[
            ['#sec-meeting', 'Meeting pattern', sectionCompletion(p, sectionFields.meeting)],
            ['#sec-membership', 'Membership & health', sectionCompletion(p, sectionFields.membership)],
            ['#sec-officers', 'Officers', sectionCompletion(p, sectionFields.officers)],
            ['#sec-candidates', 'Candidates & progression', sectionCompletion(p, sectionFields.candidates)],
            ['#sec-ritual', 'Ritual & education', sectionCompletion(p, sectionFields.ritual)],
            ['#sec-costs', 'Costs', sectionCompletion(p, sectionFields.costs)],
            ['#sec-character', 'Lodge character', sectionCompletion(p, sectionFields.character)],
            ['#sec-interests', 'Interests & communication', sectionCompletion(p, sectionFields.interests)],
            ['#sec-royal-arch', 'Royal Arch', { filled: 0, total: 3 }],
            ['#sec-narrative', 'Profile narrative', sectionCompletion(p, sectionFields.narrative)],
            ['#sec-metadata', 'Approval', sectionCompletion(p, sectionFields.metadata)],
          ].map(([href, label, sec]) => `
            <a href="${href}" class="profile-nav-item">
              <span class="profile-nav-label">${escapeHtml(label)}</span>
              <span class="profile-nav-count ${sec.filled === sec.total ? 'done' : sec.filled === 0 ? '' : 'partial'}">${sec.filled}/${sec.total}</span>
            </a>
          `).join('')}
        </aside>
        <form class="profile-form" id="profile-form" onsubmit="return false">
          ${renderMeetingSection(p)}
          ${renderMembershipSection(p)}
          ${renderOfficersSection(p)}
          ${renderCandidatesSection(p)}
          ${renderRitualSection(p)}
          ${renderCostsSection(p)}
          ${renderCharacterSection(p)}
          ${renderInterestsSection(p)}
          ${renderRoyalArchSection(p)}
          ${renderNarrativeSection(p)}
          ${renderMetadataSection(p)}
        </form>
      </div>
    </div>
  `;
}

function renderProfilePreview(lodge, p) {
  return `
    <div class="page profile-page profile-preview">
      <div class="profile-preview-header">
        <button class="btn-ghost btn-sm" data-action="toggle-preview">\u2190 Back to editor</button>
        <h2>Preview: how candidates will see this profile</h2>
      </div>
      <article class="profile-doc">
        <header class="profile-doc-header">
          <h1>${escapeHtml(lodge.name)} <span class="mono">L${escapeHtml(lodge.number)}</span></h1>
          <p>${escapeHtml(lodge.centre)} \u00b7 ${escapeHtml(lodge.region)}</p>
        </header>
        ${p.summary ? `<section><p class="lead">${escapeHtml(p.summary)}</p></section>` : ''}
        ${p.background ? `<section><h3>Background and history</h3><p>${escapeHtml(p.background)}</p></section>` : ''}
        <section>
          <h3>Meeting details</h3>
          <p><strong>Meets:</strong> ${escapeHtml(summarizeMeetingRules(p.meetingRules || []) || 'To be added')}${p.meetingTime ? ', at ' + escapeHtml(p.meetingTime) : ''}${p.meetsAt ? ', at ' + escapeHtml(p.meetsAt) : ''}.</p>
          ${p.meetingDetailsNarrative ? `<p>${escapeHtml(p.meetingDetailsNarrative)}</p>` : ''}
        </section>
        ${p.healthNarrative ? `<section><h3>Health of the lodge</h3><p>${escapeHtml(p.healthNarrative)}</p></section>` : ''}
        ${p.ritualNarrative ? `<section><h3>Ritual, traditions and administration</h3><p>${escapeHtml(p.ritualNarrative)}</p></section>` : ''}
        ${p.charityNarrative ? `<section><h3>Charity</h3><p>${escapeHtml(p.charityNarrative)}</p></section>` : ''}
        ${p.socialNarrative ? `<section><h3>Social events</h3><p>${escapeHtml(p.socialNarrative)}</p></section>` : ''}
        ${p.expectationsNarrative ? `<section><h3>Expectations</h3><p>${escapeHtml(p.expectationsNarrative)}</p></section>` : ''}
        <section>
          <h3>Costs</h3>
          ${p.joiningFee ? `<p><strong>Joining fee:</strong> \u00a3${escapeHtml(p.joiningFee)}</p>` : ''}
          ${p.annualSubscription ? `<p><strong>Annual subscription:</strong> \u00a3${escapeHtml(p.annualSubscription)}</p>` : ''}
          ${p.festiveBoardCost ? `<p><strong>Festive Board:</strong> \u00a3${escapeHtml(p.festiveBoardCost)} per meeting</p>` : ''}
          ${p.averageAnnualCost ? `<p><strong>Average annual cost:</strong> \u00a3${escapeHtml(p.averageAnnualCost)}</p>` : ''}
          ${p.costsNarrative ? `<p>${escapeHtml(p.costsNarrative)}</p>` : ''}
        </section>
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
  scheduleProfileSave(State.currentLodgeId);
});

on('change', '[data-profile-field-bool]', (e, el) => {
  if (!State.editingProfile) return;
  State.editingProfile[el.name] = el.checked;
  scheduleProfileSave(State.currentLodgeId);
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
});

on('click', '[data-rank-up]', (e, el) => {
  if (!State.editingProfile) return;
  const list = el.closest('.rank-list');
  const name = list.dataset.name;
  const idx = parseInt(el.dataset.rankUp);
  if (idx <= 0) return;
  const arr = State.editingProfile[name] || [];
  [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
  State.editingProfile[name] = arr;
  scheduleProfileSave(State.currentLodgeId);
  render();
});

on('click', '[data-rank-down]', (e, el) => {
  if (!State.editingProfile) return;
  const list = el.closest('.rank-list');
  const name = list.dataset.name;
  const idx = parseInt(el.dataset.rankDown);
  const arr = State.editingProfile[name] || [];
  if (idx >= arr.length - 1) return;
  [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]];
  State.editingProfile[name] = arr;
  scheduleProfileSave(State.currentLodgeId);
  render();
});

on('click', '[data-action="toggle-preview"]', () => {
  State.profilePreview = !State.profilePreview;
  render();
});

on('click', '[data-back]', (e, el) => {
  navigate('lodge', { lodgeId: el.dataset.back });
});

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
