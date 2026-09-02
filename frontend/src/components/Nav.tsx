import React from 'react'
import { Icon } from './Icons'
import { Logo } from './Logo'
import { Avatar, IconButton, Sheet } from './UI'
import { useData } from '../contexts/DataContext'

type NavItem = {
  id: string
  label: string
  icon: string
}

type NavGroup = {
  label: string
  items: NavItem[]
}

type User = {
  initials: string
  short: string
  name: string
  program: string | null
  semester?: string | null
  photo?: string | null
}

type GoFunction = (route: string) => void

type SidebarProps = {
  route: string
  go: GoFunction
  rail?: boolean
  user: User
  onPomodoro: () => void
}

type TopTabsProps = {
  route: string
  go: GoFunction
}

type TopBarProps = {
  isMobile: boolean
  navStyle: string
  route: string
  go: GoFunction
  user: User
  online: boolean
  onSearch: () => void
  onNotif: () => void
  onMenu: () => void
  onTheme: () => void
  theme: string
  unread: number
  collapsed?: boolean
}

type SyncChipProps = {
  online: boolean
  compact?: boolean
}

type BottomNavProps = {
  route: string
  go: GoFunction
  onAdd: () => void
}

type MenuSheetProps = {
  open: boolean
  onClose: () => void
  route: string
  go: GoFunction
  user: User
  theme: string
  onTheme: () => void
  onPomodoro: () => void
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard', label: 'Inicio', icon: 'dashboard' },
      { id: 'tasks', label: 'Tareas', icon: 'tasks' },
      { id: 'calendar', label: 'Calendario', icon: 'calendar' },
      { id: 'schedule', label: 'Horario', icon: 'clock' },
    ],
  },
  {
    label: 'Académico',
    items: [
      { id: 'notes', label: 'Notas', icon: 'notes' },
      { id: 'reminders', label: 'Recordatorios', icon: 'bell' },
      { id: 'map', label: 'Mapa del campus', icon: 'mapPin' },
    ],
  },
  {
    label: 'Cuenta',
    items: [{ id: 'settings', label: 'Configuración', icon: 'settings' }],
  },
]

export const ALL_NAV: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)

export const navItem = (id: string): NavItem | undefined =>
  ALL_NAV.find((item) => item.id === id)

/* ---------------- DESKTOP SIDEBAR / RAIL ---------------- */
export function Sidebar({ route, go, rail = false, user, onPomodoro }: SidebarProps) {
  const [hovId, setHovId] = React.useState<string | null>(null)

  return (
    <aside
      className="uptgo-sidebar"
      style={{
        width: rail ? 76 : 232,
        height: '100dvh',
        minHeight: '100dvh',
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width .25s var(--ease)',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          padding: rail ? '14px 0 14px' : '16px 20px 16px',
          display: 'flex',
          justifyContent: rail ? 'center' : 'flex-start',
          background: 'var(--surface)',
        }}
      >
        <button
          onClick={() => go('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {rail ? (
            <Logo variant="mark" size={36} />
          ) : (
            <Logo variant="full" size={32} />
          )}
        </button>
      </div>

      <div
        className="uptgo-sidebar-nav"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: rail ? '0 0 12px' : '0 0 12px',
          scrollbarWidth: 'thin',
        }}
      >
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.label} style={{ marginBottom: 4 }}>
            {!rail && (
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  padding: '12px 20px 5px',
                }}
              >
                {group.label}
              </div>
            )}

            {rail && groupIndex > 0 && (
              <div
                style={{
                  height: 1,
                  background: 'var(--border)',
                  margin: '8px 18px',
                }}
              />
            )}

            {group.items.map((item) => {
              const active = route === item.id
              const hover = hovId === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  title={rail ? item.label : undefined}
                  onMouseEnter={() => setHovId(item.id)}
                  onMouseLeave={() => setHovId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    width: '100%',
                    minWidth: 0,
                    padding: rail ? '0' : '9px 20px',
                    height: rail ? 48 : 'auto',
                    justifyContent: rail ? 'center' : 'flex-start',
                    background: active
                      ? 'var(--primary-soft)'
                      : hover
                        ? 'var(--surface-2)'
                        : 'transparent',
                    border: 'none',
                    borderLeft: rail
                      ? 'none'
                      : `2px solid ${active ? 'var(--primary)' : 'transparent'}`,
                    color: active
                      ? 'var(--primary-text)'
                      : hover
                        ? 'var(--text)'
                        : 'var(--text-2)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'background .14s, color .14s',
                    position: 'relative',
                  }}
                >
                  {rail && active && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 12,
                        bottom: 12,
                        width: 3,
                        borderRadius: '0 3px 3px 0',
                        background: 'var(--primary)',
                      }}
                    />
                  )}

                  <span
                    style={{
                      display: 'inline-flex',
                      flexShrink: 0,
                      ...(rail
                        ? {
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--r-sm)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                          }
                        : {}),
                    }}
                  >
                    <Icon
                      name={item.icon}
                      size={rail ? 20 : 18}
                      stroke={active ? 2 : 1.8}
                    />
                  </span>

                  {!rail && (
                    <span
                      style={{
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div
        className="uptgo-sidebar-footer"
        style={{
          flexShrink: 0,
          marginTop: 'auto',
          padding: rail ? '12px 0 14px' : '14px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: '0 -8px 20px var(--shadow-color)',
        }}
      >
        <button
          onClick={onPomodoro}
          title="Temporizador Pomodoro"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: rail ? 'center' : 'flex-start',
            gap: 10,
            width: rail ? 48 : '100%',
            height: rail ? 48 : 46,
            margin: rail ? '0 auto' : 0,
            padding: rail ? 0 : '0 14px',
            background: 'var(--bg-tint)',
            color: 'var(--text-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <Icon name="timer" size={18} />
          {!rail && 'Pomodoro'}
        </button>

        {!rail && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '14px 4px 2px',
              marginTop: 10,
            }}
          >
            <Avatar initials={user.initials} size={42} photo={user.photo} />

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.short}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-3)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: 2,
                }}
              >
                {user.program}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
/* ---------------- DESKTOP TOP TABS ---------------- */

export function TopTabs({ route, go }: TopTabsProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: 'var(--surface-2)',
        padding: 4,
        borderRadius: 'var(--r-full)',
      }}
    >
      {ALL_NAV.filter((item) => item.id !== 'settings').map((item) => {
        const active = route === item.id

        return (
          <button
            key={item.id}
            onClick={() => go(item.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 14px',
              background: active ? 'var(--surface)' : 'transparent',
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
              color: active ? 'var(--text)' : 'var(--text-2)',
              border: 'none',
              borderRadius: 'var(--r-full)',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              transition: 'background .15s, color .15s',
            }}
          >
            <Icon name={item.icon} size={16} stroke={active ? 2 : 1.8} />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- TOPBAR ---------------- */

type SearchResult = {
  id: string | number
  title: string
  kind: 'task' | 'note'
}

function SearchDropdown({
  results,
  onSelect,
  style,
}: {
  results: SearchResult[]
  onSelect: (r: SearchResult) => void
  style?: React.CSSProperties
}) {
  const tasks = results.filter((r) => r.kind === 'task')
  const notes = results.filter((r) => r.kind === 'note')

  const sectionLabel: React.CSSProperties = {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: 'var(--text-3)',
    padding: '8px 14px 4px',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 14px',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-ui)',
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 6,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 80,
        maxHeight: 420,
        overflowY: 'auto',
        ...style,
      }}
    >
      {tasks.length > 0 && (
        <>
          <div style={sectionLabel}>Tareas</div>
          {tasks.map((r) => (
            <button
              key={`task-${r.id}`}
              onMouseDown={(e) => { e.preventDefault(); onSelect(r) }}
              style={rowStyle}
            >
              <Icon name="tasks" size={15} color="var(--text-3)" />
              <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{r.title}</span>
            </button>
          ))}
        </>
      )}
      {notes.length > 0 && (
        <>
          <div style={{ ...sectionLabel, borderTop: tasks.length > 0 ? '1px solid var(--border)' : undefined }}>
            Notas
          </div>
          {notes.map((r) => (
            <button
              key={`note-${r.id}`}
              onMouseDown={(e) => { e.preventDefault(); onSelect(r) }}
              style={{ ...rowStyle, borderBottom: 'none' }}
            >
              <Icon name="notes" size={15} color="var(--text-3)" />
              <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{r.title}</span>
            </button>
          ))}
        </>
      )}
    </div>
  )
}

export function TopBar({
  isMobile,
  navStyle,
  route,
  go,
  user,
  online,
  onSearch,
  onNotif,
  onMenu,
  onTheme,
  theme,
  unread,
  collapsed = false,
}: TopBarProps) {
  const title = navItem(route)?.label || 'UPTGO'
  const { tasks, notes } = useData()
  const [searchQ, setSearchQ] = React.useState('')
  const [searchFocused, setSearchFocused] = React.useState(false)
  const searchRef = React.useRef<HTMLDivElement | null>(null)

  // Búsqueda inline sobre las tareas/notas reales (no limit — shown in scrollable dropdown)
  const searchResults: SearchResult[] = React.useMemo(() => {
    if (!searchQ.trim() || searchQ.length < 2) return []
    const q = searchQ.toLowerCase()
    const taskResults = tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .map((t): SearchResult => ({ id: t.id, title: t.title, kind: 'task' }))
    const noteResults = notes
      .filter((n) => n.title.toLowerCase().includes(q))
      .map((n): SearchResult => ({ id: n.id, title: n.title, kind: 'note' }))
    return [...taskResults, ...noteResults]
  }, [notes, searchQ, tasks])

  const showDropdown = searchFocused && searchQ.length >= 2

  // Handle click outside dropdown
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Keyboard: close on Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setSearchFocused(false); setSearchQ('') }
  }

  const handleSelectResult = (r: SearchResult) => {
    setSearchQ('')
    setSearchFocused(false)
    go(r.kind === 'task' ? 'tasks' : 'notes')
  }

  const headerHeight = isMobile ? 56 : 60

  return (
    <header
      style={{
        background: 'color-mix(in oklch, var(--surface) 86%, transparent)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 0 var(--border)',
        display: 'grid',
        gridTemplateColumns: isMobile || navStyle === 'top'
          ? '1fr auto'
          : '1fr minmax(0, 340px) 1fr',
        alignItems: 'center',
        gap: 14,
        padding: isMobile ? '0 14px' : '0 22px',
        height: collapsed ? 0 : headerHeight,
        overflow: collapsed ? 'hidden' : 'visible',
        transition: 'height .25s var(--ease)',
        flexShrink: 0,
        zIndex: 20,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Left section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {isMobile ? (
          <button
            onClick={() => go('dashboard')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
            }}
          >
            <Logo variant="mark" size={30} />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 17,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
              }}
            >
              {route === 'dashboard' ? 'UPTGO' : title}
            </span>
          </button>
        ) : navStyle === 'top' ? (
          <>
            <button
              onClick={() => go('dashboard')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <Logo variant="full" size={30} />
            </button>
            <div style={{ marginLeft: 18 }}>
              <TopTabs route={route} go={go} />
            </div>
          </>
        ) : (
          <h1
            style={{
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            {title}
          </h1>
        )}
      </div>

      {/* Center search — desktop only, non-top nav */}
      {!isMobile && navStyle !== 'top' && (
        <div ref={searchRef} style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface-2)',
              border: '1px solid ' + (searchFocused ? 'var(--border-strong)' : 'var(--border)'),
              borderRadius: 'var(--r-full)',
              padding: '8px 14px',
              transition: 'border-color .15s',
            }}
          >
            <Icon name="search" size={15} color="var(--text-3)" />
            <input
              placeholder="Buscar tareas, notas, materias…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={handleKeyDown}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                color: 'var(--text)',
                width: '100%',
              }}
            />
            {searchQ && (
              <button
                onClick={() => { setSearchQ(''); setSearchFocused(false) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0, display: 'flex' }}
              >
                <Icon name="x" size={13} />
              </button>
            )}
          </div>

          {showDropdown && searchResults.length > 0 && (
            <SearchDropdown
              results={searchResults}
              onSelect={handleSelectResult}
            />
          )}
          {showDropdown && searchResults.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 6,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 80,
                padding: '14px',
                fontSize: 13,
                color: 'var(--text-3)',
                textAlign: 'center',
              }}
            >
              Sin resultados para "{searchQ}"
            </div>
          )}
        </div>
      )}

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, justifyContent: 'flex-end' }}>
        <SyncChip online={online} compact={isMobile} />

        {isMobile && <IconButton name="search" onClick={onSearch} title="Buscar" />}

        <IconButton
          name="bell"
          onClick={onNotif}
          badge={unread > 0}
          title="Notificaciones"
        />

        <IconButton
          name={theme === 'dark' ? 'sun' : 'moon'}
          onClick={onTheme}
          title="Tema"
        />

        {isMobile ? (
          <IconButton name="menu" onClick={onMenu} title="Menú" />
        ) : (
          <button
            onClick={() => go('settings')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Avatar initials={user.initials} size={36} photo={user.photo} />
          </button>
        )}
      </div>
    </header>
  )
}

/* ---------------- SYNC CHIP ---------------- */

export function SyncChip({ online, compact = false }: SyncChipProps) {
  const [pulse, setPulse] = React.useState(false)

  React.useEffect(() => {
    if (!online) return

    setPulse(true)
    const timer = window.setTimeout(() => setPulse(false), 1800)

    return () => window.clearTimeout(timer)
  }, [online])

  const color = online ? 'var(--ok)' : 'var(--warn)'

  return (
    <div
      title={online ? 'En línea · sincronizado' : 'Sin conexión · cambios en cola'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: compact ? '6px 9px' : '7px 12px',
        borderRadius: 'var(--r-full)',
        background: online ? 'var(--ok-soft)' : 'var(--warn-soft)',
        color,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ position: 'relative', width: 8, height: 8 }}>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: color,
          }}
        />
        {online && pulse && (
          <span
            style={{
              position: 'absolute',
              inset: -3,
              borderRadius: '50%',
              border: `1.5px solid ${color}`,
              animation: 'uptgo-ping 1.4s var(--ease-out) infinite',
            }}
          />
        )}
      </span>

      {!compact && (online ? 'Sincronizado' : 'Sin conexión')}
    </div>
  )
}

/* ---------------- MOBILE BOTTOM NAV ---------------- */

const BOTTOM_ITEMS = ['dashboard', 'tasks', '__fab', 'calendar', 'notes']

export function BottomNav({ route, go, onAdd }: BottomNavProps) {
  return (
    <nav className="uptgo-bottom-nav"
      style={{
        flexShrink: 0,
        background: 'color-mix(in oklch, var(--surface) 92%, transparent)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'center',
        padding: '6px 8px calc(6px + env(safe-area-inset-bottom))',
        zIndex: 20,
      }}
    >
      {BOTTOM_ITEMS.map((id) => {
        if (id === '__fab') {
          return (
            <div key="fab" style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={onAdd}
                aria-label="Crear"
                style={{
                  width: 52,
                  height: 52,
                  marginTop: -22,
                  borderRadius: 'var(--r-md)',
                  border: '3px solid var(--surface)',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-md)',
                  cursor: 'pointer',
                  transition: 'transform .12s var(--ease)',
                }}
                onMouseDown={(event) => {
                  event.currentTarget.style.transform = 'scale(0.92)'
                }}
                onMouseUp={(event) => {
                  event.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <Icon name="plus" size={24} stroke={2.2} />
              </button>
            </div>
          )
        }

        const item = navItem(id)

        if (!item) return null

        const active = route === id

        return (
          <button
            key={id}
            onClick={() => go(id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--primary-text)' : 'var(--text-3)',
              transition: 'color .15s',
            }}
          >
            <Icon name={item.icon} size={22} stroke={active ? 2.1 : 1.8} />
            <span
              style={{
                fontSize: 10.5,
                fontWeight: active ? 600 : 500,
                fontFamily: 'var(--font-ui)',
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

/* ---------------- MOBILE MENU SHEET ---------------- */

export function MenuSheet({
  open,
  onClose,
  route,
  go,
  user,
  theme,
  onTheme,
  onPomodoro,
}: MenuSheetProps) {
  const extra = ['schedule', 'reminders', 'map', 'settings']
    .map((id) => navItem(id))
    .filter(Boolean) as NavItem[]

  return (
    <Sheet open={open} onClose={onClose} title="Menú">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '4px 2px 16px',
        }}
      >
        <Avatar initials={user.initials} size={46} photo={user.photo} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            {user.name}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
            {user.program}
            {user.semester ? ` · ${user.semester}` : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {extra.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              go(item.id)
              onClose()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '14px 14px',
              textAlign: 'left',
              background:
                route === item.id ? 'var(--primary-soft)' : 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              cursor: 'pointer',
              color: route === item.id ? 'var(--primary-text)' : 'var(--text)',
              fontFamily: 'var(--font-ui)',
              fontSize: 13.5,
              fontWeight: 500,
            }}
          >
            <Icon name={item.icon} size={19} />
            {item.label}
          </button>
        ))}

        <button
          onClick={() => {
            onPomodoro()
            onClose()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '14px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            cursor: 'pointer',
            color: 'var(--text)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13.5,
            fontWeight: 500,
          }}
        >
          <Icon name="timer" size={19} />
          Pomodoro
        </button>

        <button
          onClick={onTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '14px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            cursor: 'pointer',
            color: 'var(--text)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13.5,
            fontWeight: 500,
          }}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
          {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
        </button>
      </div>
    </Sheet>
  )
}