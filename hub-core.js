/* Shared, dependency-free validation and export logic. Browser + Node tests. */
(function (root) {
  'use strict';
  const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function safeUrl(value) {
    if (!value) return '';
    try { const u = new URL(/^https?:\/\//i.test(value) ? value : 'https://' + value); return /^https?:$/.test(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; }
  }
  function minutes(value) {
    const m = String(value || '').trim().match(/^(\d{1,2})[:.](\d{2})\s*(AM|PM)?$/i);
    if (!m) return NaN;
    let h = Number(m[1]), n = Number(m[2]);
    if (n > 59 || h > (m[3] ? 12 : 23) || (m[3] && h < 1)) return NaN;
    if (m[3]) h = h % 12 + (m[3].toUpperCase() === 'PM' ? 12 : 0);
    // Explicit zero-padded HH:mm is always 24 hour. Only legacy unpadded daytime labels use this inference.
    else if (m[1].length === 1 && h >= 1 && h <= 6) h += 12;
    return h * 60 + n;
  }
  const escapeIcs = value => String(value ?? '').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  function foldIcs(line) {
    let out = '', count = 0;
    for (const char of line) {
      const size = new TextEncoder().encode(char).length;
      if (count + size > 75) { out += '\r\n '; count = 1; }
      out += char; count += size;
    }
    return out;
  }
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  function parseDate(value) {
    if (!datePattern.test(value || '')) throw new Error('Choose valid term dates.');
    const date = new Date(value + 'T00:00:00Z');
    if (!Number.isFinite(+date) || date.toISOString().slice(0,10) !== value) throw new Error('Invalid term date.');
    return date;
  }
  function calendar(routine, start, end, now = new Date()) {
    const first = parseDate(start), last = parseDate(end);
    if (last < first || last - first > 366 * 864e5) throw new Error('Term end must be within one year after term start.');
    if (!routine.entries?.length) throw new Error('Add at least one class first.');
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const codes = ['SU','MO','TU','WE','TH','FR','SA'];
    const stamp = date => date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const until = stamp(new Date(+last + 18 * 36e5 - 1000)); // Dhaka local 23:59:59 (UTC+06)
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Classroom Hub//Personal Routine//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH', 'X-WR-CALNAME:' + escapeIcs(routine.title || 'My Routine'), 'X-WR-TIMEZONE:Asia/Dhaka'];
    routine.entries.forEach((e, index) => {
      const day = days.indexOf(e.day), s = minutes(e.startTime), t = minutes(e.endTime);
      if (day < 0 || !Number.isFinite(s) || !Number.isFinite(t) || t <= s) throw new Error('Fix invalid day or time for ' + (e.courseCode || 'class ' + (index+1)));
      const date = new Date(+first + ((day - first.getUTCDay() + 7) % 7) * 864e5);
      if (date > last) return;
      lines.push('BEGIN:VEVENT','UID:' + escapeIcs('routine-' + (e.id || index) + '@classroomhub'), 'DTSTAMP:' + stamp(now), 'DTSTART:' + stamp(new Date(+date + (s - 360)*6e4)), 'DTEND:' + stamp(new Date(+date + (t - 360)*6e4)), 'RRULE:FREQ=WEEKLY;UNTIL=' + until + ';BYDAY=' + codes[day], 'SUMMARY:' + escapeIcs([e.courseCode,e.courseName].filter(Boolean).join(' - ')), 'LOCATION:' + escapeIcs(e.room || ''), 'DESCRIPTION:' + escapeIcs([e.teacher && 'Teacher: '+e.teacher,e.notes].filter(Boolean).join('\n')), 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.map(foldIcs).join('\r\n') + '\r\n';
  }
  const forbidden = /(?:password|pwdhash|token|apikey|secret|webhook)/i;
  function publicValue(value, depth = 0) {
    if (depth > 25) throw new Error('Content is too deeply nested.');
    if (Array.isArray(value)) return value.map(v => publicValue(v,depth+1));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([k]) => !forbidden.test(k) && !['__proto__','prototype','constructor'].includes(k)).map(([k,v]) => [k,publicValue(v,depth+1)]));
    return value;
  }
  const readJSON = (value, fallback = '{}') => { try { return JSON.parse(value || fallback); } catch { return JSON.parse(fallback); } };
  const api = {readJSON,html,safeUrl,minutes,escapeIcs,foldIcs,calendar,publicValue};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HubCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
