import React from 'react'
import { DATA } from '../data/data'
import { Icon } from '../components/Icons'
import {
  Button,
  Card,
  EmptyState,
  FadeIn,
  Pill,
  cSoftVar,
  cVar,
  subjectById,
} from '../components/UI'

type AnyProps = Record<string, any>

function Waveform({ color, playing }: AnyProps) {
  const bars = [8, 14, 22, 16, 28, 12, 20, 30, 18, 10, 24, 16, 26, 14, 9, 19, 13, 22]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 30, flex: 1 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 2,
            background: color,
            opacity: playing ? 1 : 0.45,
            transition: 'opacity .3s',
            ...(playing ? { animation: `uptgo-wave 1s ${i * 0.05}s ease-in-out infinite alternate` } : {}),
          }}
        />
      ))}
    </div>
  )
}

function PhotoPlaceholder({ label }: AnyProps) {
  return (
    <div
      style={{
        height: 120,
        borderRadius: 'var(--r-sm)',
        marginBottom: 12,
        overflow: 'hidden',
        position: 'relative',
        background:
          'repeating-linear-gradient(135deg, var(--surface-2), var(--surface-2) 9px, var(--bg-tint) 9px, var(--bg-tint) 18px)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 10.5,
          color: 'var(--text-3)',
          background: 'var(--surface)',
          padding: '4px 9px',
          borderRadius: 'var(--r-full)',
          border: '1px solid var(--border)',
        }}
      >
        {label}
      </span>
    </div>
  )
}

function NoteCard({ n, onOpen }: AnyProps) {
  const s = subjectById(n.subject)
  const [playing, setPlaying] = React.useState(false)

  return (
    <Card hover pad={15} onClick={() => onOpen?.(n)} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Pill color={cVar(s.color)} bg={cSoftVar(s.color)} dot>
          {s.name}
        </Pill>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
          <Icon name={n.type === 'audio' ? 'mic' : n.type === 'foto' ? 'image' : 'notes'} size={13} />
          {n.date}
        </span>
      </div>

      {n.type === 'foto' && <PhotoPlaceholder label="apunte · foto" />}

      <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
        {n.title}
      </div>

      {n.type === 'audio' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 12, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setPlaying((p) => !p)
            }}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Icon name={playing ? 'pause' : 'play'} size={15} />
          </button>

          <Waveform color={cVar(s.color)} playing={playing} />

          <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {n.duration}
          </span>
        </div>
      ) : (
        <p
          style={{
            fontSize: 12.5,
            color: 'var(--text-2)',
            lineHeight: 1.55,
            marginTop: 7,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {n.preview}
        </p>
      )}

      {n.tags && (
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {n.tags.map((tag: string) => (
            <span
              key={tag}
              style={{
                fontSize: 10.5,
                color: 'var(--text-3)',
                background: 'var(--surface-2)',
                padding: '3px 8px',
                borderRadius: 'var(--r-full)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

export function Notes({ m, onAdd, toast }: AnyProps) {
  const [type, setType] = React.useState('all')
  const types = [
    ['all', 'Todas', 'layers'],
    ['texto', 'Texto', 'notes'],
    ['audio', 'Audio', 'mic'],
    ['foto', 'Fotos', 'image'],
  ]

  const list = DATA.notes.filter((note: any) => type === 'all' || note.type === type)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            {m && <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Notas</h1>}
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: m ? 3 : 0 }}>
              {DATA.notes.length} apuntes · guardados localmente
            </p>
          </div>

          {!m && <Button icon="plus" onClick={onAdd}>Nueva nota</Button>}
        </div>
      </FadeIn>

      <FadeIn delay={50}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {types.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setType(id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: 'var(--r-full)',
                border: '1px solid ' + (type === id ? 'transparent' : 'var(--border)'),
                background: type === id ? 'var(--text)' : 'var(--surface)',
                color: type === id ? 'var(--bg)' : 'var(--text-2)',
                fontFamily: 'var(--font-ui)',
                fontSize: 12.5,
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon name={icon} size={14} />
              {label}
            </button>
          ))}
        </div>
      </FadeIn>

      <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {list.map((n: any, i: number) => (
          <FadeIn key={n.id} delay={90 + i * 40}>
            <NoteCard n={n} onOpen={() => toast('Abrir nota: ' + n.title)} />
          </FadeIn>
        ))}
      </div>
    </div>
  )
}

function ReminderRow({ r, onToggle }: AnyProps) {
  const active = r.status === 'activo'
  const stColor: Record<string, string> = {
    activo: 'var(--ok)',
    completado: 'var(--text-3)',
    descartado: 'var(--text-3)',
  }

  return (
    <Card pad={15} style={{ display: 'flex', alignItems: 'center', gap: 13, opacity: active ? 1 : 0.7 }}>
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 'var(--r-sm)',
          background: active ? 'var(--primary-soft)' : 'var(--surface-2)',
          color: active ? 'var(--primary-text)' : 'var(--text-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="bell" size={18} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', textDecoration: r.status === 'completado' ? 'line-through' : 'none' }}>
          {r.title}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="clock" size={12} />
            {r.time}
          </span>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="refresh" size={12} />
            {r.repeat}
          </span>

          <span>· {r.lead}</span>

          <span style={{ color: stColor[r.status] || 'var(--text-3)' }}>
            {r.status}
          </span>
        </div>
      </div>

      <button
        onClick={() => onToggle(r.id)}
        title={active ? 'Pausar' : 'Activar'}
        style={{
          width: 42,
          height: 25,
          borderRadius: 'var(--r-full)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          background: active ? 'var(--primary)' : 'var(--border-strong)',
          transition: 'background .2s',
        }}
      >
        <span style={{ position: 'absolute', top: 3, left: active ? 20 : 3, width: 19, height: 19, borderRadius: '50%', background: 'var(--surface)', transition: 'left .2s var(--ease)', boxShadow: 'var(--shadow-sm)' }} />
      </button>
    </Card>
  )
}

export function Reminders({ m, reminders, onToggle, onAdd, onPomodoro }: AnyProps) {
  const [tab, setTab] = React.useState('activos')
  const list = reminders.filter((r: any) => tab === 'activos' ? r.status === 'activo' : r.status !== 'activo')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            {m && <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Recordatorios</h1>}
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: m ? 3 : 0 }}>
              {reminders.filter((r: any) => r.status === 'activo').length} activos
            </p>
          </div>

          {!m && <Button icon="plus" onClick={onAdd}>Nuevo recordatorio</Button>}
        </div>
      </FadeIn>

      <FadeIn delay={50}>
        <Card pad={m ? 16 : 18} style={{ background: 'linear-gradient(135deg, var(--primary-soft), color-mix(in oklch, var(--primary-soft) 50%, var(--surface)))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 'var(--r-md)', background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="timer" size={22} />
            </span>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Temporizador Pomodoro</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 2 }}>Sesiones de estudio enfocado · 25 / 5 min</div>
            </div>

            <Button variant="primary" size="sm" icon="play" onClick={onPomodoro}>Iniciar</Button>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={100}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', padding: 3, width: 'fit-content' }}>
          {['activos', 'historial'].map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              style={{
                padding: '7px 18px',
                borderRadius: 'var(--r-full)',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
                background: tab === value ? 'var(--surface)' : 'transparent',
                boxShadow: tab === value ? 'var(--shadow-sm)' : 'none',
                color: tab === value ? 'var(--text)' : 'var(--text-2)',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                fontWeight: tab === value ? 600 : 500,
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </FadeIn>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((r: any, i: number) => (
          <FadeIn key={r.id} delay={140 + i * 40}>
            <ReminderRow r={r} onToggle={onToggle} />
          </FadeIn>
        ))}

        {list.length === 0 && <EmptyState icon="bell" title="Nada por aquí" body="No hay recordatorios en esta vista." />}
      </div>
    </div>
  )
}