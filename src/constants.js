export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
export const DAYS_FULL = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export const sameDay = (a, b) =>
  a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate()

export const isBetween = (d, s, e) => {
  if (!s || !e) return false
  const [lo, hi] = s <= e ? [s, e] : [e, s]
  return d > lo && d < hi
}

export const toKey = d => d.toISOString().split('T')[0]

export const fmtShort = d =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const fmtFull = d =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

export function getDaysInMonth(year, month) {
  const days = []
  const first    = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7
  for (let i = 0; i < startDow; i++)
    days.push({ date: new Date(year, month, -startDow + i + 1), current: false })
  const total = new Date(year, month + 1, 0).getDate()
  for (let i = 1; i <= total; i++)
    days.push({ date: new Date(year, month, i), current: true })
  while (days.length % 7 !== 0)
    days.push({ date: new Date(year, month + 1, days.length - total - startDow + 1), current: false })
  return days
}

export function getWeekDays(baseDate) {
  const dow = (baseDate.getDay() + 6) % 7
  const mon = new Date(baseDate)
  mon.setDate(baseDate.getDate() - dow)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i); return d
  })
}

// ─── Holidays ────────────────────────────────────────────────────────────────
export const HOLIDAYS = {
  '1-1':  "🎉 New Year's Day",
  '1-14': '✊ MLK Day',
  '2-14': '❤️ Valentine\'s Day',
  '3-17': '🍀 St. Patrick\'s Day',
  '4-22': '🌍 Earth Day',
  '5-5':  '🌮 Cinco de Mayo',
  '6-19': '✊ Juneteenth',
  '7-4':  '🎆 Independence Day',
  '9-1':  '👷 Labor Day',
  '10-31':'🎃 Halloween',
  '11-11':'🎖️ Veterans Day',
  '11-27':'🦃 Thanksgiving',
  '12-24':'🎄 Christmas Eve',
  '12-25':'🎁 Christmas Day',
  '12-31':'🥂 New Year\'s Eve',
}
export const getHoliday = d => HOLIDAYS[`${d.getMonth()+1}-${d.getDate()}`] || null

// Hero images — one per month

export const HERO_IMAGES = [
  // Jan – frozen snow landscape
  'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=900&q=80',
  // Feb – warm bokeh / valentines lights
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900&q=80',
  // Mar – green rolling meadow, early spring
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=80',
  // Apr – cherry blossom branch (reliable photo)
  'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=900&q=80',
  // May – colourful tulip field
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=900&q=80' ,
  // Jun – tropical beach, turquoise water
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
  // Jul – fireworks over city skyline
  'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=900&q=80',
  // Aug – golden wheat / sunflower field
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80',
  // Sep – red-orange maple forest, early autumn
  'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=900&q=80',
  // Oct – pumpkins and autumn harvest
  'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=900&q=80',
  // Nov – misty foggy forest, fallen leaves
  'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?w=900&q=80',
  // Dec – snow-covered pine trees / winter wonderland
  'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80',
]

export const THEMES = {
  ocean:  { p:'#1a8fe3', a:'#0c5fa5', l:'#dff0ff', t:'#042c53', name:'Ocean'  },
  coral:  { p:'#e05a3a', a:'#b03a1f', l:'#fdf0ec', t:'#4a1b0c', name:'Coral'  },
  forest: { p:'#2d8a4e', a:'#1a5c34', l:'#eaf4ef', t:'#0d3320', name:'Forest' },
  violet: { p:'#7c4de8', a:'#5930c0', l:'#f0ecfd', t:'#2a1a6b', name:'Violet' },
  gold:   { p:'#c9820e', a:'#945e07', l:'#fdf4e3', t:'#4a2d02', name:'Gold'   },
  rose:   { p:'#e11d6a', a:'#9d1051', l:'#fce7f3', t:'#500028', name:'Rose'   },
}

export const EVENT_COLORS = [
  '#1a8fe3','#e05a3a','#2d8a4e','#7c4de8','#c9820e',
  '#e11d6a','#0d9488','#f97316','#6366f1','#84cc16',
]

export const WEATHER = [
  { icon:'❄️',  desc:'Snowy',          temp:-2  },
  { icon:'🌨️', desc:'Flurries',        temp:1   },
  { icon:'🌸',  desc:'Mild & Breezy',  temp:11  },
  { icon:'🌸',  desc:'Cherry Blossom', temp:15  },
  { icon:'🌻',  desc:'Warm & Sunny',   temp:22  },
  { icon:'☀️',  desc:'Hot',            temp:29  },
  { icon:'🎆',  desc:'Peak Summer',    temp:31  },
  { icon:'🌾',  desc:'Harvest Heat',   temp:28  },
  { icon:'🍂',  desc:'Crisp Autumn',   temp:16  },
  { icon:'🎃',  desc:'Cool & Windy',   temp:10  },
  { icon:'🌫️', desc:'Foggy',          temp:6   },
  { icon:'🌨️', desc:'Cold & Snowy',   temp:0   },
]

export const MOTIVATIONAL = [
  'Make today count ','Progress over perfection ','One step at a time ',
  "You've got this! ",'Dream big, start small ','Stay curious ',
  'Be the energy you want ','Today is a gift ','Keep showing up ',
  'Do it with intention ','Small wins matter ','Breathe and begin ',
]

export const EVENT_CATEGORIES = ['personal','work','health','family','travel','social']
