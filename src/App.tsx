import { useMemo, useState } from 'react'
import schedule from './data/schedule.json'
import './App.css'

type Session = {
  day: string
  room: string
  period: 'MANHÃ' | 'TARDE' | 'NOITE'
  time: string
  title: string
}

const periodOrder: Record<Session['period'], number> = {
  MANHÃ: 0,
  TARDE: 1,
  NOITE: 2,
}

const parseTime = (time: string) => {
  const cleaned = time.replace('–', '-')
  const [startPart] = cleaned.split('-').map((part) => part.trim())
  const [hours, minutes] = startPart.split(':').map(Number)
  return hours * 60 + (minutes || 0)
}

const formatDay = (day: string) => {
  const smallWords = new Set(['de', 'do', 'da', 'das', 'dos'])

  return day
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word, index) =>
      index > 0 && smallWords.has(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
}

const logoPath = `${import.meta.env.BASE_URL}unifametro.png`

function App() {
  const sessions = schedule as Session[]
  const days = useMemo(
    () => Array.from(new Set(sessions.map((session) => session.day))),
    [sessions]
  )
  const [selectedDay, setSelectedDay] = useState<string>(days[0])
  const [selectedPeriod, setSelectedPeriod] = useState<
    Session['period'] | 'TODOS'
  >('TODOS')
  const [roomFilter, setRoomFilter] = useState<string>('todas')
  const [search, setSearch] = useState('')

  const roomsForDay = useMemo(
    () =>
      Array.from(
        new Set(
          sessions
            .filter((session) => session.day === selectedDay)
            .map((session) => session.room)
        )
      ).sort(),
    [sessions, selectedDay]
  )

  const filteredSessions = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase()

    return sessions
      .filter((session) => session.day === selectedDay)
      .filter(
        (session) =>
          selectedPeriod === 'TODOS' || session.period === selectedPeriod
      )
      .filter(
        (session) =>
          roomFilter === 'todas' || session.room.toLowerCase() === roomFilter
      )
      .filter((session) =>
        normalizedQuery
          ? session.title.toLowerCase().includes(normalizedQuery)
          : true
      )
      .sort((a, b) => {
        if (a.period !== b.period) {
          return periodOrder[a.period] - periodOrder[b.period]
        }
        const timeDiff = parseTime(a.time) - parseTime(b.time)
        if (timeDiff !== 0) return timeDiff
        return a.room.localeCompare(b.room)
      })
  }, [sessions, selectedDay, selectedPeriod, roomFilter, search])

  const groupedByRoom = useMemo(() => {
    return filteredSessions.reduce<Record<string, Session[]>>(
      (groups, session) => {
        if (!groups[session.room]) {
          groups[session.room] = []
        }
        groups[session.room].push(session)
        return groups
      },
      {}
    )
  }, [filteredSessions])

  const totalPresentations = filteredSessions.length

  return (
    <div className="app-shell">
      <div className="backdrop" aria-hidden />

      <header className="hero">
        <div className="brand">
          <img
            src={logoPath}
            alt="Logo Unifametro"
            className="brand__logo"
          />
          <div>
            <p className="eyebrow">II Simpósio de Extensão Curricular</p>
            <h1>Calendário de Apresentações</h1>
            <p className="lead">
              Navegue pelas salas e horários. Use filtros para encontrar sua
              apresentação em segundos.
            </p>
            <div className="hero__tags">
              <span className="tag">Dias: {days.length}</span>
              <span className="tag">
                Salas no dia: {roomsForDay.length || '—'}
              </span>
              <span className="tag emphasis">Total: {totalPresentations}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="panel">
        <div className="filters">
          <div className="day-tabs" aria-label="Selecione o dia">
            {days.map((day) => (
              <button
                key={day}
                className={`tab ${day === selectedDay ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedDay(day)
                  setRoomFilter('todas')
                }}
              >
                {formatDay(day)}
              </button>
            ))}
          </div>

          <div className="filter-row">
            <div className="chip-group" aria-label="Filtrar por período">
              {['TODOS', 'MANHÃ', 'TARDE', 'NOITE'].map((period) => (
                <button
                  key={period}
                  className={`chip ${
                    selectedPeriod === period ? 'chip--active' : ''
                  }`}
                  onClick={() =>
                    setSelectedPeriod(period as Session['period'] | 'TODOS')
                  }
                >
                  {period === 'TODOS' ? 'Todos os períodos' : period}
                </button>
              ))}
            </div>

            <div className="filter-inputs">
              <label className="field">
                <span>Sala</span>
                <select
                  value={roomFilter}
                  onChange={(event) =>
                    setRoomFilter(event.target.value.toLowerCase())
                  }
                >
                  <option value="todas">Todas</option>
                  {roomsForDay.map((room) => (
                    <option key={room} value={room.toLowerCase()}>
                      {room}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field grow">
                <span>Busca por título</span>
                <input
                  type="search"
                  placeholder="Digite um tema ou palavra-chave"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card">
            <p className="stat-label">Apresentações filtradas</p>
            <p className="stat-value">{totalPresentations}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Salas ativas</p>
            <p className="stat-value">{roomsForDay.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Período</p>
            <p className="stat-value">
              {selectedPeriod === 'TODOS' ? 'Todos' : selectedPeriod}
            </p>
          </div>
        </div>

        <div className="grid">
          {Object.keys(groupedByRoom).length === 0 && (
            <div className="empty">Nada encontrado com estes filtros.</div>
          )}

          {Object.entries(groupedByRoom)
            .sort(([roomA], [roomB]) => roomA.localeCompare(roomB))
            .map(([room, roomSessions]) => (
              <article key={room} className="room-card">
                <header className="room-card__header">
                  <div>
                    <p className="eyebrow">Sala</p>
                    <h3>{room}</h3>
                    <p className="room-card__day">{formatDay(selectedDay)}</p>
                  </div>
                  <span className="badge">{roomSessions.length} apresentações</span>
                </header>

                <ul className="session-list">
                  {roomSessions.map((session) => (
                    <li key={`${session.time}-${session.title}`} className="session">
                      <div className="session__time">
                        <span className={`pill pill--${session.period.toLowerCase()}`}>
                          {session.period}
                        </span>
                        <strong>{session.time}</strong>
                      </div>
                      <p className="session__title">{session.title}</p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
        </div>
      </section>
    </div>
  )
}

export default App
