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

export function Reminders({ m, reminders, onToggle, onAdd, toast, }: AnyProps) {
  const [tab, setTab] = React.useState<'activos' | 'historial'>('activos')
  const [items, setItems] = React.useState(reminders || [])
  const [editing, setEditing] = React.useState<any | null>(null)
  const [editTitle, setEditTitle] = React.useState('')
  const [editTime, setEditTime] = React.useState('')
  const [editBefore, setEditBefore] = React.useState('15')

  React.useEffect(() => {
    setItems(reminders || [])
  }, [reminders])

  const visibleItems = items.filter((item: any) =>
    tab === 'activos'
      ? item.status === 'activo'
      : item.status !== 'activo',
  )

  const openEdit = (item: any) => {
    setEditing(item)
    setEditTitle(item.title || '')
    setEditTime(item.time || '08:00')
    setEditBefore(item.before || item.notifyBefore || '15')
  }

  const closeEdit = () => {
    setEditing(null)
    setEditTitle('')
    setEditTime('')
    setEditBefore('15')
  }

  const saveEdit = () => {
    if (!editTitle.trim()) {
      toast?.('El título es obligatorio')
      return
    }

    setItems((current: any[]) =>
      current.map((item) =>
        item.id === editing.id
          ? {
            ...item,
            title: editTitle.trim(),
            time: editTime,
            before: editBefore,
            notifyBefore: editBefore,
          }
          : item,
      ),
    )

    toast?.('Recordatorio actualizado')
    closeEdit()
  }

  const toggleReminder = (item: any) => {
    setItems((current: any[]) =>
      current.map((reminder) =>
        reminder.id === item.id
          ? {
            ...reminder,
            status: reminder.status === 'activo' ? 'completado' : 'activo',
          }
          : reminder,
      ),
    )

    onToggle?.(item.id)

    toast?.(
      item.status === 'activo'
        ? 'Recordatorio desactivado'
        : 'Recordatorio activado',
    )
  }

  const deleteReminder = (item: any) => {
    setItems((current: any[]) =>
      current.filter((reminder) => reminder.id !== item.id),
    )

    toast?.('Recordatorio eliminado')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <FadeIn>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            {m && (
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.02em',
                }}
              >
                Recordatorios
              </h1>
            )}

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-3)',
                marginTop: m ? 3 : 0,
              }}
            >
              Gestiona avisos ligados a tareas, eventos o clases.
            </p>
          </div>

          {!m && (
            <Button icon="plus" onClick={onAdd}>
              Crear recordatorio
            </Button>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          {(['activos', 'historial'] as const).map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              style={{
                padding: '9px 18px',
                borderRadius: 'var(--r-full)',
                border: '1px solid var(--border)',
                background: tab === value ? 'var(--surface)' : 'transparent',
                boxShadow: tab === value ? 'var(--shadow-sm)' : 'none',
                color: tab === value ? 'var(--text)' : 'var(--text-2)',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                fontWeight: tab === value ? 700 : 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {visibleItems.length > 0 ? (
            visibleItems.map((item: any) => {
              const active = item.status === 'activo'

              return (
                <Card
                  key={item.id}
                  pad={m ? 14 : 16}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 'var(--r-sm)',
                      background: active
                        ? 'var(--primary-soft)'
                        : 'var(--surface-2)',
                      color: active
                        ? 'var(--primary-text)'
                        : 'var(--text-3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="bell" size={18} />
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        marginTop: 5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                        fontSize: 12,
                        color: 'var(--text-3)',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Icon name="clock" size={12} />
                        {item.date || item.when || 'Sin fecha'} ·{' '}
                        {item.time || 'Sin hora'}
                      </span>

                      <span>↻ {item.repeat || 'Única'}</span>

                      <span>
                        · {item.before || item.notifyBefore || '15'} min antes
                      </span>

                      <span
                        style={{
                          color: active ? 'var(--primary-text)' : 'var(--text-3)',
                          fontWeight: 700,
                        }}
                      >
                        {active ? 'activo' : 'inactivo'}
                      </span>
                    </div>

                    {item.parentTitle && (
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 11.5,
                          color: 'var(--text-3)',
                        }}
                      >
                        Ligado a {item.parentType}: {item.parentTitle}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => openEdit(item)}
                      title="Editar recordatorio"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--r-full)',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="edit" size={15} />
                    </button>

                    <button
                      onClick={() => deleteReminder(item)}
                      title="Eliminar recordatorio"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--r-full)',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="trash" size={15} />
                    </button>

                    <button
                      onClick={() => toggleReminder(item)}
                      title={active ? 'Desactivar' : 'Activar'}
                      style={{
                        width: 54,
                        height: 30,
                        borderRadius: 'var(--r-full)',
                        border: 'none',
                        background: active
                          ? 'var(--primary)'
                          : 'var(--border-strong)',
                        position: 'relative',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: active ? 28 : 4,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'var(--surface)',
                          transition: 'left .2s var(--ease)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      />
                    </button>
                  </div>
                </Card>
              )
            })
          ) : (
            <EmptyState
              icon="bell"
              title={
                tab === 'activos'
                  ? 'Sin recordatorios activos'
                  : 'Sin historial'
              }
              body={
                tab === 'activos'
                  ? 'Crea un recordatorio ligado a una tarea, evento o clase.'
                  : 'Los recordatorios desactivados o completados aparecerán aquí.'
              }
            />
          )}
        </div>
      </FadeIn>

      {editing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'oklch(0 0 0 / 0.24)',
            display: 'flex',
            alignItems: m ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: m ? '0 14px 18px' : 20,
          }}
          onClick={closeEdit}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: m ? '100%' : 430,
              maxWidth: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 22,
              boxShadow: 'var(--shadow-pop)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 20px 14px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--text)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Editar recordatorio
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-3)',
                    marginTop: 2,
                  }}
                >
                  Ajusta los datos del recordatorio.
                </div>
              </div>

              <button
                onClick={closeEdit}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--r-full)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="x" size={15} />
              </button>
            </div>

            <div
              style={{
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-2)',
                }}
              >
                Título

                <input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  style={{
                    height: 42,
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    color: 'var(--text)',
                    padding: '0 12px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </label>

              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-2)',
                }}
              >
                Hora

                <input
                  type="time"
                  value={editTime}
                  onChange={(event) => setEditTime(event.target.value)}
                  style={{
                    height: 42,
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    color: 'var(--text)',
                    padding: '0 12px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </label>

              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-2)',
                }}
              >
                Notificar antes

                <select
                  value={editBefore}
                  onChange={(event) => setEditBefore(event.target.value)}
                  style={{
                    height: 42,
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    color: 'var(--text)',
                    padding: '0 12px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                >
                  <option value="5">5 minutos antes</option>
                  <option value="10">10 minutos antes</option>
                  <option value="15">15 minutos antes</option>
                  <option value="30">30 minutos antes</option>
                  <option value="60">1 hora antes</option>
                  <option value="1440">1 día antes</option>
                  <option value="2880">2 días antes</option>
                  <option value="4320">3 días antes</option>
                </select>
              </label>
            </div>

            <div
              style={{
                padding: 18,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <Button variant="ghost" onClick={closeEdit}>
                Cancelar
              </Button>

              <Button variant="primary" icon="check" onClick={saveEdit}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}