import { DATA } from './data/data'
import { useEffect, useRef, useState } from 'react'
import { Icon } from './components/Icons'
import { Logo } from './components/Logo'
import { Sheet, EmptyState, cSoftVar, cVar } from './components/UI'
import { TopBar, Sidebar, BottomNav, MenuSheet } from './components/Nav'
import { useTweaks } from './components/TweaksPanel'

import { Login, ErrorScreen } from './screens/Auth'
import { Dashboard } from './screens/Dashboard'
import { Tasks, TaskDetail } from './screens/Tasks'
import { Calendar, Schedule } from './screens/Calendar'
import { Notes, Reminders } from './screens/Notes'
import {
  CampusMap,
  Settings,
  Pomodoro,
} from './screens/Misc'

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
type StatusBarProps = {
  online: boolean
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
  toast: (msg: string) => void
}

function useIsMobile(breakpoint = 820) {
  const getValue = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches
  }

  const [isMobile, setIsMobile] = useState(getValue)

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

function StatusBar({ online }: StatusBarProps) {
  return (
    <div style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', flexShrink: 0, background: 'var(--surface)', color: 'var(--text)' }}>
      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)' }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name={online ? 'globe' : 'wifiOff'} size={14} color="var(--text)" />
        <svg width="22" height="12" viewBox="0 0 24 12" fill="none"><rect x="1" y="1" width="19" height="10" rx="3" stroke="var(--text)" strokeWidth="1.2" opacity="0.5" /><rect x="3" y="3" width="13" height="6" rx="1.5" fill="var(--text)" /><rect x="21" y="4" width="2" height="4" rx="1" fill="var(--text)" opacity="0.5" /></svg>
      </div>
    </div>
  );
}

function Toast({ msg }: ToastProps) {
  return (
    <div style={{
      position: 'absolute', bottom: 96, left: '50%', transform: `translateX(-50%) translateY(${msg ? 0 : 16}px)`,
      opacity: msg ? 1 : 0, pointerEvents: 'none', transition: 'all .3s var(--ease)', zIndex: 80,
      background: 'var(--text)', color: 'var(--bg)', padding: '11px 18px', borderRadius: 'var(--r-full)',
      fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 8, maxWidth: '88%',
    }}>
      <Icon name="check" size={15} color="var(--bg)" stroke={2.4} />{msg}
    </div>
  );
}

function SearchSheet({ open, onClose, go, onOpenTask }: SearchSheetProps) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }, [open])
  const tasks = DATA.tasks.filter(t => t.title.toLowerCase().includes(q.toLowerCase()));
  const notes = DATA.notes.filter(n => n.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <Sheet open={open} onClose={onClose} title="Buscar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 48, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
        <Icon name="search" size={17} color="var(--text-3)" />
        <input ref={inputRef} placeholder="Tareas, notas, materias…" value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text)' }} />
      </div>
      <div style={{ marginTop: 16 }}>
        {q && tasks.length === 0 && notes.length === 0 && <EmptyState icon="search" title="Sin resultados" body={`Nada coincide con "${q}".`} />}
        {tasks.length > 0 && <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>Tareas</div>}
        {tasks.slice(0, 4).map(t => (
          <button key={t.id} onClick={() => { onClose(); onOpenTask(t.id); }} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '11px 6px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
            <Icon name="tasks" size={17} color="var(--text-3)" /><span style={{ fontSize: 13.5, color: 'var(--text)' }}>{t.title}</span>
          </button>
        ))}
        {notes.length > 0 && <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)', margin: '14px 0 8px' }}>Notas</div>}
        {notes.slice(0, 4).map(n => (
          <button key={n.id} onClick={() => { onClose(); go('notes'); }} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '11px 6px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
            <Icon name="notes" size={17} color="var(--text-3)" /><span style={{ fontSize: 13.5, color: 'var(--text)' }}>{n.title}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function NotifSheet({ open, onClose }: NotifSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Notificaciones">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DATA.notifications.map(n => (
          <div key={n.id} style={{ display: 'flex', gap: 12, padding: '13px', borderRadius: 'var(--r-md)', background: n.unread ? 'var(--primary-soft)' : 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <span style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: cSoftVar(n.color), color: cVar(n.color), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={n.icon} size={17} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{n.title}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{n.time}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.45 }}>{n.body}</div>
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function QuickAddSheet({ open, onClose, toast }: QuickAddSheetProps) {
  const opts: Array<[string, string, string, number]> = [
    ['tasks', 'Tarea', 'Nueva tarea académica', 1],
    ['notes', 'Nota', 'Texto, audio o foto', 2],
    ['bell', 'Recordatorio', 'Con notificación push', 5],
    ['calendar', 'Evento', 'En tu calendario', 3],
  ]

  return (
    <Sheet open={open} onClose={onClose} title="Crear nuevo">
      <div className="uptgo-sheet-grid">
        {opts.map(([ic, label, sub, c]) => (
          <button
            key={label}
            onClick={() => {
              onClose()
              toast(`Crear ${label.toLowerCase()}`)
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
                background: cSoftVar(c),
                color: cVar(c),
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

const TWEAK_DEFAULTS: TweakValues = {
  palette: 'verde',
  dark: false,
  navStyle: 'sidebar',
  homeVariant: 'resumen',
  online: true,
}

export default function App() {
  const [t, setTweak] = useTweaks<TweakValues>(TWEAK_DEFAULTS)
  const theme = t.dark ? 'dark' : 'light';
  const isMobile = useIsMobile()
  window.__UPTGO_MOBILE__ = isMobile;

  const [authed, setAuthed] = useState(() => localStorage.getItem('uptgo_auth') === '1');
  const [route, setRoute] = useState<AppRoute>(() => {
    const savedRoute = localStorage.getItem('uptgo_route') as AppRoute | null
    return savedRoute || 'dashboard'
  })

  const [openTaskId, setOpenTaskId] = useState<string | number | null>(null)
  const [tasks, setTasks] = useState(DATA.tasks)
  const [reminders, setReminders] = useState(DATA.reminders)
  const [sheet, setSheet] = useState<SheetType>(null)
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { localStorage.setItem('uptgo_route', route); }, [route]);
  const login = () => {
    setAuthed(true)
    localStorage.setItem('uptgo_auth', '1')
    go('dashboard')
  }

  const logout = () => {
    setAuthed(false)
    localStorage.removeItem('uptgo_auth')
    setOpenTaskId(null)
    setSheet(null)
    go('dashboard')
  }
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

  const openTask = (id: string | number) => {
    setOpenTaskId(id)
    setRoute('tasks')
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
  const unread = DATA.notifications.filter(n => n.unread).length;
  const online = t.online;

  let screen;
  if (route === 'offline' || route === 'notfound') {
    screen = <ErrorScreen kind={route === 'offline' ? 'offline' : 'notfound'} onRetry={() => { setTweak('online', true); go('dashboard'); }} onHome={() => go('dashboard')} />;
  } else if (openTaskId) {
    screen = <TaskDetail m={isMobile} task={tasks.find(x => x.id === openTaskId)} onBack={() => setOpenTaskId(null)} onToggle={toggleTask} toast={toast} />;
  } else {
    switch (route) {
      case 'tasks': screen = <Tasks m={isMobile} tasks={tasks} onToggle={toggleTask} onOpenTask={openTask} onAdd={() => setSheet('add')} />; break;
      case 'calendar': screen = <Calendar m={isMobile} go={go} onAdd={() => setSheet('add')} />; break;
      case 'schedule': screen = <Schedule m={isMobile} onAdd={() => setSheet('add')} toast={toast} />; break;
      case 'notes': screen = <Notes m={isMobile} onAdd={() => setSheet('add')} toast={toast} />; break;
      case 'reminders': screen = <Reminders m={isMobile} reminders={reminders} onToggle={toggleReminder} onAdd={() => setSheet('add')} onPomodoro={() => setSheet('pomodoro')} />; break;
      case 'map': screen = <CampusMap m={isMobile} toast={toast} />; break;
      case 'settings': screen = <Settings m={isMobile} theme={theme} onTheme={() => setTweak('dark', !t.dark)} palette={t.palette} onPalette={(p: TweakValues['palette']) => setTweak('palette', p)} onLogout={logout} toast={toast} />; break;
      default: screen = <Dashboard m={isMobile} go={go} tasks={tasks} onToggle={toggleTask} onOpenTask={openTask} variant={t.homeVariant} />;
    }
  }

  const isError = route === 'offline' || route === 'notfound';
  const mainPad = isMobile ? 'var(--space-pad-mobile)' : 'var(--space-pad-desk)';

  const appInner = !authed ? (
    <Login onLogin={login} />
  ) : (
    <div className={isMobile ? 'uptgo-mobile-shell' : 'uptgo-desktop-shell'}>
      {!isError && !isMobile && t.navStyle !== 'top' && (
        <Sidebar
          route={route}
          go={go}
          rail={t.navStyle === 'rail'}
          user={DATA.user}
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
            user={DATA.user}
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
            Modo sin conexión. Tus datos están disponibles localmente · se sincronizarán al reconectar.
          </button>
        )}

        <main
          className="uptgo-main"
          style={{
            padding: isMobile ? mainPad : mainPad,
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
          toast={toast}
        />

        <MenuSheet
          open={sheet === 'menu'}
          onClose={() => setSheet(null)}
          route={route}
          go={go}
          user={DATA.user}
          theme={theme}
          onTheme={() => setTweak('dark', !t.dark)}
          onPomodoro={() => setSheet('pomodoro')}
        />

        <Pomodoro
          open={sheet === 'pomodoro'}
          onClose={() => setSheet(null)}
        />

        {toastMsg && <Toast msg={toastMsg} />}
      </div>
    </div>
  );

  return (
    <div
      className="uptgo-root"
      data-theme={theme}
      data-palette={t.palette}
    >
      {appInner}
    </div>
  );
}
