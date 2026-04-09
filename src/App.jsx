import { useState, useEffect, useMemo, useCallback } from 'react'
import DayCell from './components/DayCell'
import EventModal from './components/EventModal'
import NoteModal from './components/NoteModal'
import {
  MONTHS, MONTHS_SHORT, DAYS, DAYS_FULL,
  HERO_IMAGES, THEMES, WEATHER, MOTIVATIONAL,
  sameDay, getDaysInMonth, getWeekDays, getHoliday,
  toKey, fmtShort, fmtFull, EVENT_COLORS,
} from './constants'

function usePersist(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init }
    catch { return init }
  })
  const set = useCallback(v => {
    setVal(v)
    try { localStorage.setItem(key, JSON.stringify(typeof v === 'function' ? v(val) : v)) }
    catch {}
  }, [key])
  return [val, set]
}

function applyTheme(t) {
  const r = document.documentElement
  r.style.setProperty('--tp', t.p)
  r.style.setProperty('--ta', t.a)
  r.style.setProperty('--tl', t.l)
  r.style.setProperty('--tt', t.t)
}

export default function App() {
  const today = new Date()

  const [themeKey, setThemeKey] = usePersist('wc-theme', 'ocean')
  const [notes,    setNotes]    = usePersist('wc-notes', {})
  const [mNotes,   setMNotes]   = usePersist('wc-mnotes', {})
  const [events,   setEvents]   = usePersist('wc-events', [])

  const [year,       setYear]       = useState(today.getFullYear())
  const [month,      setMonth]      = useState(today.getMonth())
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd,   setRangeEnd]   = useState(null)
  const [hovered,    setHovered]    = useState(null)
  const [modal,      setModal]      = useState(null) 
  const [animDir,    setAnimDir]    = useState('next')
  const [animKey,    setAnimKey]    = useState(0)
  const [imgLoaded,  setImgLoaded]  = useState(false)
  const [search,     setSearch]     = useState('')
  const [time,       setTime]       = useState(new Date())
  const [showWknd,   setShowWknd]   = useState(true)
  const [focusMode,  setFocusMode]  = useState(false)

  const theme   = THEMES[themeKey]
  const monthKey = `${year}-${month}`
  const days    = getDaysInMonth(year, month)

  useEffect(() => applyTheme(theme), [theme])

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const navigate = dir => {
    setAnimDir(dir)
    setAnimKey(k => k + 1)
    setImgLoaded(false)
    setRangeStart(null)
    setRangeEnd(null)
    if (dir === 'next') {
      if (month === 11) { setMonth(0); setYear(y => y + 1) }
      else setMonth(m => m + 1)
    } else {
      if (month === 0) { setMonth(11); setYear(y => y - 1) }
      else setMonth(m => m - 1)
    }
  }

  const goToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setAnimKey(k => k + 1)
  }

  // ── Notes ──
  const saveNote = (key, text) => {
    setNotes(prev => ({ ...prev, [key]: text }))
  }
  const deleteNote = key => {
    setNotes(prev => { const u = { ...prev }; delete u[key]; return u })
  }

  // ── Events ──
  const saveEvent = ev => {
    setEvents(prev =>
      ev.id ? prev.map(e => e.id === ev.id ? ev : e) : [...prev, { ...ev, id: Date.now().toString() }]
    )
    setModal(null)
  }
  const deleteEvent = id => {
    setEvents(prev => prev.filter(e => e.id !== id))
    setModal(null)
  }

  // ── Day click logic ──
  const handleDayClick = (date, current) => {
    if (!current) return
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date)
      setRangeEnd(null)
    } else {
      if (sameDay(date, rangeStart)) {
        setModal({ type: 'day', date })
      } else {
        setRangeEnd(date)
      }
    }
  }

  const filteredEvents = useMemo(() => {
    if (!search) return events
    const q = search.toLowerCase()
    return events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.date.includes(q) ||
      (e.desc || '').toLowerCase().includes(q) ||
      (e.category || '').includes(q)
    )
  }, [events, search])

  const currentMonthNotes = useMemo(() =>
    Object.entries(notes).filter(([k, v]) => {
      if (!v) return false
      const d = new Date(k.split('__')[0] + 'T12:00:00')
      return d.getFullYear() === year && d.getMonth() === month
    }).sort(([a], [b]) => a.localeCompare(b)),
    [notes, year, month]
  )

  const fmtRange = () => {
    if (!rangeStart) return null
    if (!rangeEnd) return fmtShort(rangeStart)
    const n = Math.round(Math.abs(rangeEnd - rangeStart) / 86400000) + 1
    return `${fmtShort(rangeStart)} → ${fmtShort(rangeEnd)} · ${n} day${n > 1 ? 's' : ''}`
  }

  const weekDays = useMemo(() => {
    const base = rangeStart || (today.getMonth() === month && today.getFullYear() === year ? today : new Date(year, month, 1))
    return getWeekDays(base)
  }, [rangeStart, year, month])

  const agendaItems = useMemo(() => {
    const out = []
    for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) {
      const d = new Date(year, month, i)
      const dk = toKey(d)
      const dayEvs = filteredEvents.filter(e => e.date === dk)
      const h = getHoliday(d)
      const n = notes[dk]
      if (dayEvs.length || h) out.push({ d, dk, dayEvs, holiday: h, note: n })
    }
    return out.slice(0, 12)
  }, [year, month, filteredEvents, notes])

  const weather = WEATHER[month]
  const quote   = MOTIVATIONAL[today.getDate() % MOTIVATIONAL.length]
  const mn      = MONTHS[month]
  const mid     = Math.ceil(mn.length / 2)

  return (
    <div id="app-root">

      <div id="top-bar">
          <div className="top-bar-left">
  <div>
    <div className="app-title">Wall Calendar</div>
    <div className="app-subtitle">{quote}</div>
  </div>

  <div className="date-jumper">
    <select
      className="dj-select"
      value={month}
      onChange={e => {
        setMonth(parseInt(e.target.value))
        setAnimKey(k => k + 1)
        setImgLoaded(false)
      }}
    >
      {MONTHS.map((m, i) => (
        <option key={i} value={i}>{m}</option>
      ))}
    </select>

    <select
      className="dj-select"
      value={year}
      onChange={e => {
        setYear(parseInt(e.target.value))
        setAnimKey(k => k + 1)
        setImgLoaded(false)
      }}
    >
      {Array.from({ length: 21 }, (_, i) => today.getFullYear() - 10 + i).map(y => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>

    <button
      className="dj-today-dot"
      title="Jump to today"
      onClick={() => {
        setYear(today.getFullYear())
        setMonth(today.getMonth())
        setAnimKey(k => k + 1)
        setImgLoaded(false)
      }}
    >
      ●
    </button>
  </div>
        
          



        </div>

        <div className="top-bar-right">
          <div id="live-clock">
            <div className="clock-time">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </div>
            <div className="clock-date">
              {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-inp"
              placeholder="Search events…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="theme-dots">
            {Object.entries(THEMES).map(([key, t]) => (
              <div
                key={key}
                className={`theme-dot ${themeKey === key ? 'active' : ''}`}
                title={t.name}
                style={{ background: t.p }}
                onClick={() => setThemeKey(key)}
              />
            ))}
          </div>

          <button className="tb-btn" onClick={goToday}>Today</button>
          <button
            className={`tb-btn ${!showWknd ? 'primary' : ''}`}
            onClick={() => setShowWknd(v => !v)}
          >
            {showWknd ? 'Hide weekends' : 'Show weekends'}
          </button>
          <button
            className={`tb-btn ${focusMode ? 'primary' : ''}`}
            onClick={() => setFocusMode(v => !v)}
          >
            {focusMode ? 'Exit focus' : 'Focus mode'}
          </button>
          <button
            className="tb-btn primary"
            onClick={() => setModal({ type: 'event', ev: { date: toKey(today), color: theme.p, allDay: true } })}
          >
            + Event
          </button>
        </div>
      </div>

      <div id="calendar-card">

        <div id="hero-section">
          <img
            id="hero-img"
            key={HERO_IMAGES[month]}
            src={HERO_IMAGES[month]}
            alt={mn}
            style={{ opacity: imgLoaded ? 1 : 0.3 }}
            onLoad={() => setImgLoaded(true)}
          />

          <svg
            id="hero-shape"
            viewBox="0 0 900 280"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >

            <polygon
              points="0,280 90,150 0,150"
              fill={theme.p}
              opacity="1"
            />
            <polygon
              points="0,280 90,150 60,280"
              fill={theme.a}
              opacity="0.85"
            />
            <polygon
              points="580,280 680,150 900,150 900,280"
              fill={theme.p}
            />
          </svg>

          <div
            style={{
              position: 'absolute', bottom: 0, right: 0,
              padding: '12px 28px 18px 60px',
              textAlign: 'right',
              clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 0 100%)',
              minWidth: 210,
            }}
          >
            <div className="hero-year">{year}</div>
            <div className="hero-month">{mn.toUpperCase()}</div>
          </div>

          <button
            className="hero-nav hero-nav-prev"
            onClick={() => navigate('prev')}
            aria-label="Previous month"
          >‹</button>
          <button
            className="hero-nav hero-nav-next"
            onClick={() => navigate('next')}
            aria-label="Next month"
          >›</button>
        </div>

        <div
          id="grid-area"
          key={animKey}
          className={animDir === 'next' ? 'slide-next' : 'slide-prev'}
        >
          {!focusMode && (
            <div id="notes-sidebar">
              <div className="notes-heading">Notes</div>

              <div className="notes-lines" style={{ position: 'relative', flex: 1 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="note-line" />
                ))}
                <textarea
                  className="notes-textarea"
                  placeholder={`${mn} notes…`}
                  value={mNotes[monthKey] || ''}
                  onChange={e => setMNotes(prev => ({ ...prev, [monthKey]: e.target.value }))}
                  style={{ height: '100%' }}
                />
              </div>

              {currentMonthNotes.length > 0 && (
                <>
                  <div className="notes-heading" style={{ marginTop: 6 }}>Day notes</div>
                  <div className="day-note-chips">
                    {currentMonthNotes.map(([k, v]) => {
                      const dk = k.split('__')[0]
                      const d  = new Date(dk + 'T12:00:00')
                      const isRange = k.includes('__')
                      const d2 = isRange ? new Date(k.split('__')[1] + 'T12:00:00') : null
                      return (
                        <div
                          key={k}
                          className="day-note-chip"
                          onClick={() => setModal({ type: 'note', key: k, text: v })}
                        >
                          <strong>
                            {d.getDate()} {MONTHS[d.getMonth()].slice(0, 3)}
                            {isRange && d2 && ` → ${d2.getDate()} ${MONTHS[d2.getMonth()].slice(0, 3)}`}
                          </strong>
                          {v.slice(0, 38)}{v.length > 38 ? '…' : ''}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          <div id="cal-grid">
            <div className="dow-row">
              {DAYS
                .filter((_, i) => showWknd || i < 5)
                .map((d, i) => (
                  <div
                    key={d}
                    className={`dow-cell ${i >= 5 ? 'weekend' : ''}`}
                  >
                    {d}
                  </div>
                ))
              }
            </div>

            <div
              className="days-grid"
              style={{ gridTemplateColumns: `repeat(${showWknd ? 7 : 5}, 1fr)` }}
            >
              {days
                .filter((_, i) => showWknd || i % 7 < 5)
                .map(({ date, current }, i) => (
                  <DayCell
                    key={toKey(date)}
                    date={date}
                    current={current}
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    hovered={hovered}
                    today={today}
                    notes={notes}
                    events={filteredEvents}
                    themeColor={theme.p}
                    idx={i}
                    searchQuery={search}
                    onClick={handleDayClick}
                    onMouseEnter={setHovered}
                    onMouseLeave={() => setHovered(null)}
                  />
                ))
              }
            </div>
          </div>
        </div>

        <div id="status-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {rangeStart ? (
              <>
                <div className="range-pill">📅 {fmtRange()}</div>
                {rangeStart && rangeEnd && (
                  <button
                    className="status-action"
                    onClick={() => {
                      const k = `${toKey(rangeStart)}__${toKey(rangeEnd)}`
                      setModal({ type: 'note', key: k, text: notes[k] || '' })
                    }}
                  >
                    ✏️ Note for range
                  </button>
                )}
                {rangeStart && rangeEnd && (
                  <button
                    className="status-action"
                    onClick={() => setModal({
                      type: 'event',
                      ev: { date: toKey(rangeStart), endDate: toKey(rangeEnd), color: theme.p, allDay: true }
                    })}
                  >
                    + Event for range
                  </button>
                )}
                <button className="status-action" onClick={() => { setRangeStart(null); setRangeEnd(null) }}>
                  ✕ Clear
                </button>
              </>
            ) : (
              <span className="status-hint">
                Click a day to start · click another to end range · same day twice → notes & events
              </span>
            )}
          </div>
          <div className="legend">
            <span><span style={{ color: theme.p }}>★</span> Holiday</span>
            <span>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: theme.p, verticalAlign: 'middle', marginRight: 3 }} />
              Note
            </span>
            <span>
              <span style={{ display: 'inline-block', width: 12, height: 3, borderRadius: 2, background: theme.p, verticalAlign: 'middle', marginRight: 3 }} />
              Event
            </span>
          </div>
        </div>
      </div>

      <div id="features-panel">

        <div className="feature-card">
          <div className="feature-card-title">
             This Week
          </div>
          <div className="week-row">
            {weekDays.map((d, i) => {
              const dk = toKey(d)
              const isWknd = i >= 5
              const isTd   = sameDay(d, today)
              const wkEvs  = filteredEvents.filter(e => e.date === dk)
              return (
                <div key={i} className="week-day-col">
                  <div className={`week-day-hdr ${isWknd ? 'wknd' : ''}`}>{DAYS[i]}</div>
                  <div
                    className={`week-day-num ${isTd ? 'is-today-wk' : ''}`}
                    style={isTd ? { background: theme.p } : {}}
                    onClick={() => setModal({ type: 'day', date: d })}
                  >
                    {d.getDate()}
                  </div>
                  {wkEvs.slice(0, 2).map(ev => (
                    <div
                      key={ev.id}
                      className="week-ev"
                      style={{ background: ev.color + '22', color: ev.color, cursor: 'pointer' }}
                      onClick={() => setModal({ type: 'event', ev })}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-card-title">
             {MONTHS[month]} Highlights
            <button
              style={{
                marginLeft: 'auto', padding: '3px 10px', borderRadius: 7,
                background: theme.l, border: `1px solid ${theme.p}44`,
                color: theme.t, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onClick={() => setModal({ type: 'event', ev: { date: toKey(today), color: theme.p, allDay: true } })}
            >+ Add</button>
          </div>
          <div className="agenda-list">
            {agendaItems.length === 0 ? (
              <div className="no-events-msg">No events this month yet</div>
            ) : agendaItems.map(({ d, dk, dayEvs, holiday }) => (
              <div key={dk}>
                {holiday && (
                  <div className="agenda-item">
                    <div className="agenda-dot" style={{ background: theme.p }} />
                    <div className="agenda-content">
                      <div className="agenda-title">{holiday}</div>
                      <div className="agenda-meta">{fmtShort(d)}</div>
                    </div>
                  </div>
                )}
                {dayEvs.map(ev => (
                  <div key={ev.id} className="agenda-item" onClick={() => setModal({ type: 'event', ev })}>
                    <div className="agenda-dot" style={{ background: ev.color || theme.p }} />
                    <div className="agenda-content">
                      <div className="agenda-title">{ev.title}</div>
                      <div className="agenda-meta">
                        {fmtShort(d)} {ev.time && !ev.allDay ? `· ${ev.time}` : '· All day'} · {ev.category || 'personal'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-card-title"> Year at a Glance — {year}</div>
          <div className="year-grid">
            {MONTHS.map((_, mi) => {
              const isThis = year === today.getFullYear() && mi === today.getMonth()
              const isSelected = mi === month
              const mDays = getDaysInMonth(year, mi)
              return (
                <div
                  key={mi}
                  className={`yr-mini ${isThis || isSelected ? 'this-mo' : ''}`}
                  style={isSelected ? { borderColor: theme.p, background: theme.l } : {}}
                  onClick={() => { setMonth(mi); setAnimKey(k => k + 1) }}
                >
                  <div className="yr-mini-name">{MONTHS_SHORT[mi]}</div>
                  <div className="yr-mini-dots">
                    {mDays.map(({ date: d, current: cur }, i) => {
                      const dk2 = toKey(d)
                      const hasEv = filteredEvents.some(e => e.date === dk2)
                      const isTd  = sameDay(d, today)
                      return (
                        <div
                          key={i}
                          className="yr-mini-d"
                          style={{
                            background: !cur ? 'transparent'
                              : isTd ? theme.p
                              : hasEv ? theme.l
                              : 'var(--border)',
                            border: isTd ? `1px solid ${theme.p}` : '',
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-card-title"> Seasonal Weather · {MONTHS[month]}</div>
          <div className="weather-grid">
            {[
              { mo: month === 0 ? 11 : month - 1 },
              { mo: month },
              { mo: month === 11 ? 0 : month + 1 },
            ].map(({ mo: mi }) => {
              const w = WEATHER[mi]
              return (
                <div key={mi} className="weather-tile"
                  style={mi === month ? { borderColor: theme.p, background: theme.l } : {}}>
                  <div className="weather-icon">{w.icon}</div>
                  <div className="weather-month">{MONTHS_SHORT[mi]}</div>
                  <div className="weather-temp" style={mi === month ? { color: theme.p } : {}}>{w.temp}°C</div>
                  <div className="weather-desc">{w.desc}</div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { label: 'Events', value: filteredEvents.filter(e => {
                const d = new Date(e.date + 'T12:00:00')
                return d.getFullYear() === year && d.getMonth() === month
              }).length },
              { label: 'Notes', value: currentMonthNotes.length },
              { label: 'Days left', value: (() => {
                const last = new Date(year, month + 1, 0).getDate()
                const cur  = today.getMonth() === month && today.getFullYear() === year
                  ? today.getDate() : 0
                return Math.max(0, last - cur)
              })() },
            ].map(({ label, value }) => (
              <div key={label} style={{
                textAlign: 'center', padding: '10px 6px',
                background: 'var(--bg)', borderRadius: 9,
                border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: theme.p, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--text-muted)', marginTop: 3, letterSpacing: '.8px', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal?.type === 'day' && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div className="modal-box">
            <div className="modal-title">{fmtFull(modal.date)}</div>
            <div className="modal-subtitle" style={{ marginBottom: 14 }}>
              {getHoliday(modal.date) && (
                <span className="modal-holiday">{getHoliday(modal.date)} · </span>
              )}
              {filteredEvents.filter(e => e.date === toKey(modal.date)).length} event(s) ·{' '}
              {notes[toKey(modal.date)] ? 'Has note' : 'No note'}
            </div>

            {filteredEvents.filter(e => e.date === toKey(modal.date)).map(ev => (
              <div
                key={ev.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 9,
                  background: ev.color + '18', marginBottom: 7, cursor: 'pointer',
                  border: `1px solid ${ev.color}33`,
                }}
                onClick={() => setModal({ type: 'event', ev })}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{ev.title}</span>
                {ev.time && !ev.allDay && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ev.time}</span>
                )}
                {ev.allDay && (
                  <span style={{ fontSize: 10, color: theme.p, fontWeight: 600 }}>All day</span>
                )}
              </div>
            ))}

            {notes[toKey(modal.date)] && (
              <div
                style={{
                  padding: '9px 12px', borderRadius: 9,
                  background: 'var(--bg)', borderLeft: `3px solid ${theme.p}`,
                  fontSize: 12.5, color: 'var(--text-secondary)', fontStyle: 'italic',
                  cursor: 'pointer', marginBottom: 7,
                }}
                onClick={() => setModal({ type: 'note', key: toKey(modal.date), text: notes[toKey(modal.date)] })}
              >
                📝 {notes[toKey(modal.date)].slice(0, 80)}…
              </div>
            )}

            <div className="modal-actions">
              <button className="mbtn mbtn-ghost" onClick={() => setModal(null)}>Close</button>
              <button className="mbtn mbtn-ghost"
                onClick={() => setModal({ type: 'note', key: toKey(modal.date), text: notes[toKey(modal.date)] || '' })}>
                {notes[toKey(modal.date)] ? '✏️ Edit note' : '📝 Add note'}
              </button>
              <button
                className="mbtn mbtn-primary"
                style={{ background: theme.p }}
                onClick={() => setModal({ type: 'event', ev: { date: toKey(modal.date), color: theme.p, allDay: true } })}
              >
                + New event
              </button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'note' && (
        <NoteModal
          noteKey={modal.key}
          noteText={modal.text}
          themeColor={theme.p}
          themeLight={theme.l}
          themeText={theme.t}
          onChange={text => setModal(m => ({ ...m, text }))}
          onSave={saveNote}
          onDelete={deleteNote}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'event' && (
        <EventModal
          ev={modal.ev}
          themeColor={theme.p}
          themeLight={theme.l}
          themeText={theme.t}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
