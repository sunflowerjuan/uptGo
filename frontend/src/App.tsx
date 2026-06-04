import { DATA } from './data/data'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { Icon } from './components/Icons'
import { Sheet, EmptyState, cSoftVar, cVar } from './components/UI'
import { TopBar, Sidebar, BottomNav, MenuSheet } from './components/Nav'
import { useTweaks } from './components/TweaksPanel'
import { Login, ErrorScreen, CompleteProfileModal } from './screens/Auth'
import { Dashboard } from './screens/Dashboard'
import { Tasks, TaskDetail } from './screens/Tasks'
import { Calendar, Schedule } from './screens/Calendar'
import { Notes, Reminders } from './screens/Notes'
import { CampusMap, Settings, Pomodoro } from './screens/Misc'
import {
  CreateReminderModal,
  type ReminderParent,
} from './components/CreateReminderModal'
import {
  CreateAcademicItemModal,
  type CreateItemType,
} from './components/CreateAcademicItemModal'

import './styles/theme.css'

type AppRoute =
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'schedule'
  | 'notes'
  | 'reminders'
  | 'map'
  | 'settings'
  | 'offline'
  | 'notfound'

type SheetType = 'search' | 'notif' | 'menu' | 'pomodoro' | 'add' | null

type TweakValues = {
  palette: 'verde' | 'cobalto' | 'arcilla'
  dark: boolean
  navStyle: 'sidebar' | 'rail' | 'top'
  homeVariant: 'resumen' | 'enfoque'
  online: boolean
}

declare global {
  interface Window {
    __UPTGO_MOBILE__?: boolean
  }
}

type ToastProps = {
  msg: string
}

type SearchSheetProps = {
  open: boolean
  onClose: () => void
  go: (route: string) => void
  onOpenTask: (id: number | string) => void
}

type NotifSheetProps = {
  open: boolean
  onClose: () => void
}

type QuickAddSheetProps = {
  open: boolean
  onClose: () => void
  onPickType: (type: CreateItemType) => void
}

const TWEAK_DEFAULTS: TweakValues = {
  palette: 'verde',
  dark: false,
  navStyle: 'sidebar',
  homeVariant: 'resumen',
  online: true,
}

const TYPE_LABEL_TEXT: Record<CreateItemType, string> = {
  evento: 'Evento',
  tarea: 'Tarea',
  clase: 'Clase',
  nota: 'Nota',
}

const DAY_INDEX: Record<string, number> = {
  Lun: 0,
  Mar: 1,
  Mié: 2,
  Jue: 3,
  Vie: 4,
  Sáb: 5,
  Dom: 6,
}

function useIsMobile(breakpoint = 820) {
  const getIsMobile = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches
  }

  const [isMobile, setIsMobile] = useState(getIsMobile)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [breakpoint])

  return isMobile
}

function Toast({ msg }: ToastProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 96,
        left: '50%',
        transform: `translateX(-50%) translateY(${msg ? 0 : 16}px)`,
        opacity: msg ? 1 : 0,
        pointerEvents: 'none',
        transition: 'all .3s var(--ease)',
        zIndex: 80,
        background: 'var(--text)',
        color: 'var(--bg)',
        padding: '11px 18px',
        borderRadius: 'var(--r-full)',
        fontSize: 13,
        fontWeight: 500,
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        maxWidth: '88%',
      }}
    >
      <Icon name="check" size={15} color="var(--bg)" stroke={2.4} />
      {msg}
    </div>
  )
}

function SearchSheet({ open, onClose, go, onOpenTask }: SearchSheetProps) {
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }, [open])

  const tasks = DATA.tasks.filter((task) =>
    task.title.toLowerCase().includes(q.toLowerCase()),
  )

  const notes = DATA.notes.filter((note) =>
    note.title.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <Sheet open={open} onClose={onClose} title="Buscar">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
          height: 48,
          background: 'var(--surface-2)',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--border)',
        }}
      >
        <Icon name="search" size={17} color="var(--text-3)" />

        <input
          ref={inputRef}
          placeholder="Tareas, notas, materias…"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            color: 'var(--text)',
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        {q && tasks.length === 0 && notes.length === 0 && (
          <EmptyState
            icon="search"
            title="Sin resultados"
            body={`Nada coincide con "${q}".`}
          />
        )}

        {tasks.length > 0 && (
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
              marginBottom: 8,
            }}
          >
            Tareas
          </div>
        )}

        {tasks.slice(0, 4).map((task) => (
          <button
            key={task.id}
            onClick={() => {
              onClose()
              onOpenTask(task.id)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              width: '100%',
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <Icon name="tasks" size={17} color="var(--text-3)" />
            <span style={{ fontSize: 13.5, color: 'var(--text)' }}>
              {task.title}
            </span>
          </button>
        ))}

        {notes.length > 0 && (
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
              margin: '14px 0 8px',
            }}
          >
            Notas
          </div>
        )}

        {notes.slice(0, 4).map((note) => (
          <button
            key={note.id}
            onClick={() => {
              onClose()
              go('notes')
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              width: '100%',
              padding: '11px 6px',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <Icon name="notes" size={17} color="var(--text-3)" />
            <span style={{ fontSize: 13.5, color: 'var(--text)' }}>
              {note.title}
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}

function NotifSheet({ open, onClose }: NotifSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Notificaciones">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DATA.notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              display: 'flex',
              gap: 12,
              padding: '13px',
              borderRadius: 'var(--r-md)',
              background: notification.unread
                ? 'var(--primary-soft)'
                : 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--r-sm)',
                background: cSoftVar(notification.color),
                color: cVar(notification.color),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name={notification.icon} size={17} />
            </span>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  {notification.title}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-3)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {notification.time}
                </span>
              </div>

              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--text-2)',
                  marginTop: 2,
                  lineHeight: 1.45,
                }}
              >
                {notification.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  )
}

function QuickAddSheet({ open, onClose, onPickType }: QuickAddSheetProps) {
  const opts: Array<[string, string, string, number, CreateItemType]> = [
    ['calendar', 'Evento', 'En tu calendario', 3, 'evento'],
    ['tasks', 'Tarea', 'Nueva tarea académica', 1, 'tarea'],
    ['clock', 'Clase', 'Horario académico', 2, 'clase'],
    ['notes', 'Nota', 'Texto, audio o foto', 4, 'nota'],
  ]

  return (
    <Sheet open={open} onClose={onClose} title="Crear nuevo">
      <div className="uptgo-sheet-grid">
        {opts.map(([ic, label, sub, color, type]) => (
          <button
            key={label}
            onClick={() => {
              onClose()
              onPickType(type)
            }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '16px 14px',
              textAlign: 'left',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              cursor: 'pointer',
              color: 'var(--text)',
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--r-md)',
                background: cSoftVar(color),
                color: cVar(color),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name={ic} size={18} />
            </span>

            <span style={{ minWidth: 0 }}>
              <strong
                style={{
                  display: 'block',
                  fontSize: 14,
                  color: 'var(--text)',
                  marginBottom: 3,
                }}
              >
                {label}
              </strong>

              <span
                style={{
                  display: 'block',
                  fontSize: 12.5,
                  color: 'var(--text-2)',
                  lineHeight: 1.35,
                }}
              >
                {sub}
              </span>
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}

export default function App() {
  const [t, setTweak] = useTweaks<TweakValues>(TWEAK_DEFAULTS)
  const theme = t.dark ? 'dark' : 'light'
  const isMobile = useIsMobile()

  window.__UPTGO_MOBILE__ = isMobile

  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [reminderParent, setReminderParent] = useState<ReminderParent | null>(null)
  const [createdScheduleBlocks, setCreatedScheduleBlocks] = useState<any[]>([])

  const { isAuthenticated, user: authUser, logout: authLogout, handleOAuthCallback, needsProfileCompletion } = useAuth()
  const [profilePromptDismissed, setProfilePromptDismissed] = useState(false)

  const [route, setRoute] = useState<AppRoute>(() => {
    const savedRoute = localStorage.getItem('uptgo_route') as AppRoute | null
    return savedRoute || 'dashboard'
  })

  const [openTaskId, setOpenTaskId] = useState<string | number | null>(null)
  const [tasks, setTasks] = useState(DATA.tasks)
  const [reminders, setReminders] = useState(DATA.reminders)
  const [sheet, setSheet] = useState<SheetType>(null)
  const [toastMsg, setToastMsg] = useState('')
  const [createModalType, setCreateModalType] = useState<CreateItemType | null>(
    null,
  )

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    localStorage.setItem('uptgo_route', route)
  }, [route])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')
    if (accessToken && refreshToken) {
      void handleOAuthCallback(accessToken, refreshToken).then(() => go('dashboard'))
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const toast = (message: string) => {
    setToastMsg(message)

    if (toastTimer.current) {
      clearTimeout(toastTimer.current)
    }

    toastTimer.current = setTimeout(() => setToastMsg(''), 2200)
  }

  const go = (nextRoute: string) => {
    setOpenTaskId(null)
    setRoute(nextRoute as AppRoute)
  }

  const handleLoginSuccess = () => {
    go('dashboard')
  }

  const logout = () => {
    authLogout()
    setOpenTaskId(null)
    setSheet(null)
    setCreateModalType(null)
    setReminderModalOpen(false)
    setReminderParent(null)
    go('dashboard')
  }

  const openTask = (id: string | number) => {
    setOpenTaskId(id)
    setRoute('tasks')
  }

  const openReminderModal = (parent?: ReminderParent | null) => {
    setReminderParent(parent || null)
    setReminderModalOpen(true)
  }

  const hourToNumber = (time: string) => {
    const [hour] = time.split(':')
    return Number(hour)
  }

  const addCreatedClassToSchedule = (item: any) => {
    if (item.type !== 'clase') return

    const subjectColor =
      item.subjectMode === 'new'
        ? ((createdScheduleBlocks.length % 6) + 1)
        : undefined

    const subjectData =
      item.subjectMode === 'new'
        ? {
          ...(item.subjectData || {}),
          color: subjectColor,
        }
        : null

    const subjectId =
      item.subjectMode === 'new'
        ? subjectData?.id
        : item.subject

    const blocks = (item.days || [])
      .map((day: string) => ({
        id: `${item.id}-${day}`,
        day: DAY_INDEX[day],
        start: hourToNumber(item.startTime),
        end: hourToNumber(item.endTime),
        subject: subjectId,
        title: item.title,
        room: item.room || item.location || 'Sin aula',
        location: item.location || '',
        locationUrl: item.locationUrl || '',
        teacher: subjectData?.teacher || '',
        created: true,
        subjectData,
      }))
      .filter((block: any) => block.day !== undefined)

    setCreatedScheduleBlocks((current) => [...blocks, ...current])
    setRoute('schedule')
  }
  const toggleTask = (id: string | number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
            ...task,
            done: !task.done,
            status: !task.done ? 'entregada' : 'pendiente',
          }
          : task,
      ),
    )
  }

  const toggleReminder = (id: string | number) => {
    setReminders((currentReminders) =>
      currentReminders.map((reminder) =>
        reminder.id === id
          ? {
            ...reminder,
            status: reminder.status === 'activo' ? 'completado' : 'activo',
          }
          : reminder,
      ),
    )
  }

  const unread = DATA.notifications.filter((notification) => notification.unread)
    .length

  const online = t.online
  const isError = route === 'offline' || route === 'notfound'

  let screen

  if (route === 'offline' || route === 'notfound') {
    screen = (
      <ErrorScreen
        kind={route === 'offline' ? 'offline' : 'notfound'}
        onRetry={() => {
          setTweak('online', true)
          go('dashboard')
        }}
        onHome={() => go('dashboard')}
      />
    )
  } else if (openTaskId) {
    screen = (
      <TaskDetail
        m={isMobile}
        task={tasks.find((task) => task.id === openTaskId)}
        onBack={() => setOpenTaskId(null)}
        onToggle={toggleTask}
        toast={toast}
        onCreateReminder={openReminderModal}
      />
    )
  } else {
    switch (route) {
      case 'tasks':
        screen = (
          <Tasks
            m={isMobile}
            tasks={tasks}
            onToggle={toggleTask}
            onOpenTask={openTask}
            onAdd={() => setCreateModalType('tarea')}
          />
        )
        break

      case 'calendar':
        screen = (
          <Calendar
            m={isMobile}
            go={go}
            onAdd={() => setCreateModalType('evento')}
          />
        )
        break

      case 'schedule':
        screen = (
          <Schedule
            m={isMobile}
            scheduleItems={createdScheduleBlocks}
            onAdd={() => setCreateModalType('clase')}
            toast={toast}
          />
        )
        break

      case 'notes':
        screen = (
          <Notes
            m={isMobile}
            onAdd={() => setCreateModalType('nota')}
            toast={toast}
          />
        )
        break

      case 'reminders':
        screen = (
          <Reminders
            m={isMobile}
            reminders={reminders}
            onToggle={toggleReminder}
            onAdd={() => openReminderModal(null)}
            toast={toast}
          />
        )
        break

      case 'map':
        screen = <CampusMap m={isMobile} toast={toast} />
        break

      case 'settings':
        screen = (
          <Settings
            m={isMobile}
            theme={theme}
            onTheme={() => setTweak('dark', !t.dark)}
            palette={t.palette}
            onPalette={(palette: TweakValues['palette']) =>
              setTweak('palette', palette)
            }
            onLogout={logout}
            toast={toast}
          />
        )
        break

      default:
        screen = (
          <Dashboard
            m={isMobile}
            go={go}
            tasks={tasks}
            onToggle={toggleTask}
            onOpenTask={openTask}
            variant={t.homeVariant}
          />
        )
    }
  }

  const displayUser = authUser
    ? { ...DATA.user, name: authUser.name, email: authUser.email, initials: authUser.initials ?? authUser.name.slice(0, 2).toUpperCase(), program: authUser.program ?? DATA.user.program, short: authUser.name.split(' ')[0], photo: localStorage.getItem('uptgo_user_avatar') }
    : DATA.user

  const appInner = !isAuthenticated ? (
    <Login onLogin={handleLoginSuccess} />
  ) : (
    <div className={isMobile ? 'uptgo-mobile-shell' : 'uptgo-desktop-shell'}>
      {!isError && !isMobile && t.navStyle !== 'top' && (
        <Sidebar
          route={route}
          go={go}
          rail={t.navStyle === 'rail'}
          user={displayUser}
          onPomodoro={() => setSheet('pomodoro')}
        />
      )}

      <div className="uptgo-main-shell">
        {!isError && (
          <TopBar
            isMobile={isMobile}
            navStyle={t.navStyle}
            route={route}
            go={go}
            user={displayUser}
            online={online}
            onSearch={() => setSheet('search')}
            onNotif={() => setSheet('notif')}
            onMenu={() => setSheet('menu')}
            onTheme={() => setTweak('dark', !t.dark)}
            theme={theme}
            unread={unread}
          />
        )}

        {!online && !isError && (
          <button
            onClick={() => go('offline')}
            style={{
              margin: isMobile ? '10px 14px 0' : '12px 28px 0',
              padding: '10px 14px',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--warn)',
              background: 'var(--warn-soft)',
              color: 'var(--text)',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Modo sin conexión. Tus datos están disponibles localmente · se
            sincronizarán al reconectar.
          </button>
        )}

        <main
          className="uptgo-main"
          style={{
            padding: isMobile ? '12px' : '28px',
            minWidth: 0,
            maxWidth: '100%',
            overflowX: 'clip',
          }}
        >
          <div className={isMobile ? 'uptgo-mobile-content' : 'uptgo-content'}>
            {screen}
          </div>
        </main>

        {isMobile && !isError && (
          <BottomNav
            route={route}
            go={go}
            onAdd={() => setSheet('add')}
          />
        )}

        <SearchSheet
          open={sheet === 'search'}
          onClose={() => setSheet(null)}
          go={go}
          onOpenTask={openTask}
        />

        <NotifSheet
          open={sheet === 'notif'}
          onClose={() => setSheet(null)}
        />

        <QuickAddSheet
          open={sheet === 'add'}
          onClose={() => setSheet(null)}
          onPickType={(type) => setCreateModalType(type)}
        />

        <MenuSheet
          open={sheet === 'menu'}
          onClose={() => setSheet(null)}
          route={route}
          go={go}
          user={displayUser}
          theme={theme}
          onTheme={() => setTweak('dark', !t.dark)}
          onPomodoro={() => setSheet('pomodoro')}
        />

        <CreateAcademicItemModal
          open={!!createModalType}
          type={createModalType || 'evento'}
          onClose={() => setCreateModalType(null)}
          onCreated={(item) => {
            if (item.type === 'clase') {
              addCreatedClassToSchedule(item)
            }

            toast(
              `${TYPE_LABEL_TEXT[item.type as CreateItemType]} creado correctamente`,
            )
          }}
        />

        <CreateReminderModal
          open={reminderModalOpen}
          parent={reminderParent}
          onClose={() => {
            setReminderModalOpen(false)
            setReminderParent(null)
          }}
          onCreated={(reminder) => {
            setReminders((currentReminders) => [reminder, ...currentReminders])
            toast(`Recordatorio creado para ${reminder.parentTitle}`)
          }}
        />

        <Pomodoro
          open={sheet === 'pomodoro'}
          onClose={() => setSheet(null)}
        />

        {toastMsg && <Toast msg={toastMsg} />}

        {isAuthenticated && needsProfileCompletion && !profilePromptDismissed && (
          <CompleteProfileModal onDismiss={() => setProfilePromptDismissed(true)} />
        )}
      </div>
    </div>
  )

  return (
    <div
      className="uptgo-root"
      data-theme={theme}
      data-palette={t.palette}
    >
      {appInner}
    </div>
  )
}