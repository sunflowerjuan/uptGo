import React from 'react'
import { DATA } from '../data/data'
import { Icon } from '../components/Icons'
import {
  Button,
  Card,
  EmptyState,
  FadeIn,
  Pill,
  PRIORITY,
  STATUS,
  SectionTitle,
  cSoftVar,
  cVar,
  subjectById,
} from '../components/UI'

type AnyProps = Record<string, any>

function FilterChip({ active, onClick, children, color }: AnyProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 13px',
        borderRadius: 'var(--r-full)',
        border: '1px solid ' + (active ? 'transparent' : 'var(--border)'),
        background: active ? color || 'var(--text)' : 'var(--surface)',
        color: active ? (color ? 'var(--on-primary)' : 'var(--bg)') : 'var(--text-2)',
        fontFamily: 'var(--font-ui)',
        fontSize: 12.5,
        fontWeight: 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all .15s var(--ease)',
      }}
    >
      {children}
    </button>
  )
}

function TaskCard({ t, onToggle, onOpen }: AnyProps) {
  const s = subjectById(t.subject)
  const pr = PRIORITY[t.priority as keyof typeof PRIORITY] || PRIORITY.media
  const st = STATUS[t.status as keyof typeof STATUS] || STATUS.pendiente

  return (
    <Card
      hover
      pad={15}
      onClick={() => onOpen(t.id)}
      style={{
        display: 'flex',
        gap: 13,
        alignItems: 'flex-start',
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle(t.id)
        }}
        style={{
          width: 21,
          height: 21,
          borderRadius: 7,
          marginTop: 1,
          flexShrink: 0,
          cursor: 'pointer',
          border: t.done ? 'none' : '1.8px solid var(--border-strong)',
          background: t.done ? 'var(--primary)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .15s var(--ease)',
        }}
      >
        {t.done && <Icon name="check" size={13} color="var(--on-primary)" stroke={3} />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 14.5,
              fontWeight: 600,
              color: t.done ? 'var(--text-3)' : 'var(--text)',
              textDecoration: t.done ? 'line-through' : 'none',
              lineHeight: 1.35,
            }}
          >
            {t.title}
          </div>

          <Icon name="chevronRight" size={16} color="var(--text-3)" style={{ marginTop: 2 }} />
        </div>

        <div
          style={{
            fontSize: 12.5,
            color: 'var(--text-3)',
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-2)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: cVar(s.color),
              }}
            />
            {s.name}
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Icon name="clock" size={13} />
            {t.dueShort}
          </span>

          {!t.done && <Pill color={pr.color} bg={pr.soft} dot>{pr.label}</Pill>}
          <Pill color={st.color} bg={st.soft}>{st.label}</Pill>

          {t.attachments > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Icon name="paperclip" size={12} />
              {t.attachments}
            </span>
          )}

          {t.notesCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Icon name="notes" size={12} />
              {t.notesCount}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

export function Tasks({ m, tasks, onToggle, onOpenTask, onAdd }: AnyProps) {
  const [subject, setSubject] = React.useState('all')
  const [status, setStatus] = React.useState('all')

  const list = tasks.filter(
    (t: any) =>
      (subject === 'all' || t.subject === subject) &&
      (status === 'all' || (status === 'done' ? t.done : !t.done)),
  )

  const pending = list.filter((t: any) => !t.done)
  const done = list.filter((t: any) => t.done)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FadeIn>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
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
                Tareas
              </h1>
            )}

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-3)',
                marginTop: m ? 3 : 0,
              }}
            >
              {pending.length} pendientes · {done.length} completadas
            </p>
          </div>

          {!m && (
            <Button icon="plus" onClick={onAdd}>
              Nueva tarea
            </Button>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            margin: '0 -2px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <FilterChip active={status === 'all'} onClick={() => setStatus('all')}>
            Todas
          </FilterChip>

          <FilterChip active={status === 'pending'} onClick={() => setStatus('pending')}>
            Pendientes
          </FilterChip>

          <FilterChip active={status === 'done'} onClick={() => setStatus('done')}>
            Completadas
          </FilterChip>

          <div
            style={{
              width: 1,
              background: 'var(--border)',
              margin: '4px 2px',
              flexShrink: 0,
            }}
          />

          <FilterChip active={subject === 'all'} onClick={() => setSubject('all')}>
            Materias
          </FilterChip>

          {DATA.subjects.map((s: any) => (
            <FilterChip
              key={s.id}
              active={subject === s.id}
              onClick={() => setSubject(subject === s.id ? 'all' : s.id)}
              color={subject === s.id ? cVar(s.color) : undefined}
            >
              {subject !== s.id && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: cVar(s.color),
                  }}
                />
              )}
              {s.name}
            </FilterChip>
          ))}
        </div>
      </FadeIn>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pending.length > 0 && (
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
              marginTop: 2,
            }}
          >
            Pendientes
          </div>
        )}

        {pending.map((t: any, i: number) => (
          <FadeIn key={t.id} delay={100 + i * 40}>
            <TaskCard t={t} onToggle={onToggle} onOpen={onOpenTask} />
          </FadeIn>
        ))}

        {done.length > 0 && (
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
              marginTop: 10,
            }}
          >
            Completadas
          </div>
        )}

        {done.map((t: any, i: number) => (
          <FadeIn key={t.id} delay={120 + i * 40}>
            <TaskCard t={t} onToggle={onToggle} onOpen={onOpenTask} />
          </FadeIn>
        ))}

        {list.length === 0 && (
          <EmptyState icon="tasks" title="Sin tareas" body="No hay tareas con estos filtros." />
        )}
      </div>
    </div>
  )
}

function NoteChip({ type, title, meta }: AnyProps) {
  const map: Record<string, string> = {
    texto: 'notes',
    audio: 'mic',
    foto: 'image',
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '11px 13px',
        background: 'var(--surface-2)',
        borderRadius: 'var(--r-sm)',
        border: '1px solid var(--border)',
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--r-xs)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-2)',
          flexShrink: 0,
        }}
      >
        <Icon name={map[type] || 'notes'} size={16} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
          {title}
        </div>

        <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
          {meta}
        </div>
      </div>

      {type === 'audio' && <Icon name="play" size={16} color="var(--primary)" />}
    </div>
  )
}

export function TaskDetail({
  m,
  task,
  onBack,
  onToggle,
  toast,
  onCreateReminder,
}: AnyProps) {
  if (!task) return null

  const s = subjectById(task.subject)
  const pr = PRIORITY[task.priority as keyof typeof PRIORITY] || PRIORITY.media
  const st = STATUS[task.status as keyof typeof STATUS] || STATUS.pendiente

  const openReminder = () => {
    onCreateReminder?.({
      id: task.id,
      type: 'tarea',
      title: task.title,
      date: task.dueDate || '',
      time: task.dueTime || '',
      subtitle: s.name,
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 760,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <FadeIn>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'var(--text-2)',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 500,
            padding: 0,
          }}
        >
          <Icon name="arrowLeft" size={16} />
          Volver a tareas
        </button>
      </FadeIn>

      <FadeIn delay={50}>
        <Card pad={m ? 18 : 24}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <Pill color={cVar(s.color)} bg={cSoftVar(s.color)} dot>
              {s.name}
            </Pill>

            <Pill color={pr.color} bg={pr.soft}>
              Prioridad {pr.label}
            </Pill>

            <Pill color={st.color} bg={st.soft}>
              {st.label}
            </Pill>
          </div>

          <h1
            style={{
              fontSize: m ? 21 : 25,
              fontWeight: 600,
              color: 'var(--text)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              fontFamily: 'var(--font-display)',
            }}
          >
            {task.title}
          </h1>

          <div
            style={{
              display: 'flex',
              gap: 20,
              flexWrap: 'wrap',
              marginTop: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Entrega
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: 'var(--text)',
                  fontWeight: 500,
                  marginTop: 3,
                }}
              >
                {task.due}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Docente
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: 'var(--text)',
                  fontWeight: 500,
                  marginTop: 3,
                }}
              >
                {s.teacher}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Aula
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: 'var(--text)',
                  fontWeight: 500,
                  marginTop: 3,
                }}
              >
                {s.room}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <Button
              variant={task.done ? 'outline' : 'primary'}
              icon={task.done ? 'refresh' : 'check'}
              onClick={() => {
                onToggle(task.id)
                toast(task.done ? 'Tarea reabierta' : '¡Tarea completada!')
              }}
            >
              {task.done ? 'Reabrir tarea' : 'Marcar entregada'}
            </Button>

            <Button variant="outline" icon="edit" onClick={() => toast('Editor de tarea')}>
              Editar
            </Button>

            <Button variant="outline" icon="bell" onClick={openReminder}>
              Recordar
            </Button>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={110}>
        <Card pad={m ? 16 : 20}>
          <SectionTitle>Descripción</SectionTitle>

          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {task.desc}
          </p>
        </Card>
      </FadeIn>

      <FadeIn delay={160}>
        <Card pad={m ? 16 : 20}>
          <SectionTitle>Archivos adjuntos</SectionTitle>

          {task.attachments > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <NoteChip type="foto" title="enunciado_proyecto.pdf" meta="PDF · 1.2 MB" />

              {task.attachments > 1 && (
                <NoteChip
                  type="foto"
                  title="plantilla_modelo_er.png"
                  meta="Imagen · 480 KB"
                />
              )}
            </div>
          ) : (
            <EmptyState icon="paperclip" title="Sin archivos" body="Adjunta PDF, imágenes o documentos." />
          )}

          <div style={{ marginTop: 12 }}>
            <Button
              variant="soft"
              size="sm"
              icon="paperclip"
              onClick={() => toast('Adjuntar archivo')}
            >
              Adjuntar archivo
            </Button>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={210}>
        <Card pad={m ? 16 : 20}>
          <SectionTitle>Notas y apuntes</SectionTitle>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <NoteChip type="texto" title="Ideas para el modelo E/R" meta="Texto · 7 may" />
            <NoteChip type="audio" title="Explicación de la tutoría" meta="Audio · 4:12 · 7 may" />
            <NoteChip type="foto" title="Diagrama del tablero" meta="Foto · 6 may" />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Button variant="soft" size="sm" icon="notes" onClick={() => toast('Nueva nota de texto')}>
              Texto
            </Button>

            <Button variant="soft" size="sm" icon="mic" onClick={() => toast('Grabando audio…')}>
              Audio
            </Button>

            <Button variant="soft" size="sm" icon="camera" onClick={() => toast('Abriendo cámara…')}>
              Foto
            </Button>
          </div>
        </Card>
      </FadeIn>
    </div>
  )
}