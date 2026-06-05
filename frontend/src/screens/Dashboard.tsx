import { DATA } from '../data/data'
import { useEffect, useState } from 'react'
import { Icon } from '../components/Icons'
import { Button, Card, FadeIn, Pill, PRIORITY, SectionTitle, cSoftVar, cVar, subjectById, } from '../components/UI'

type AnyProps = Record<string, any>

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

function HeroFocus({ m, onOpenTask, go }: AnyProps) {
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
              Entrega: Proyecto de Bases de Datos
            </div>
            <div style={{ fontSize: 14, opacity: 0.92, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="clock" size={16} color="#fff" />
              Hoy 11:59 p.m. · quedan 3 horas
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <button onClick={() => onOpenTask('t1')} style={{ padding: '11px 18px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', background: 'var(--surface)', color: 'var(--primary-text)', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>Ver tarea</button>
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
export function Dashboard({ m, go, tasks, events = [], onToggle, onOpenTask, variant = 'resumen' }: AnyProps) {
  const upcoming = tasks.filter((t: any) => !t.done).slice(0, 4)
  const pend = tasks.filter((t: any) => !t.done).length
  const altas = tasks.filter((t: any) => !t.done && t.priority === 'alta').length
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const enfoque = variant === 'enfoque'

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
              {greet}, {DATA.user.short.split(' ')[0]}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>Viernes, 8 de mayo de 2026</p>
          </div>
          {!m && <Pill color="var(--primary-text)" bg="var(--primary-soft)" style={{ fontSize: 12, padding: '6px 13px' }}>{DATA.user.semester}</Pill>}
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        {enfoque ? (
          <HeroFocus m={m} onOpenTask={onOpenTask} go={go} />
        ) : (
          <div
            style={{
              width: '100%',
              minWidth: 0,
              maxWidth: '100%',
              display: 'flex',
              alignItems: m ? 'flex-start' : 'center',
              gap: 11,
              padding: m ? '12px' : '13px 16px',
              borderRadius: 'var(--r-md)',
              background: 'var(--primary-soft)',
              border: '1px solid color-mix(in oklch, var(--primary) 18%, transparent)',
              overflow: 'hidden',
            }}
          >
            <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="flag" size={17} stroke={2} />
            </span>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 13,
                color: 'var(--primary-text)',
                lineHeight: 1.4,
                overflowWrap: 'anywhere',
              }}
            >
              <strong style={{ fontWeight: 600 }}>Entrega hoy:</strong> Proyecto de Bases de Datos · 11:59 p.m. — quedan <strong>3 horas</strong>.
            </div>
            {!m && <Button size="sm" variant="primary" onClick={() => onOpenTask('t1')}>Ver tarea</Button>}
          </div>
        )}
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
          <MetricCard icon="flame" color={4} label="Racha" value={`${DATA.user.streak} d`} sub="¡Sigue así!" />
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
            Próximas clases
          </SectionTitle>

          <div>
            {events.slice(0, 4).map((e: any, i: number) => (
              <EventRow key={e.id} e={e} last={i === 3} />
            ))}
          </div>
        </Card>
      </FadeIn>
    </div>
  )
}
