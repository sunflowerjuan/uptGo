import React from 'react'
import { Icon } from './Icons'
import { Logo } from './Logo'
import { Avatar, IconButton, Sheet } from './UI'

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
  program: string
  semester?: string
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

export function Sidebar({
  route,
  go,
  rail = false,
  user,
  onPomodoro,
}: SidebarProps) {
  const [hovId, setHovId] = React.useState<string | null>(null)

  return (
    <nav
      style={{
        width: rail ? 76 : 232,
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: rail ? '14px 0' : '16px 0',
        overflowY: 'auto',
        transition: 'width .25s var(--ease)',
      }}
    >
      <div
        style={{
          padding: rail ? '0 0 14px' : '0 20px 16px',
          display: 'flex',
          justifyContent: rail ? 'center' : 'flex-start',
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

                {!rail && item.label}
              </button>
            )
          })}
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: rail ? '12px 0 0' : '12px 14px 0' }}>
        <button
          onClick={onPomodoro}
          title="Temporizador Pomodoro"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: rail ? 48 : '100%',
            height: 44,
            margin: rail ? '0 auto' : 0,
            background: 'var(--bg-tint)',
            color: 'var(--text-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <Icon name="timer" size={17} />
          {!rail && 'Pomodoro'}
        </button>

        {!rail && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 6px 4px',
              marginTop: 10,
              borderTop: '1px solid var(--border)',
            }}
          >
            <Avatar initials={user.initials} size={34} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.short}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {user.program}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
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
}: TopBarProps) {
  const title = navItem(route)?.label || 'UPTGO'

  return (
    <header
      style={{
        background: 'color-mix(in oklch, var(--surface) 86%, transparent)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        padding: isMobile ? '0 14px' : '0 22px',
        height: isMobile ? 56 : 60,
        flexShrink: 0,
        zIndex: 20,
        position: 'relative',
      }}
    >
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

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
        {!isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-full)',
              padding: '8px 14px',
              width: 260,
            }}
          >
            <Icon name="search" size={15} color="var(--text-3)" />
            <input
              placeholder="Buscar tareas, notas, materias…"
              onFocus={onSearch}
              readOnly
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                color: 'var(--text)',
                width: '100%',
                cursor: 'pointer',
              }}
            />
          </div>
        )}

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
            <Avatar initials={user.initials} size={36} />
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
    <nav
      style={{
        flexShrink: 0,
        background: 'color-mix(in oklch, var(--surface) 92%, transparent)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'center',
        padding: '6px 8px calc(6px + env(safe-area-inset-bottom))',
        position: 'relative',
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
        <Avatar initials={user.initials} size={46} />
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