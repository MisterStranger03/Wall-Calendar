import { useState } from 'react'
import { EVENT_COLORS, EVENT_CATEGORIES, fmtFull, getHoliday } from '../constants'

export default function EventModal({ ev: initEv, themeColor, themeLight, themeText, onSave, onDelete, onClose }) {
  const isNew = !initEv?.id
  const [ev, setEv] = useState({
    title: '', date: '', time: '09:00', color: themeColor,
    desc: '', allDay: true, category: 'personal',
    ...initEv,
  })
  const set = (k, v) => setEv(p => ({ ...p, [k]: v }))

  const holiday = ev.date ? getHoliday(new Date(ev.date + 'T12:00:00')) : null

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="modal-title">{isNew ? 'New Event' : 'Edit Event'}</div>
        <div className="modal-subtitle">
          {ev.date && new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {holiday && <span className="modal-holiday"> · {holiday}</span>}
        </div>

        <div className="m-field">
          <div className="m-label">Title</div>
          <input autoFocus className="m-inp" placeholder="Event name…"
            value={ev.title} onChange={e => set('title', e.target.value)} />
        </div>

        <div className="m-row">
          <div className="m-field">
            <div className="m-label">Date</div>
            <input className="m-inp" type="date" value={ev.date}
              onChange={e => set('date', e.target.value)} />
          </div>
          {!ev.allDay && (
            <div className="m-field">
              <div className="m-label">Time</div>
              <input className="m-inp" type="time" value={ev.time || '09:00'}
                onChange={e => set('time', e.target.value)} />
            </div>
          )}
        </div>

        <div className="m-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={ev.allDay} onChange={e => set('allDay', e.target.checked)}
              style={{ accentColor: themeColor, width: 15, height: 15, cursor: 'pointer' }} />
            All-day event
          </label>
        </div>

        <div className="m-field">
          <div className="m-label">Category</div>
          <div className="cat-pills">
            {EVENT_CATEGORIES.map(c => (
              <button key={c}
                className={`cat-pill ${ev.category === c ? 'active' : ''}`}
                style={ev.category === c ? { background: themeLight, borderColor: themeColor, color: themeText } : {}}
                onClick={() => set('category', c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="m-field">
          <div className="m-label">Color</div>
          <div className="color-row">
            {EVENT_COLORS.map(c => (
              <div key={c} className={`ev-color-dot ${ev.color === c ? 'active' : ''}`}
                style={{ background: c, borderColor: ev.color === c ? '#000' : 'transparent' }}
                onClick={() => set('color', c)} />
            ))}
          </div>
        </div>

        <div className="m-field">
          <div className="m-label">Notes</div>
          <textarea className="m-inp m-ta" placeholder="Description or notes…"
            value={ev.desc || ''} onChange={e => set('desc', e.target.value)} />
        </div>

        <div className="modal-actions">
          {!isNew && (
            <button className="mbtn mbtn-danger" onClick={() => onDelete(ev.id)}>Delete</button>
          )}
          <button className="mbtn mbtn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="mbtn mbtn-primary"
            style={{ background: themeColor }}
            disabled={!ev.title || !ev.date}
            onClick={() => { if (ev.title && ev.date) onSave(ev) }}
          >
            {isNew ? 'Add Event' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
