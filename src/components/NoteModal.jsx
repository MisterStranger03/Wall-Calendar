import { getHoliday, fmtFull, MONTHS } from '../constants'

export default function NoteModal({ noteKey, noteText, themeColor, themeLight, themeText, onSave, onDelete, onClose, onChange }) {
  const dateStr = noteKey?.split('__')[0]
  const d = dateStr ? new Date(dateStr + 'T12:00:00') : null
  const isRange = noteKey?.includes('__')
  const d2 = isRange ? new Date(noteKey.split('__')[1] + 'T12:00:00') : null
  const holiday = d ? getHoliday(d) : null

  const title = isRange
    ? `${d?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → ${d2?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : d ? fmtFull(d) : ''

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="modal-title">{title}</div>
        <div className="modal-subtitle">
          {holiday && <span className="modal-holiday">{holiday} · </span>}
          {noteText ? 'Edit note' : 'Add a note'}
        </div>

        <div className="m-field">
          <textarea
            autoFocus
            className="m-inp m-ta"
            placeholder="What's on your mind…"
            value={noteText || ''}
            onChange={e => onChange(e.target.value)}
            style={{ minHeight: 120 }}
          />
        </div>

        <div className="modal-actions">
          {noteText && (
            <button className="mbtn mbtn-danger" onClick={() => { onDelete(noteKey); onClose() }}>Delete</button>
          )}
          <button className="mbtn mbtn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="mbtn mbtn-primary"
            style={{ background: themeColor }}
            onClick={() => { onSave(noteKey, noteText || ''); onClose() }}
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  )
}
