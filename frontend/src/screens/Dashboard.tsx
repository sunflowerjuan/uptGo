import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Icon } from '../components/Icons'
import { Button, Card, FadeIn, Pill, PRIORITY, SectionTitle, cSoftVar, cVar, subjectById, } from '../components/UI'

type AnyProps = Record<string, any>

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function todayLabel() {
  const d = new Date()
  return `${DAYS_ES[d.getDay()].charAt(0).toUpperCase() + DAYS_ES[d.getDay()].slice(1)}, ${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`
}

function timeLeft(dueDate: string, dueTime?: string): string {
  const target = dueTime
    ? new Date(`${dueDate}T${dueTime}`)
    : new Date(`${dueDate}T23:59:00`)
  const diffMs = target.getTime() - Date.now()
  if (diffMs <= 0) return 'vencida'
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''}`
  const days = Math.floor(hours / 24)
  return `${days} día${days > 1 ? 's' : ''}`
}

function getSoonestTask(tasks: any[]): any | null {
  const today = new Date().toISOString().slice(0, 10)
  return tasks
    .filter((t) => !t.done && t.dueDate && t.dueDate >= today)
    .sort((a, b) => {
      const aMs = new Date(a.dueTime ? `${a.dueDate}T${a.dueTime}` : `${a.dueDate}T23:59`).getTime()
      const bMs = new Date(b.dueTime ? `${b.dueDate}T${b.dueTime}` : `${b.dueDate}T23:59`).getTime()
      return aMs - bMs
    })[0] ?? null
}

// JS getDay(): 0=Sun → appDay 6; 1=Mon → 0; ... 6=Sat → 5
const jsToAppDay = (jsDay: number) => (jsDay === 0 ? 6 : jsDay - 1)

function getTodayBlocks(scheduleBlocks: any[]): any[] {
  const appDay = jsToAppDay(new Date().getDay())
  return scheduleBlocks
    .filter((b) => Number(b.day) === appDay)
    .sort((a, b) => a.start - b.start)
}

/** Días consecutivos (hoy o ayer hacia atrás) con al menos una tarea completada. */
function computeStreak(tasks: any[]): number {
  const completedDays = new Set(
    tasks
      .filter((t) => t.done && t.updatedAt)
      .map((t) => String(t.updatedAt).slice(0, 10)),
  )

  if (completedDays.size === 0) return 0

  const dayKey = (offset: number) => {
    const d = new Date()
    d.setDate(d.getDate() - offset)
    return d.toISOString().slice(0, 10)
  }

  // La racha sigue viva si hubo actividad hoy o ayer, para que no se resetee a medianoche.
  let offset = completedDays.has(dayKey(0)) ? 0 : 1
  let streak = 0
  while (completedDays.has(dayKey(offset))) {
    streak++
    offset++
  }

  return streak
}

function MetricCard({ icon, color, label, value, sub, onClick }: AnyProps) {
  return (
    <Card hover={!!onClick} onClick={onClick} pad={16} style={{ width: '100%', minWidth: 0, maxWidth: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 0, }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: cSoftVar(color), color: cVar(color), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={16} stroke={2} />
        </span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{label}</div>
      <div style={{
        fontSize: 'clamp(22px, 7vw, 28px)', fontWeight: 500, color: 'var(--text)', lineHeight: 1.1, marginTop: 4, fontFamily: 'var(--font-display)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>
    </Card>
  )
}

function DashTaskRow({ t, onToggle, onOpen }: AnyProps) {
  const s = subjectById(t.subject)
  const pr = PRIORITY[t.priority as keyof typeof PRIORITY] || PRIORITY.media

  return (
    <div style={{ width: '100%', minWidth: 0, display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 0', borderBottom: '1px solid var(--border)', overflow: 'hidden', }}>
      <button onClick={(e) => { e.stopPropagation(); onToggle(t.id) }} style={{
        width: 19, height: 19, borderRadius: 6, marginTop: 1, flexShrink: 0, cursor: 'pointer',
        border: t.done ? 'none' : '1.8px solid var(--border-strong)', background: t.done ? 'var(--primary)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s var(--ease)',
      }}>
        {t.done && <Icon name="check" size={12} color="var(--on-primary)" stroke={3} />}
      </button>

      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onOpen(t.id)}>
        <div style={{ fontSize: 13.5, color: t.done ? 'var(--text-3)' : 'var(--text)', textDecoration: t.done ? 'line-through' : 'none', fontWeight: 500, lineHeight: 1.35, overflowWrap: 'anywhere', }}>
          {t.title}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: cVar(s.color) }} />
            {s.name}
          </span>
          <span>· {t.dueShort}</span>
          {!t.done && <Pill color={pr.color} bg={pr.soft}>{pr.label}</Pill>}
        </div>
      </div>
    </div>
  )
}

function EventRow({ e, last }: AnyProps) {
  const s = subjectById(e.subject)

  return (
    <div style={{
      width: '100%', minWidth: 0, display: 'flex', gap: 12, padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--border)', overflow: 'hidden',
    }}>
      <div style={{ minWidth: 46, fontSize: 12, color: 'var(--text-2)', fontWeight: 600, paddingTop: 1, fontFamily: 'var(--font-display)' }}>{e.time}</div>
      <div style={{ width: 3, borderRadius: 3, background: cVar(s.color), flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 500, overflowWrap: 'anywhere', }}>  {e.title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icon name={e.type === 'asesoria' ? 'globe' : 'mapPin'} size={12} />
          {e.loc} · {e.dur}
        </div>
      </div>
    </div>
  )
}

function ScheduleRow({ b, last }: AnyProps) {
  const color = b.subjectData?.color ?? b.color ?? 1
  const name = b.subjectData?.name || b.title || 'Clase'
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div style={{ width: '100%', minWidth: 0, display: 'flex', gap: 12, padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ minWidth: 46, fontSize: 12, color: 'var(--text-2)', fontWeight: 600, paddingTop: 1, fontFamily: 'var(--font-display)' }}>{pad(b.start)}:00</div>
      <div style={{ width: 3, borderRadius: 3, background: cVar(color), flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 500, overflowWrap: 'anywhere' }}>{name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icon name="mapPin" size={12} />
          {b.room || 'Sin aula'} · hasta {pad(b.end)}:00
        </div>
      </div>
    </div>
  )
}

function HeroFocus({ m, tasks, onOpenTask, go }: AnyProps) {
  const task = getSoonestTask(tasks)
  if (!task) {
    return (
      <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', position: 'relative', background: 'linear-gradient(145deg, var(--primary), var(--primary-hover))', color: 'var(--on-primary)', padding: m ? '20px' : '28px 30px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ position: 'relative', zIndex: 1, fontSize: 15, opacity: 0.9 }}>Sin entregas próximas. ¡Todo al día!</div>
      </div>
    )
  }
  const left = timeLeft(task.dueDate, task.dueTime)
  return (
    <div style={{
      borderRadius: 'var(--r-lg)', overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(145deg, var(--primary), var(--primary-hover))', color: 'var(--on-primary)',
      padding: m ? '20px' : '28px 30px', boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ position: 'absolute', top: -60, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'oklch(1 0 0 / 0.08)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Lo próximo · ahora</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: m ? 22 : 28, fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Entrega: {task.title}
            </div>
            <div style={{ fontSize: 14, opacity: 0.92, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="clock" size={16} color="#fff" />
              {task.dueDate}{task.dueTime ? ` ${task.dueTime}` : ''} · quedan {left}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <button onClick={() => onOpenTask(task.id)} style={{ padding: '11px 18px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', background: 'var(--surface)', color: 'var(--primary-text)', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>Ver tarea</button>
            <button onClick={() => go('schedule')} style={{ padding: '11px 16px', borderRadius: 'var(--r-sm)', border: '1.5px solid oklch(1 0 0 / 0.4)', cursor: 'pointer', background: 'transparent', color: '#fff', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>Horario</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniMapCard({ onClick }: AnyProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'denied'>('loading')

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('denied')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setStatus('ready')
      },
      () => {
        setStatus('denied')
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 1000 * 60 * 5,
      },
    )
  }, [])

  const mapQuery = coords
    ? `${coords.lat},${coords.lng}`
    : 'Universidad Pedagógica y Tecnológica de Colombia Tunja'

  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=17&output=embed`

  return (
    <Card
      hover
      onClick={onClick}
      pad={0}
      style={{
        overflow: 'hidden',
        minHeight: 150,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 150,
          background: 'var(--bg-tint)',
          overflow: 'hidden',
        }}
      >
        <iframe
          title="Mini mapa de ubicación actual"
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{
            width: '100%',
            height: '100%',
            minHeight: 150,
            border: 0,
            display: 'block',
            filter: 'saturate(0.85) contrast(0.95)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, transparent 45%, color-mix(in oklch, var(--surface) 82%, transparent) 100%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            padding: '10px 12px',
            borderRadius: 'var(--r-sm)',
            background: 'color-mix(in oklch, var(--surface) 88%, transparent)',
            border: '1px solid color-mix(in oklch, var(--border) 70%, transparent)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 'var(--r-sm)',
              background: coords ? 'var(--primary-soft)' : 'var(--surface-2)',
              color: coords ? 'var(--primary-text)' : 'var(--text-3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="mapPin" size={15} stroke={2} />
          </span>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              {status === 'ready'
                ? 'Ubicación actual'
                : status === 'loading'
                  ? 'Ubicando...'
                  : 'Mapa'}
            </div>

            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text)',
                marginTop: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {status === 'ready'
                ? 'Estás aquí'
                : status === 'loading'
                  ? 'Buscando ubicación'
                  : 'Vista del campus'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
export function Dashboard({ m, go, tasks, events = [], scheduleBlocks = [], onToggle, onOpenTask, variant = 'resumen' }: AnyProps) {
  const { user } = useAuth()
  const upcoming = tasks.filter((t: any) => !t.done).slice(0, 4)
  const pend = tasks.filter((t: any) => !t.done).length
  const altas = tasks.filter((t: any) => !t.done && t.priority === 'alta').length
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const enfoque = variant === 'enfoque'
  const soonest = getSoonestTask(tasks)
  const todayBlocks = getTodayBlocks(scheduleBlocks)
  const streak = computeStreak(tasks)

  return (
    <div
      style={{
        width: '100%', minWidth: 0, maxWidth: '100%', overflowX: 'clip', display: 'flex', flexDirection: 'column', gap: m ? 14 : 20,
      }}
    >
      <FadeIn>
        <div
          style={{ width: '100%', minWidth: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', }}
        >
          <div>
            <h1 style={{ fontSize: m ? 22 : 25, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
              {greet}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{todayLabel()}</p>
          </div>
          {!m && user?.semester && <Pill color="var(--primary-text)" bg="var(--primary-soft)" style={{ fontSize: 12, padding: '6px 13px' }}>{user.semester}</Pill>}
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        {enfoque ? (
          <HeroFocus m={m} tasks={tasks} onOpenTask={onOpenTask} go={go} />
        ) : soonest ? (
          <div
            style={{
              width: '100%', minWidth: 0, maxWidth: '100%', display: 'flex',
              alignItems: m ? 'flex-start' : 'center', gap: 11, padding: m ? '12px' : '13px 16px',
              borderRadius: 'var(--r-md)', background: 'var(--primary-soft)',
              border: '1px solid color-mix(in oklch, var(--primary) 18%, transparent)', overflow: 'hidden',
            }}
          >
            <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="flag" size={17} stroke={2} />
            </span>
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--primary-text)', lineHeight: 1.4, overflowWrap: 'anywhere' }}>
              <strong style={{ fontWeight: 600 }}>Próxima entrega:</strong> {soonest.title} — quedan <strong>{timeLeft(soonest.dueDate, soonest.dueTime)}</strong>.
            </div>
            {!m && <Button size="sm" variant="primary" onClick={() => onOpenTask(soonest.id)}>Ver tarea</Button>}
          </div>
        ) : null}
      </FadeIn>

      <FadeIn delay={120}>
        <div
          style={{
            width: '100%',
            minWidth: 0,
            display: 'grid',
            gridTemplateColumns: m
              ? 'repeat(2, minmax(0, 1fr))'
              : 'repeat(4, minmax(0, 1fr))',
            gap: m ? 10 : 14,
          }}
        >
          <MetricCard icon="tasks" color={1} label="Pendientes" value={pend} sub={`${altas} de alta prioridad`} onClick={() => go('tasks')} />
          <MetricCard icon="clock" color={2} label="Eventos hoy" value={events.length} sub="Guardados localmente" onClick={() => go('calendar')} />
          {!m && <MiniMapCard onClick={() => go('map')} />}
          <MetricCard
            icon="flame"
            color={4}
            label="Racha"
            value={`${streak} d`}
            sub={streak > 0 ? '¡Sigue así!' : 'Completa una tarea hoy'}
          />
        </div>
      </FadeIn>

      <div style={{ width: '100%', minWidth: 0, display: 'grid', gridTemplateColumns: m ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: m ? 14 : 16, }}>
        <FadeIn delay={180}>
          <Card pad={m ? 16 : 18}>
            <SectionTitle action="Ver todas" onAction={() => go('tasks')}>Tareas próximas</SectionTitle>
            <div>{upcoming.map((t: any) => <DashTaskRow key={t.id} t={t} onToggle={onToggle} onOpen={onOpenTask} />)}</div>
          </Card>
        </FadeIn>

        <FadeIn delay={240}>
          <Card pad={m ? 16 : 18}>
            <SectionTitle action="Calendario" onAction={() => go('calendar')}>Eventos de hoy</SectionTitle>
            <div>{events.map((e: any, i: number) => <EventRow key={e.id} e={e} last={i === events.length - 1} />)}</div>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={300}>
        <Card pad={m ? 16 : 18}>
          <SectionTitle action="Ver horario" onAction={() => go('schedule')}>
            Clases de hoy
          </SectionTitle>

          <div>
            {todayBlocks.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '10px 0' }}>Sin clases programadas para hoy.</div>
            ) : (
              todayBlocks.slice(0, 4).map((b: any, i: number) => (
                <ScheduleRow key={b.id ?? `${b.day}-${b.start}`} b={b} last={i === Math.min(todayBlocks.length, 4) - 1} />
              ))
            )}
          </div>
        </Card>
      </FadeIn>
    </div>
  )
}
