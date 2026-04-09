import { useState } from 'react'
import { sameDay, isBetween, getHoliday, toKey } from '../constants'

function Ripple({ x, y }) {
  return (
    <div className="ripple-wrap">
      <span className="ripple-circle" style={{ left: x, top: y }} />
    </div>
  )
}

export default function DayCell({
  date, current, rangeStart, rangeEnd, hovered,
  today, notes, events, themeColor, idx, searchQuery,
  onClick, onMouseEnter, onMouseLeave,
}) {
  const [ripple, setRipple] = useState(null)
  const [showTip, setShowTip] = useState(false)

  const dk = toKey(date)
  const dow = (date.getDay() + 6) % 7
  const isWeekend = dow >= 5
  const isStart = rangeStart && sameDay(date, rangeStart)
  const isEnd   = rangeEnd   && sameDay(date, rangeEnd)
  const inRange = isBetween(date, rangeStart, rangeEnd)
  const isHoverRange = !rangeEnd && rangeStart && hovered && isBetween(date, rangeStart, hovered)
  const isToday = sameDay(date, today)
  const hasNote = !!notes[dk]
  const holiday = getHoliday(date)
  const dayEvents = (events || []).filter(ev => ev.date === dk)
  const isSearched = searchQuery && current && dk.includes(searchQuery)

  const classes = [
    'day-cell',
    !current ? 'outside-month' : '',
    isToday && current ? 'is-today' : '',
    isWeekend && current ? 'is-weekend' : '',
    isStart ? 'range-start' : '',
    isEnd ? 'range-end' : '',
    inRange && !isStart && !isEnd ? 'range-in' : '',
    isHoverRange && !isStart ? 'range-hover' : '',
  ].filter(Boolean).join(' ')

  let extraStyle = {}
  if ((inRange || isHoverRange) && !isStart && !isEnd) {
    const isFirstInRow = idx % 7 === 0
    const isLastInRow  = idx % 7 === 6
    extraStyle.borderRadius = isFirstInRow
      ? '9px 0 0 9px'
      : isLastInRow ? '0 9px 9px 0' : '0'
  }
  if (isSearched && !isStart && !isEnd) {
    extraStyle.background = 'rgba(0,0,0,.06)'
  }

  const dotColor = isStart || isEnd ? 'rgba(255,255,255,.7)' : themeColor
  const starColor = isStart || isEnd ? 'rgba(255,255,255,.7)' : themeColor

  const tipParts = [
    holiday,
    hasNote ? '📝 Note' : null,
    dayEvents.length ? `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : null,
  ].filter(Boolean)

  const handleClick = e => {
    if (!current) return
    const rect = e.currentTarget.getBoundingClientRect()
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTimeout(() => setRipple(null), 560)
    onClick(date, current)
  }

  const handleEnter = () => {
    onMouseEnter(date)
    if (tipParts.length && current) setShowTip(true)
  }
  const handleLeave = () => {
    onMouseLeave()
    setShowTip(false)
  }

  return (
    <div
      className={classes}
      style={extraStyle}
      onClick={handleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {ripple && <Ripple x={ripple.x} y={ripple.y} />}

      {isToday && current && !isStart && !isEnd && (
        <div className="today-ring" />
      )}

      <span style={{ position: 'relative', zIndex: 1, fontWeight: isToday ? 700 : 400 }}>
        {date.getDate()}
      </span>

      {dayEvents.length > 0 && current && (
        <div className="event-bar">
          {dayEvents.slice(0, 4).map((ev, i) => (
            <span
              key={i}
              className="event-bar-seg"
              style={{ background: ev.color || themeColor, opacity: isStart || isEnd ? 0.6 : 1 }}
            />
          ))}
        </div>
      )}

      {hasNote && !dayEvents.length && (
        <span className="day-dot" style={{ background: dotColor }} />
      )}

      {holiday && current && (
        <span className="hstar" style={{ color: starColor }}>★</span>
      )}

      {showTip && (
        <div className="day-tooltip">{tipParts.join(' · ')}</div>
      )}
    </div>
  )
}
