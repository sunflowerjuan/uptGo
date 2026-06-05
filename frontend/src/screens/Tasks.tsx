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
  Sheet,
  STATUS,
  SectionTitle,
  cSoftVar,
  cVar,
  subjectById,
} from '../components/UI'
import { NoteDetailModal } from './Notes'

type AnyProps = Record<string, any>

type AttachmentEntry = {
  name: string
  type: string
  size: string
  url: string
}

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

type AdvancedFilters = {
  subject: string
  priority: string
  statusFilter: string
  dueFilter: string
}

function AdvancedFiltersSheet({
  open,
  onClose,
  filters,
  onApply,
}: {
  open: boolean
  onClose: () => void
  filters: AdvancedFilters
  onApply: (f: AdvancedFilters) => void
}) {
  const [local, setLocal] = React.useState<AdvancedFilters>(filters)

  React.useEffect(() => {
    if (open) setLocal(filters)
  }, [open, filters])

  const update = <K extends keyof AdvancedFilters>(key: K, val: AdvancedFilters[K]) =>
    setLocal((prev) => ({ ...prev, [key]: val }))

  const pillBtn = (active: boolean, onClick: () => void, children: React.ReactNode) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '7px 14px',
        borderRadius: 'var(--r-full)',
        border: '1px solid ' + (active ? 'transparent' : 'var(--border)'),
        background: active ? 'var(--text)' : 'var(--surface)',
        color: active ? 'var(--bg)' : 'var(--text-2)',
        fontFamily: 'var(--font-ui)',
        fontSize: 12.5,
        fontWeight: 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )

  return (
    <Sheet open={open} onClose={onClose} title="Filtros avanzados">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Materias */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>
            MATERIAS
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {pillBtn(local.subject === 'all', () => update('subject', 'all'), 'Todas')}
            {DATA.subjects.map((s: AnyProps) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update('subject', local.subject === s.id ? 'all' : s.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 'var(--r-full)',
                  border: '1px solid ' + (local.subject === s.id ? 'transparent' : 'var(--border)'),
                  background: local.subject === s.id ? cVar(s.color) : 'var(--surface)',
                  color: local.subject === s.id ? '#fff' : 'var(--text-2)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: cVar(s.color) }} />
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Prioridad */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>
            PRIORIDAD
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {(['all', 'alta', 'media', 'baja'] as const).map((p) => (
              pillBtn(local.priority === p, () => update('priority', p),
                p === 'all' ? 'Todas' : p.charAt(0).toUpperCase() + p.slice(1))
            ))}
          </div>
        </div>

        {/* Estado */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>
            ESTADO
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {[
              ['all', 'Cualquiera'],
              ['pendiente', 'Pendiente'],
              ['en_progreso', 'En progreso'],
              ['entregada', 'Entregada'],
              ['vencida', 'Vencida'],
            ].map(([val, label]) => (
              pillBtn(local.statusFilter === val, () => update('statusFilter', val), label)
            ))}
          </div>
        </div>

        {/* Entrega */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>
            ENTREGA
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {[
              ['all', 'Cualquier fecha'],
              ['today', 'Hoy'],
              ['week', 'Esta semana'],
              ['month', 'Este mes'],
              ['overdue', 'Vencidas'],
            ].map(([val, label]) => (
              pillBtn(local.dueFilter === val, () => update('dueFilter', val), label)
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <Button
            variant="ghost"
            onClick={() => {
              const cleared: AdvancedFilters = { subject: 'all', priority: 'all', statusFilter: 'all', dueFilter: 'all' }
              setLocal(cleared)
              onApply(cleared)
              onClose()
            }}
          >
            Limpiar
          </Button>
          <Button
            variant="primary"
            icon="check"
            onClick={() => {
              onApply(local)
              onClose()
            }}
          >
            Aplicar
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

function countActiveFilters(f: AdvancedFilters): number {
  return (
    (f.subject !== 'all' ? 1 : 0) +
    (f.priority !== 'all' ? 1 : 0) +
    (f.statusFilter !== 'all' ? 1 : 0) +
    (f.dueFilter !== 'all' ? 1 : 0)
  )
}

export function Tasks({ m, tasks, onToggle, onOpenTask, onAdd }: AnyProps) {
  const [status, setStatus] = React.useState('all')
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [advFilters, setAdvFilters] = React.useState<AdvancedFilters>({
    subject: 'all',
    priority: 'all',
    statusFilter: 'all',
    dueFilter: 'all',
  })

  const activeCount = countActiveFilters(advFilters)

  const applyDueFilter = (t: AnyProps, dueFilter: string): boolean => {
    if (dueFilter === 'all') return true
    if (!t.dueDate) return dueFilter === 'overdue' ? false : true
    const due = new Date(t.dueDate)
    const now = new Date()
    if (dueFilter === 'overdue') return due < now && !t.done
    if (dueFilter === 'today') {
      return due.toDateString() === now.toDateString()
    }
    if (dueFilter === 'week') {
      const weekLater = new Date(now)
      weekLater.setDate(now.getDate() + 7)
      return due >= now && due <= weekLater
    }
    if (dueFilter === 'month') {
      return due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear()
    }
    return true
  }

  const list = tasks.filter(
    (t: AnyProps) =>
      (status === 'all' || (status === 'done' ? t.done : !t.done)) &&
      (advFilters.subject === 'all' || t.subject === advFilters.subject) &&
      (advFilters.priority === 'all' || t.priority === advFilters.priority) &&
      (advFilters.statusFilter === 'all' || t.status === advFilters.statusFilter) &&
      applyDueFilter(t, advFilters.dueFilter),
  )

  const pending = list.filter((t: AnyProps) => !t.done)
  const done = list.filter((t: AnyProps) => t.done)

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
            alignItems: 'center',
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
              alignSelf: 'stretch',
            }}
          />

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Button
              variant="soft"
              size="sm"
              icon="filter"
              onClick={() => setFiltersOpen(true)}
            >
              Filtros
            </Button>
            {activeCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-ui)',
                  pointerEvents: 'none',
                }}
              >
                {activeCount}
              </span>
            )}
          </div>
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

        {pending.map((t: AnyProps, i: number) => (
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

        {done.map((t: AnyProps, i: number) => (
          <FadeIn key={t.id} delay={120 + i * 40}>
            <TaskCard t={t} onToggle={onToggle} onOpen={onOpenTask} />
          </FadeIn>
        ))}

        {list.length === 0 && (
          <EmptyState icon="tasks" title="Sin tareas" body="No hay tareas con estos filtros." />
        )}
      </div>

      <AdvancedFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={advFilters}
        onApply={setAdvFilters}
      />
    </div>
  )
}

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (['mp3', 'wav', 'ogg', 'webm', 'm4a', 'aac'].includes(ext)) return 'mic'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image'
  if (['pdf'].includes(ext)) return 'paperclip'
  return 'paperclip'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FilePreviewModal({ attachment, m, onClose }: { attachment: AttachmentEntry; m: boolean; onClose: () => void }) {
  const icon = getFileIcon(attachment.name)
  const isImage = icon === 'image'
  const isAudio = icon === 'mic'
  const ext = attachment.name.split('.').pop()?.toLowerCase() || ''
  const isPdf = ext === 'pdf'
  const extLabel = attachment.name.split('.').pop()?.toUpperCase() || 'ARCHIVO'

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = attachment.url
    a.download = attachment.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleOpenNew = () => {
    window.open(attachment.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 130,
        background: 'oklch(0 0 0 / 0.45)',
        display: 'flex',
        alignItems: m ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: m ? 0 : 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: m ? '100%' : 680,
          maxWidth: '100%',
          maxHeight: m ? '92dvh' : 'calc(100dvh - 40px)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: m ? '22px 22px 0 0' : 22,
          boxShadow: 'var(--shadow-pop)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {attachment.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              {extLabel} · {attachment.size}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {(isImage || isPdf || isAudio) && (
              <Button variant="soft" size="sm" onClick={handleOpenNew}>
                Abrir
              </Button>
            )}
            <Button variant="soft" size="sm" onClick={handleDownload}>
              Descargar
            </Button>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
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
              <Icon name="x" size={14} />
            </button>
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {isImage && (
            <img
              src={attachment.url}
              alt={attachment.name}
              style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: 520 }}
            />
          )}
          {isAudio && (
            <div style={{ padding: 24 }}>
              <audio
                src={attachment.url}
                controls
                style={{ width: '100%', borderRadius: 'var(--r-sm)' }}
              />
            </div>
          )}
          {isPdf && (
            <iframe
              src={attachment.url}
              title={attachment.name}
              style={{ width: '100%', height: 480, border: 0, display: 'block' }}
            />
          )}
          {!isImage && !isAudio && !isPdf && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                padding: 40,
                color: 'var(--text-3)',
              }}
            >
              <Icon name="paperclip" size={40} color="var(--text-3)" />
              <p style={{ fontSize: 14, color: 'var(--text-2)', textAlign: 'center', margin: 0 }}>
                No hay vista previa para archivos {extLabel}.
              </p>
              <Button onClick={handleDownload}>Descargar archivo</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AttachmentChip({
  attachment,
  onOpen,
  onDelete,
}: {
  attachment: AttachmentEntry
  onOpen: (a: AttachmentEntry) => void
  onDelete: (a: AttachmentEntry) => void
}) {
  const icon = getFileIcon(attachment.name)
  const isImage = icon === 'image'
  const isAudio = icon === 'mic'

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
        cursor: 'pointer',
      }}
      onClick={() => onOpen(attachment)}
    >
      {isImage && attachment.url ? (
        <img
          src={attachment.url}
          alt={attachment.name}
          style={{ width: 32, height: 32, borderRadius: 'var(--r-xs)', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
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
          <Icon name={icon} size={16} />
        </span>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {attachment.name}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
          {attachment.type} · {attachment.size}
        </div>
      </div>

      {isAudio && <Icon name="play" size={16} color="var(--primary)" />}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(attachment)
        }}
        style={{
          width: 26,
          height: 26,
          borderRadius: 'var(--r-full)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'color .15s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)')}
        title="Eliminar adjunto"
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  )
}

function EditTaskSheet({ task, m, onClose, onSave }: AnyProps) {
  const [form, setForm] = React.useState({
    title: task.title || '',
    subject: task.subject || '',
    priority: task.priority || 'media',
    status: task.status || 'pendiente',
    due: task.dueDate || '',
    desc: task.desc || '',
  })

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const labelStyle: React.CSSProperties = {
    fontSize: 11.5,
    fontWeight: 600,
    color: 'var(--text-3)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: 6,
    display: 'block',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 13px',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    fontFamily: 'var(--font-ui)',
    fontSize: 13.5,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

  return (
    <Sheet open onClose={onClose} title="Editar tarea">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Título */}
        <div>
          <label style={labelStyle}>Título</label>
          <input
            style={inputStyle}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Título de la tarea"
          />
        </div>

        {/* Materia */}
        <div>
          <label style={labelStyle}>Materia</label>
          <select style={selectStyle} value={form.subject} onChange={(e) => set('subject', e.target.value)}>
            <option value="">Sin materia</option>
            {DATA.subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Prioridad */}
        <div>
          <label style={labelStyle}>Prioridad</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['alta', 'media', 'baja'] as const).map((p) => {
              const pr = PRIORITY[p]
              const active = form.priority === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  style={{
                    flex: 1,
                    padding: '9px 8px',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid ' + (active ? 'transparent' : 'var(--border)'),
                    background: active ? pr.soft : 'var(--surface-2)',
                    color: active ? pr.color : 'var(--text-2)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  {pr.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Estado */}
        <div>
          <label style={labelStyle}>Estado</label>
          <select style={selectStyle} value={form.status} onChange={(e) => set('status', e.target.value)}>
            {Object.entries(STATUS).map(([key, val]) => (
              <option key={key} value={key}>{(val as AnyProps).label}</option>
            ))}
          </select>
        </div>

        {/* Fecha de entrega */}
        <div>
          <label style={labelStyle}>Fecha de entrega</label>
          <input
            type="date"
            style={inputStyle}
            value={form.due}
            onChange={(e) => set('due', e.target.value)}
          />
        </div>

        {/* Descripción */}
        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
            value={form.desc}
            onChange={(e) => set('desc', e.target.value)}
            placeholder="Detalles de la tarea…"
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={() => onSave({
              title: form.title,
              subject: form.subject,
              priority: form.priority,
              status: form.status,
              dueDate: form.due,
              due: form.due || task.due,
              desc: form.desc,
              done: form.status === 'entregada',
            })}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

export function TaskDetail({
  m,
  task,
  onBack,
  onToggle,
  toast,
  onCreateReminder,
  taskNotes,
  onAddNote,
  onUpdateTask,
}: AnyProps) {
  if (!task) return null

  const s = subjectById(task.subject)
  const pr = PRIORITY[task.priority as keyof typeof PRIORITY] || PRIORITY.media
  const st = STATUS[task.status as keyof typeof STATUS] || STATUS.pendiente
  const [attachments, setAttachments] = React.useState<AttachmentEntry[]>([])
  const [openFile, setOpenFile] = React.useState<AttachmentEntry | null>(null)
  const [openNotePreview, setOpenNotePreview] = React.useState<AnyProps | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const subjectNotes: AnyProps[] = taskNotes || []

  const noteTypeIcon = (n: AnyProps): string => {
    const t: string = n.type || n.noteType || 'texto'
    if (t === 'audio') return 'mic'
    if (t === 'foto' || t === 'imagen') return 'image'
    if (t === 'ubicacion') return 'mapPin'
    return 'notes'
  }

  const noteTypeLabel = (n: AnyProps): string => {
    const t: string = n.type || n.noteType || 'texto'
    if (t === 'audio') return `Audio${n.duration ? ' · ' + n.duration : ''}`
    if (t === 'foto' || t === 'imagen') return 'Foto'
    if (t === 'ubicacion') return 'Ubicación'
    return 'Texto'
  }

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

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newEntries: AttachmentEntry[] = files.map((file) => ({
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'archivo',
      size: formatFileSize(file.size),
      url: URL.createObjectURL(file),
    }))
    setAttachments((prev) => [...prev, ...newEntries])
    e.target.value = ''
  }

  const handleOpenAttachment = (a: AttachmentEntry) => setOpenFile(a)
  const handleDeleteAttachment = (a: AttachmentEntry) =>
    setAttachments((prev) => prev.filter((x) => x.url !== a.url))

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

          {task.desc && (
            <p
              style={{
                fontSize: 13.5,
                color: 'var(--text-2)',
                lineHeight: 1.6,
                marginTop: 16,
              }}
            >
              {task.desc}
            </p>
          )}

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

            <Button variant="outline" icon="edit" onClick={() => setEditOpen(true)}>
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
          <SectionTitle>Archivos adjuntos</SectionTitle>

          {attachments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
              {attachments.map((a, i) => (
                <AttachmentChip
                  key={i}
                  attachment={a}
                  onOpen={handleOpenAttachment}
                  onDelete={handleDeleteAttachment}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon="paperclip" title="Sin archivos" body="Adjunta PDF, imágenes o documentos." />
          )}

          <div style={{ marginTop: attachments.length === 0 ? 12 : 4 }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFilesSelected}
            />
            <Button
              variant="soft"
              size="sm"
              icon="paperclip"
              onClick={() => fileInputRef.current?.click()}
            >
              Adjuntar archivo
            </Button>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={160}>
        <Card pad={m ? 16 : 20}>
          <SectionTitle action={onAddNote ? 'Nueva' : undefined} onAction={onAddNote}>
            Notas y apuntes
          </SectionTitle>
          {subjectNotes.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: -8, marginBottom: 12 }}>
              {subjectNotes.length} nota{subjectNotes.length !== 1 ? 's' : ''} de {s.name}
            </p>
          )}

          {subjectNotes.length === 0 ? (
            <EmptyState
              icon="notes"
              title="Sin notas vinculadas"
              body={`Aún no hay notas de ${s.name}. Créalas desde Notas.`}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {subjectNotes.map((n: AnyProps) => (
                <div
                  key={n.id}
                  onClick={() => setOpenNotePreview(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '11px 13px',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background = 'var(--surface)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background = 'var(--surface-2)')
                  }
                >
                  {(n.type === 'foto' || n.noteType === 'imagen') && n.imageUrl ? (
                    <img
                      src={n.imageUrl}
                      alt={n.title}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--r-xs)',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
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
                      <Icon name={noteTypeIcon(n)} size={15} />
                    </span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {n.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                      {noteTypeLabel(n)} · {n.date}
                    </div>
                  </div>
                  {(n.type === 'audio' || n.noteType === 'audio') && (
                    <Icon name="play" size={15} color="var(--primary)" />
                  )}
                  <Icon name="chevronRight" size={14} color="var(--text-3)" />
                </div>
              ))}
            </div>
          )}

        </Card>
      </FadeIn>

      {openFile && (
        <FilePreviewModal attachment={openFile} m={m} onClose={() => setOpenFile(null)} />
      )}

      {openNotePreview && (
        <NoteDetailModal
          note={openNotePreview}
          m={m}
          onClose={() => setOpenNotePreview(null)}
        />
      )}

      {editOpen && (
        <EditTaskSheet
          task={task}
          m={m}
          onClose={() => setEditOpen(false)}
          onSave={(changes: AnyProps) => {
            onUpdateTask?.(task.id, changes)
            setEditOpen(false)
            toast('Tarea actualizada')
          }}
        />
      )}
    </div>
  )
}
