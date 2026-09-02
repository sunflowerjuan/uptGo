import React from 'react'
import { Button } from './UI'
import { Icon } from './Icons'

export type ReminderParentType = 'tarea' | 'evento' | 'clase'

export type ReminderParent = {
  id: string | number
  type: ReminderParentType
  title: string
  date?: string
  time?: string
  subtitle?: string
}

type CreateReminderModalProps = {
  open: boolean
  parent?: ReminderParent | null
  tasks?: any[]
  events?: any[]
  scheduleBlocks?: any[]
  onClose: () => void
  onCreated?: (reminder: any) => void
}

const DEFAULT_FORM = {
  parentKey: '',
  title: '',
  description: '',
  notifyBefore: '15',
  date: '',
  time: '08:00',
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    height: 42,
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    padding: '0 12px',
    fontFamily: 'var(--font-ui)',
    fontSize: 14,
    outline: 'none',
  }
}

function textareaStyle(): React.CSSProperties {
  return {
    width: '100%',
    minHeight: 84,
    resize: 'vertical',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    padding: '10px 12px',
    fontFamily: 'var(--font-ui)',
    fontSize: 14,
    outline: 'none',
    lineHeight: 1.4,
  }
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-2)',
        }}
      >
        {label}
      </span>

      {children}
    </label>
  )
}

function getParentKey(parent: ReminderParent) {
  return `${parent.type}:${parent.id}`
}

function buildParentOptions(tasks: any[], events: any[], scheduleBlocks: any[]): ReminderParent[] {
  const taskParents: ReminderParent[] = tasks.map((task: any) => ({
    id: task.id,
    type: 'tarea' as const,
    title: task.title,
    date: task.dueDate || task.dueShort || '',
    time: task.dueTime || '',
    subtitle: task.subject ? 'Tarea académica' : 'Tarea',
  }))

  const eventParents: ReminderParent[] = events.map((event: any) => ({
    id: event.id,
    type: 'evento' as const,
    title: event.title,
    date: event.date || '',
    time: event.time || '',
    subtitle: event.loc || event.location || 'Evento',
  }))

  const seenBlocks = new Set<string>()
  const classParents: ReminderParent[] = scheduleBlocks
    .filter((block: any) => {
      const key = `${block.day}-${block.start}-${block.subject || block.title}`
      if (seenBlocks.has(key)) return false
      seenBlocks.add(key)
      return true
    })
    .map((block: any) => ({
      id: block.id || `class-${block.day}-${block.start}`,
      type: 'clase' as const,
      title: block.subjectData?.name || block.title || 'Clase',
      time: `${String(block.start).padStart(2, '0')}:00`,
      subtitle: block.room || 'Clase académica',
    }))

  return [...taskParents, ...eventParents, ...classParents]
}

export function CreateReminderModal({
  open,
  parent,
  tasks = [],
  events = [],
  scheduleBlocks = [],
  onClose,
  onCreated,
}: CreateReminderModalProps) {
  const parentOptions = React.useMemo(
    () => buildParentOptions(tasks, events, scheduleBlocks),
    [tasks, events, scheduleBlocks],
  )
  const [form, setForm] = React.useState(DEFAULT_FORM)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (!open) return

    setError('')

    setForm({
      ...DEFAULT_FORM,
      parentKey: parent ? getParentKey(parent) : '',
      title: parent ? `Recordar: ${parent.title}` : '',
      date: parent?.date || '',
      time: parent?.time || '08:00',
    })
  }, [open, parent])

  if (!open) return null

  const selectedParent =
    parent ||
    parentOptions.find((item) => getParentKey(item) === form.parentKey) ||
    null

  const update = <K extends keyof typeof DEFAULT_FORM>(
    key: K,
    value: (typeof DEFAULT_FORM)[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const validate = () => {
    if (!selectedParent) {
      return 'Selecciona una tarea, evento o clase para asociar el recordatorio.'
    }

    if (!form.title.trim()) {
      return 'El título del recordatorio es obligatorio.'
    }

    return ''
  }

  const handleSave = () => {
    const validationMessage = validate()

    if (validationMessage) {
      setError(validationMessage)
      return
    }

    const reminder = {
      id: `reminder-${Date.now()}`,
      type: 'recordatorio',
      title: form.title.trim(),
      description: form.description.trim(),
      notifyBefore: form.notifyBefore,
      date: form.date,
      time: form.time,
      status: 'activo',
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
      parentId: selectedParent!.id,
      parentType: selectedParent!.type,
      parentTitle: selectedParent!.title,
      parentSubtitle: selectedParent!.subtitle || '',
    }

    onCreated?.(reminder)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 130,
        background: 'oklch(0 0 0 / 0.24)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
      }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 520,
          maxWidth: '100%',
          maxHeight: 'calc(100dvh - 36px)',
          overflow: 'hidden',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          boxShadow: 'var(--shadow-pop)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--r-md)',
                background: 'var(--primary-soft)',
                color: 'var(--primary-text)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="bell" size={19} />
            </span>

            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Crear recordatorio
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-3)',
                  marginTop: 2,
                }}
              >
                Debe estar ligado a una tarea, evento o clase.
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--r-full)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div
          style={{
            padding: 18,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 13,
          }}
        >
          {error && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--danger-soft)',
                color: 'var(--danger)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {parent ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 13,
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary-text)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon
                  name={
                    parent.type === 'tarea'
                      ? 'tasks'
                      : parent.type === 'clase'
                        ? 'clock'
                        : 'calendar'
                  }
                  size={17}
                />
              </span>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text)',
                  }}
                >
                  {parent.title}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-3)',
                    marginTop: 2,
                  }}
                >
                  Ligado a {parent.type}
                </div>
              </div>
            </div>
          ) : (
            <Field label="Ligar recordatorio a">
              <select
                value={form.parentKey}
                onChange={(event) => update('parentKey', event.target.value)}
                style={inputStyle()}
              >
                <option value="">Selecciona una tarea, evento o clase</option>

                {parentOptions.map((item) => (
                  <option key={getParentKey(item)} value={getParentKey(item)}>
                    {item.type.toUpperCase()} · {item.title}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Título del recordatorio">
            <input
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder="Ej: Repasar antes de entregar"
              style={inputStyle()}
            />
          </Field>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
            className="create-form-two-cols"
          >
            <Field label="Notificar antes">
              <select
                value={form.notifyBefore}
                onChange={(event) => update('notifyBefore', event.target.value)}
                style={inputStyle()}
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
            </Field>

            <Field label="Hora">
              <input
                type="time"
                value={form.time}
                onChange={(event) => update('time', event.target.value)}
                style={inputStyle()}
              />
            </Field>
          </div>

          <Field label="Nota">
            <textarea
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Ej: Llevar portátil, revisar rúbrica, preparar lectura..."
              style={textareaStyle()}
            />
          </Field>
        </div>

        <div
          style={{
            padding: 18,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            background: 'var(--surface)',
          }}
        >
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>

          <Button variant="primary" icon="bell" onClick={handleSave}>
            Crear recordatorio
          </Button>
        </div>
      </div>
    </div>
  )
}