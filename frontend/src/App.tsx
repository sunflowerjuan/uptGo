import { DATA } from './data/data'
import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useAuth } from './contexts/AuthContext'
import { useData } from './contexts/DataContext'
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

// Local type aliases for the onCreated normalization (avoids importing db types into this module)
type DbTaskPriority = 'alta' | 'media' | 'baja'
type DbTaskStatus = 'pendiente' | 'progreso' | 'entregada' | 'vencida'
type DbNoteType = 'texto' | 'audio' | 'foto' | 'ubicacion'

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
  tasks: { id: string; title: string }[]
  notes: { id: string; title: string }[]
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

type UpdateBannerProps = {
  onUpdate: () => void
  onDismiss: () => void
}

function UpdateBanner({ onUpdate, onDismiss }: UpdateBannerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-pop)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        maxWidth: 'calc(100vw - 32px)',
        width: 'max-content',
      }}
    >
      <Icon name="download" size={18} color="var(--primary)" />
      <span
        style={{
          fontSize: 13.5,
          fontWeight: 500,
          color: 'var(--text)',
          whiteSpace: 'nowrap',
        }}
      >
        Nueva versión disponible
      </span>
      <div style={{ display: 'flex', gap: 8, marginLeft: 4 }}>
        <button
          onClick={onUpdate}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--r-full)',
            background: 'var(--primary)',
            color: 'var(--on-primary)',
            border: 'none',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Actualizar
        </button>
        <button
          onClick={onDismiss}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--r-full)',
            background: 'transparent',
            color: 'var(--text-3)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Más tarde
        </button>
      </div>
    </div>
  )
}

function SearchSheet({ open, onClose, go, onOpenTask, tasks: allTasks, notes: allNotes }: SearchSheetProps) {
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }, [open])

  const tasks = allTasks.filter((task) =>
    task.title.toLowerCase().includes(q.toLowerCase()),
  )

  const notes = allNotes.filter((note) =>
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

  const [updateDismissed, setUpdateDismissed] = useState(false)
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [reminderParent, setReminderParent] = useState<ReminderParent | null>(null)

  const { isAuthenticated, user: authUser, logout: authLogout, handleOAuthCallback, needsProfileCompletion } = useAuth()
  const {
    tasks,
    notes,
    reminders,
    events,
    scheduleBlocks,
    loading: dataLoading,
    addTask,
    updateTask,
    toggleTask,
    addNote,
    deleteNote,
    addReminder,
    toggleReminder,
    addEvent,
    addScheduleBlock,
  } = useData()
  const [profilePromptDismissed, setProfilePromptDismissed] = useState(false)

  const [route, setRoute] = useState<AppRoute>(() => {
    const savedRoute = localStorage.getItem('uptgo_route') as AppRoute | null
    return savedRoute || 'dashboard'
  })

  const [openTaskId, setOpenTaskId] = useState<string | number | null>(null)
  const [noteParentTaskId, setNoteParentTaskId] = useState<string | null>(null)
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

  const addCreatedClassToSchedule = (item: Record<string, unknown>) => {
    if (item.type !== 'clase') return

    const subjectData =
      item.subjectMode === 'new'
        ? {
            ...((item.subjectData as Record<string, unknown>) || {}),
            color: (scheduleBlocks.length % 6) + 1,
          }
        : null

    const subjectId =
      item.subjectMode === 'new'
        ? (subjectData as Record<string, unknown> | null)?.id as string ?? ''
        : item.subject as string

    const days = (item.days as string[]) || []
    const blockPromises = days
      .filter((day) => DAY_INDEX[day] !== undefined)
      .map((day) =>
        addScheduleBlock({
          day: DAY_INDEX[day],
          start: hourToNumber(item.startTime as string),
          end: hourToNumber(item.endTime as string),
          subject: subjectId,
          title: item.title as string,
          room: (item.room as string) || (item.location as string) || 'Sin aula',
          location: (item.location as string) || '',
          locationUrl: (item.locationUrl as string) || '',
          teacher: (subjectData as Record<string, unknown> | null)?.teacher as string ?? '',
        }),
      )

    void Promise.all(blockPromises).then(() => setRoute('schedule'))
  }

  if (dataLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          background: 'var(--bg)',
        }}
      >
        <div style={{ color: 'var(--text-3)', fontSize: 14 }}>Cargando…</div>
      </div>
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
        onToggle={(id: string) => void toggleTask(id)}
        toast={toast}
        onCreateReminder={openReminderModal}
        taskNotes={notes.filter((note) => note.taskId === openTaskId)}
        onAddNote={() => {
          setNoteParentTaskId(String(openTaskId))
          setCreateModalType('nota')
        }}
        onDeleteNote={(id: string) => void deleteNote(id).then(() => toast('Nota eliminada'))}
        onUpdateTask={(id: string, changes: Record<string, unknown>) => void updateTask(id, changes)}
      />
    )
  } else {
    switch (route) {
      case 'tasks':
        screen = (
          <Tasks
            m={isMobile}
            tasks={tasks}
            onToggle={(id: string) => void toggleTask(id)}
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
            events={events}
            onAdd={() => setCreateModalType('evento')}
          />
        )
        break

      case 'schedule':
        screen = (
          <Schedule
            m={isMobile}
            scheduleItems={scheduleBlocks}
            onAdd={() => setCreateModalType('clase')}
            toast={toast}
          />
        )
        break

      case 'notes':
        screen = (
          <Notes
            m={isMobile}
            notes={notes}
            onAdd={() => {
              setNoteParentTaskId(null)
              setCreateModalType('nota')
            }}
            onDeleteNote={(id: string) => void deleteNote(id).then(() => toast('Nota eliminada'))}
            toast={toast}
          />
        )
        break

      case 'reminders':
        screen = (
          <Reminders
            m={isMobile}
            reminders={reminders}
            onToggle={(id: string) => void toggleReminder(id)}
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
            events={events}
            onToggle={(id: string) => void toggleTask(id)}
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
          tasks={tasks}
          notes={notes}
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
          onClose={() => {
            setCreateModalType(null)
            setNoteParentTaskId(null)
          }}
          onCreated={(item: Record<string, unknown>) => {
            const itemType = item.type as CreateItemType

            if (itemType === 'tarea') {
              void addTask({
                title: item.title as string,
                subject: (item.subject as string) || '',
                due: (item.dueDate as string) || '',
                dueDate: item.dueDate as string | undefined,
                dueTime: item.dueTime as string | undefined,
                dueShort: item.dueDate as string | undefined,
                priority: (item.priority as DbTaskPriority) || 'media',
                status: (item.status as DbTaskStatus) || 'pendiente',
                done: false,
                desc: (item.description as string) || '',
              })
            } else if (itemType === 'nota') {
              const rawTags = item.tags as string | undefined
              const rawNoteType = item.noteType as string | undefined
              const noteType: DbNoteType =
                rawNoteType === 'imagen'
                  ? 'foto'
                  : rawNoteType === 'audio' || rawNoteType === 'foto' || rawNoteType === 'ubicacion'
                    ? rawNoteType
                    : 'texto'
              void addNote({
                title: item.title as string,
                subject: (item.subject as string) || '',
                taskId: noteParentTaskId || undefined,
                type: noteType,
                date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
                tags: rawTags ? rawTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
                preview: ((item.noteText as string) || (item.noteAttachmentName as string) || '').slice(0, 120),
                noteText: item.noteText as string | undefined,
                audioUrl: item.audioUrl as string | null | undefined,
                imageUrl: item.imageUrl as string | null | undefined,
                location: item.location as string | undefined,
              })
            } else if (itemType === 'evento') {
              void addEvent({
                title: item.title as string,
                date: (item.date as string) || '',
                time: (item.time as string) || '08:00',
                dur: item.dur as string | undefined,
                subject: (item.subject as string) || '',
                type: item.type as string | undefined,
                loc: (item.room as string) || (item.location as string) || undefined,
              })
            } else if (itemType === 'clase') {
              addCreatedClassToSchedule(item)
            }

            toast(
              `${TYPE_LABEL_TEXT[itemType]} creado correctamente`,
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
          onCreated={(reminder: Record<string, unknown>) => {
            void addReminder({
              parentId: reminder.parentId as string | undefined,
              parentTitle: (reminder.parentTitle as string) || '',
              parentType: reminder.parentType as string | undefined,
              subtitle: reminder.subtitle as string | undefined,
              date: (reminder.date as string) || '',
              time: reminder.time as string | undefined,
              beforeMin: reminder.notifyBefore ? Number(reminder.notifyBefore) : undefined,
              status: 'activo',
              note: reminder.note as string | undefined,
            })
            toast(`Recordatorio creado para ${reminder.parentTitle as string}`)
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
      {needRefresh && !updateDismissed && (
        <UpdateBanner
          onUpdate={() => void updateServiceWorker(true)}
          onDismiss={() => setUpdateDismissed(true)}
        />
      )}
    </div>
  )
}
