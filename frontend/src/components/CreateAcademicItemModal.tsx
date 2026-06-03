import React from 'react'
import { DATA } from '../data/data'
import { Button } from './UI'
import { Icon } from './Icons'

export type CreateItemType = 'evento' | 'tarea' | 'clase' | 'nota'

type CreateAcademicItemModalProps = {
    open: boolean
    type: CreateItemType
    initialDate?: string | null
    onClose: () => void
    onCreated?: (item: any) => void
}

const TYPE_LABEL: Record<CreateItemType, string> = {
    evento: 'Crear evento',
    tarea: 'Crear tarea',
    clase: 'Crear clase',
    nota: 'Crear nota',
}

const TYPE_ICON: Record<CreateItemType, string> = {
    evento: 'calendar',
    tarea: 'tasks',
    clase: 'clock',
    nota: 'notes',
}

const DEFAULT_FORM = {
    title: '',
    description: '',
    subject: '',
    subjectMode: 'existing',
    newSubjectName: '',
    newSubjectCode: '',
    newSubjectTeacher: '',
    date: '',
    time: '08:00',
    dueDate: '',
    dueTime: '23:59',
    priority: 'media',
    status: 'pendiente',
    teacher: '',
    room: '',
    link: '',
    code: '',
    days: [] as string[],
    startTime: '08:00',
    endTime: '10:00',
    noteType: 'texto',
    noteText: '',
    tags: '',
    repeat: 'unica',
    notifyBefore: '15',
    attachmentName: '',
    location: '',
    locationUrl: '',
    reminderEnabled: false,
    reminderBefore: '15',
    reminderNote: '',
}

type FormState = typeof DEFAULT_FORM

function saveLocalItem(item: any) {
    const key = 'uptgo_created_items'
    const current = JSON.parse(localStorage.getItem(key) || '[]')
    localStorage.setItem(key, JSON.stringify([item, ...current]))
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <span
            style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-2)',
            }}
        >
            {children}
        </span>
    )
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
        minHeight: 86,
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
                minWidth: 0,
            }}
        >
            <FieldLabel>{label}</FieldLabel>
            {children}
        </label>
    )
}

function TwoCols({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="create-form-two-cols"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 12,
            }}
        >
            {children}
        </div>
    )
}

export function CreateAcademicItemModal({
    open,
    type,
    initialDate,
    onClose,
    onCreated,
}: CreateAcademicItemModalProps) {
    const [form, setForm] = React.useState<FormState>(DEFAULT_FORM)
    const [error, setError] = React.useState('')

    React.useEffect(() => {
        if (!open) return

        setError('')
        setForm({
            ...DEFAULT_FORM,
            date: initialDate || '',
            dueDate: initialDate || '',
        })
    }, [open, initialDate, type])

    if (!open) return null

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((current) => ({
            ...current,
            [key]: value,
        }))
    }
    const buildGoogleMapsSearchUrl = (query: string) => {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    }

    const buildGoogleMapsEmbedUrl = (query: string) => {
        return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
    }

    const assignGoogleLocation = () => {
        if (!form.location.trim()) {
            setError('Escribe una ubicación para buscarla en Google Maps.')
            return
        }

        update('locationUrl', buildGoogleMapsSearchUrl(form.location))
        setError('')
    }

    const toggleDay = (day: string) => {
        setForm((current) => ({
            ...current,
            days: current.days.includes(day)
                ? current.days.filter((item) => item !== day)
                : [...current.days, day],
        }))
    }

    const validate = () => {
        if (!form.title.trim()) {
            return 'El título es obligatorio.'
        }

        if (type === 'evento' && !form.date) {
            return 'La fecha es obligatoria.'
        }
        if (type === 'tarea' && !form.dueDate) {
            return 'La fecha de entrega es obligatoria.'
        }

        if (type === 'clase') {
            if (form.subjectMode === 'existing' && !form.subject) {
                return 'Selecciona una materia o crea una nueva.'
            }

            if (form.subjectMode === 'new') {
                if (!form.newSubjectName.trim()) {
                    return 'El nombre de la materia es obligatorio.'
                }

                if (!form.newSubjectCode.trim()) {
                    return 'El código de la materia es obligatorio.'
                }

                if (!form.newSubjectTeacher.trim()) {
                    return 'El nombre del docente es obligatorio.'
                }
            }

            if (form.days.length === 0) {
                return 'Selecciona al menos un día de clase.'
            }

            if (form.startTime >= form.endTime) {
                return 'La hora de inicio debe ser menor a la hora de fin.'
            }
        }

        if (type === 'nota' && form.noteType === 'texto' && !form.noteText.trim()) {
            return 'Escribe el contenido de la nota.'
        }

        return ''
    }

    const handleSave = () => {
        const validationMessage = validate()

        if (validationMessage) {
            setError(validationMessage)
            return
        }

        const resolvedLocationUrl = form.location.trim()
            ? form.locationUrl || buildGoogleMapsSearchUrl(form.location)
            : ''

        const resolvedSubject =
            type === 'clase' && form.subjectMode === 'new'
                ? {
                    id: `subject-${Date.now()}`,
                    name: form.newSubjectName.trim(),
                    code: form.newSubjectCode.trim(),
                    teacher: form.newSubjectTeacher.trim(),
                }
                : null

        const resolvedTitle =
            type === 'clase'
                ? form.subjectMode === 'new'
                    ? form.newSubjectName.trim()
                    : DATA.subjects.find((subject: any) => subject.id === form.subject)?.name || ''
                : form.title.trim()

        const { title, location, locationUrl, ...formWithoutDuplicatedFields } = form

        const linkedReminder =
            form.reminderEnabled && ['evento', 'tarea', 'clase'].includes(type)
                ? {
                    id: `reminder-${Date.now()}`,
                    parentType: type,
                    parentTitle: resolvedTitle,
                    before: form.reminderBefore,
                    note: form.reminderNote.trim(),
                    status: 'activo',

                }
                : null

        const item = {
            id: `${type}-${Date.now()}`,
            type,
            createdAt: new Date().toISOString(),
            syncStatus: 'pending',
            ...formWithoutDuplicatedFields,
            title: resolvedTitle,
            location: location.trim(),
            locationUrl: resolvedLocationUrl,
            subjectData: resolvedSubject,
            reminder: linkedReminder,
        }

        saveLocalItem(item)
        onCreated?.(item)
        onClose()
    }
    const LocationGoogleField = (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
            }}
        >
            <Field label="Ubicación opcional">
                <input
                    value={form.location}
                    onChange={(event) => {
                        update('location', event.target.value)
                        update('locationUrl', '')
                    }}
                    placeholder="Ej: Edificio Rafael Azula, UPTC Tunja"
                    style={inputStyle()}
                />
            </Field>

            {form.location.trim() && (
                <div
                    style={{
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)',
                        overflow: 'hidden',
                        background: 'var(--surface-2)',
                    }}
                >
                    <div
                        style={{
                            height: 190,
                            background: 'var(--surface-2)',
                        }}
                    >
                        <iframe
                            title="Vista previa de ubicación en Google Maps"
                            src={buildGoogleMapsEmbedUrl(form.location)}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 0,
                                display: 'block',
                            }}
                        />
                    </div>

                    <div
                        style={{
                            padding: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            flexWrap: 'wrap',
                        }}
                    >
                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: 'var(--text)',
                                }}
                            >
                                Resultado en Google Maps
                            </div>

                            <div
                                style={{
                                    fontSize: 11.5,
                                    color: 'var(--text-3)',
                                    marginTop: 2,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 280,
                                }}
                            >
                                {form.location}
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: 8,
                                flexWrap: 'wrap',
                            }}
                        >
                            <a
                                href={buildGoogleMapsSearchUrl(form.location)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ textDecoration: 'none' }}
                            >
                                <button
                                    type="button"
                                    style={{
                                        height: 34,
                                        padding: '0 12px',
                                        borderRadius: 'var(--r-sm)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface)',
                                        color: 'var(--text-2)',
                                        fontFamily: 'var(--font-ui)',
                                        fontSize: 12.5,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Abrir
                                </button>
                            </a>

                            <button
                                type="button"
                                onClick={assignGoogleLocation}
                                style={{
                                    height: 34,
                                    padding: '0 12px',
                                    borderRadius: 'var(--r-sm)',
                                    border: 'none',
                                    background: form.locationUrl
                                        ? 'var(--ok-soft)'
                                        : 'var(--primary)',
                                    color: form.locationUrl
                                        ? 'var(--ok)'
                                        : 'var(--on-primary)',
                                    fontFamily: 'var(--font-ui)',
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                {form.locationUrl ? 'Asignada' : 'Asignar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    const ReminderLinkedField = ['evento', 'tarea', 'clase'].includes(type) ? (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: 12,
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                background: 'var(--surface-2)',
            }}
        >
            <button
                type="button"
                onClick={() => update('reminderEnabled', !form.reminderEnabled)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                    color: 'var(--text)',
                    textAlign: 'left',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 'var(--r-sm)',
                            background: form.reminderEnabled
                                ? 'var(--primary-soft)'
                                : 'var(--surface)',
                            color: form.reminderEnabled
                                ? 'var(--primary-text)'
                                : 'var(--text-3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '1px solid var(--border)',
                        }}
                    >
                        <Icon name="bell" size={16} />
                    </span>

                    <span>
                        <strong
                            style={{
                                display: 'block',
                                fontSize: 13.5,
                                color: 'var(--text)',
                            }}
                        >
                            Agregar recordatorio
                        </strong>

                        <small
                            style={{
                                display: 'block',
                                marginTop: 2,
                                fontSize: 11.5,
                                color: 'var(--text-3)',
                            }}
                        >
                            Ligado a este {type === 'tarea' ? 'pendiente' : 'evento'}
                        </small>
                    </span>
                </span>

                <span
                    style={{
                        width: 42,
                        height: 24,
                        borderRadius: 'var(--r-full)',
                        background: form.reminderEnabled
                            ? 'var(--primary)'
                            : 'var(--border-strong)',
                        position: 'relative',
                        flexShrink: 0,
                    }}
                >
                    <span
                        style={{
                            position: 'absolute',
                            top: 3,
                            left: form.reminderEnabled ? 21 : 3,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: 'var(--surface)',
                            transition: 'left .2s var(--ease)',
                        }}
                    />
                </span>
            </button>

            {form.reminderEnabled && (
                <>
                    <Field label="Notificar antes">
                        <select
                            value={form.reminderBefore}
                            onChange={(event) => update('reminderBefore', event.target.value)}
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

                    <Field label="Nota del recordatorio">
                        <input
                            value={form.reminderNote}
                            onChange={(event) => update('reminderNote', event.target.value)}
                            placeholder="Ej: Llevar portátil, repasar antes de entrar..."
                            style={inputStyle()}
                        />
                    </Field>
                </>
            )}
        </div>
    ) : null
    const showSubject = ['evento', 'tarea', 'clase', 'nota'].includes(type)

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 120,
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
                    width: 560,
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
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
                            <Icon name={TYPE_ICON[type]} size={19} />
                        </span>

                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: 'var(--text)',
                                    fontFamily: 'var(--font-display)',
                                }}
                            >
                                {TYPE_LABEL[type]}
                            </div>

                            <div
                                style={{
                                    fontSize: 12,
                                    color: 'var(--text-3)',
                                    marginTop: 2,
                                }}
                            >
                                {initialDate ? `Fecha seleccionada: ${initialDate}` : 'Completa la información'}
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
                    {type !== 'clase' && (
                        <Field label="Título">
                            <input
                                value={form.title}
                                onChange={(event) => update('title', event.target.value)}
                                placeholder={
                                    type === 'evento'
                                        ? 'Ej: Reunión de grupo'
                                        : type === 'tarea'
                                            ? 'Ej: Entrega taller'
                                            : type === 'nota'
                                                ? 'Ej: Apuntes de parcial'
                                                : 'Ej: Repasar exposición'
                                }
                                style={inputStyle()}
                            />
                        </Field>
                    )}

                    {showSubject && type !== 'clase' && (
                        <Field label="Materia">
                            <select
                                value={form.subject}
                                onChange={(event) => update('subject', event.target.value)}
                                style={inputStyle()}
                            >
                                <option value="">Sin materia</option>
                                {DATA.subjects.map((subject: any) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    )}

                    {type === 'evento' && (
                        <>
                            <TwoCols>
                                <Field label="Fecha">
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(event) => update('date', event.target.value)}
                                        style={inputStyle()}
                                    />
                                </Field>

                                <Field label="Hora">
                                    <input
                                        type="time"
                                        value={form.time}
                                        onChange={(event) => update('time', event.target.value)}
                                        style={inputStyle()}
                                    />
                                </Field>
                            </TwoCols>

                            <Field label="Ubicación">
                                <input
                                    value={form.location}
                                    onChange={(event) => update('location', event.target.value)}
                                    placeholder="Ej: Aula 204, Bloque C"
                                    style={inputStyle()}
                                />
                            </Field>

                            {LocationGoogleField}

                            {ReminderLinkedField}


                            <Field label="Descripción">
                                <textarea
                                    value={form.description}
                                    onChange={(event) => update('description', event.target.value)}
                                    placeholder="Detalles del evento..."
                                    style={textareaStyle()}
                                />
                            </Field>

                        </>

                    )}

                    {type === 'tarea' && (
                        <>
                            <TwoCols>
                                <Field label="Fecha de entrega">
                                    <input
                                        type="date"
                                        value={form.dueDate}
                                        onChange={(event) => update('dueDate', event.target.value)}
                                        style={inputStyle()}
                                    />
                                </Field>

                                <Field label="Hora de entrega">
                                    <input
                                        type="time"
                                        value={form.dueTime}
                                        onChange={(event) => update('dueTime', event.target.value)}
                                        style={inputStyle()}
                                    />
                                </Field>
                            </TwoCols>

                            <TwoCols>
                                <Field label="Prioridad">
                                    <select
                                        value={form.priority}
                                        onChange={(event) => update('priority', event.target.value)}
                                        style={inputStyle()}
                                    >
                                        <option value="alta">Alta</option>
                                        <option value="media">Media</option>
                                        <option value="baja">Baja</option>
                                    </select>
                                </Field>

                                <Field label="Estado">
                                    <select
                                        value={form.status}
                                        onChange={(event) => update('status', event.target.value)}
                                        style={inputStyle()}
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="en_progreso">En progreso</option>
                                        <option value="entregada">Entregada</option>
                                    </select>
                                </Field>
                            </TwoCols>

                            <Field label="Archivo adjunto">
                                <input
                                    type="file"
                                    onChange={(event) =>
                                        update('attachmentName', event.target.files?.[0]?.name || '')
                                    }
                                    style={{
                                        ...inputStyle(),
                                        paddingTop: 9,
                                    }}
                                />
                            </Field>

                            {ReminderLinkedField}

                            <Field label="Descripción">
                                <textarea
                                    value={form.description}
                                    onChange={(event) => update('description', event.target.value)}
                                    placeholder="Indicaciones, rúbrica o detalles de la tarea..."
                                    style={textareaStyle()}
                                />
                            </Field>
                        </>
                    )}

                    {type === 'clase' && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <FieldLabel>Materia</FieldLabel>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 6,
                                        background: 'var(--surface-2)',
                                        borderRadius: 'var(--r-full)',
                                        padding: 3,
                                        width: 'fit-content',
                                        maxWidth: '100%',
                                    }}
                                >
                                    {[
                                        ['existing', 'Existente'],
                                        ['new', 'Nueva'],
                                    ].map(([id, label]) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => update('subjectMode', id)}
                                            style={{
                                                padding: '7px 14px',
                                                borderRadius: 'var(--r-full)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: form.subjectMode === id ? 'var(--surface)' : 'transparent',
                                                boxShadow: form.subjectMode === id ? 'var(--shadow-sm)' : 'none',
                                                color: form.subjectMode === id ? 'var(--text)' : 'var(--text-2)',
                                                fontFamily: 'var(--font-ui)',
                                                fontSize: 12.5,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {form.subjectMode === 'existing' && (
                                    <Field label="Seleccionar materia">
                                        <select
                                            value={form.subject}
                                            onChange={(event) => update('subject', event.target.value)}
                                            style={inputStyle()}
                                        >
                                            <option value="">Selecciona una materia</option>
                                            {DATA.subjects.map((subject: any) => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                )}

                                {form.subjectMode === 'new' && (
                                    <>
                                        <Field label="Nombre de la materia">
                                            <input
                                                value={form.newSubjectName}
                                                onChange={(event) => update('newSubjectName', event.target.value)}
                                                placeholder="Ej: Bases de Datos"
                                                style={inputStyle()}
                                            />
                                        </Field>

                                        <TwoCols>
                                            <Field label="Código de la materia">
                                                <input
                                                    value={form.newSubjectCode}
                                                    onChange={(event) => update('newSubjectCode', event.target.value)}
                                                    placeholder="Ej: BD-204"
                                                    style={inputStyle()}
                                                />
                                            </Field>

                                            <Field label="Docente">
                                                <input
                                                    value={form.newSubjectTeacher}
                                                    onChange={(event) => update('newSubjectTeacher', event.target.value)}
                                                    placeholder="Nombre del docente"
                                                    style={inputStyle()}
                                                />
                                            </Field>
                                        </TwoCols>
                                    </>
                                )}
                            </div>

                            <TwoCols>
                                <Field label="Aula">
                                    <input
                                        value={form.room}
                                        onChange={(event) => update('room', event.target.value)}
                                        placeholder="Ej: Aula 204"
                                        style={inputStyle()}
                                    />
                                </Field>

                                <Field label="Enlace virtual">
                                    <input
                                        value={form.link}
                                        onChange={(event) => update('link', event.target.value)}
                                        placeholder="Zoom, Meet o Teams"
                                        style={inputStyle()}
                                    />
                                </Field>
                                {LocationGoogleField}

                                {ReminderLinkedField}

                            </TwoCols>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                <FieldLabel>Días de clase</FieldLabel>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                                        gap: 6,
                                    }}
                                >
                                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => {
                                        const active = form.days.includes(day)

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => toggleDay(day)}
                                                type="button"
                                                style={{
                                                    height: 34,
                                                    borderRadius: 'var(--r-sm)',
                                                    border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                    background: active ? 'var(--primary-soft)' : 'var(--surface-2)',
                                                    color: active ? 'var(--primary-text)' : 'var(--text-2)',
                                                    fontFamily: 'var(--font-ui)',
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {day}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <TwoCols>
                                <Field label="Hora inicio">
                                    <input
                                        type="time"
                                        value={form.startTime}
                                        onChange={(event) => update('startTime', event.target.value)}
                                        style={inputStyle()}
                                    />
                                </Field>

                                <Field label="Hora fin">
                                    <input
                                        type="time"
                                        value={form.endTime}
                                        onChange={(event) => update('endTime', event.target.value)}
                                        style={inputStyle()}
                                    />
                                </Field>
                            </TwoCols>

                            <Field label="Descripción">
                                <textarea
                                    value={form.description}
                                    onChange={(event) => update('description', event.target.value)}
                                    placeholder="Notas de la clase o indicaciones importantes..."
                                    style={textareaStyle()}
                                />
                            </Field>
                        </>
                    )}

                    {type === 'nota' && (
                        <>
                            <Field label="Tipo de nota">
                                <select
                                    value={form.noteType}
                                    onChange={(event) => update('noteType', event.target.value)}
                                    style={inputStyle()}
                                >
                                    <option value="texto">Texto</option>
                                    <option value="audio">Audio</option>
                                    <option value="imagen">Imagen</option>
                                    <option value="documento">Documento</option>
                                    <option value="ubicacion">Ubicación</option>
                                </select>
                            </Field>

                            {form.noteType === 'texto' && (
                                <Field label="Contenido">
                                    <textarea
                                        value={form.noteText}
                                        onChange={(event) => update('noteText', event.target.value)}
                                        placeholder="Escribe tus apuntes..."
                                        style={{
                                            ...textareaStyle(),
                                            minHeight: 130,
                                        }}
                                    />
                                </Field>
                            )}

                            {['audio', 'imagen', 'documento'].includes(form.noteType) && (
                                <Field label="Adjunto">
                                    <input
                                        type="file"
                                        accept={
                                            form.noteType === 'audio'
                                                ? 'audio/*'
                                                : form.noteType === 'imagen'
                                                    ? 'image/*'
                                                    : '.pdf,.doc,.docx,.xls,.xlsx,image/*'
                                        }
                                        onChange={(event) =>
                                            update('attachmentName', event.target.files?.[0]?.name || '')
                                        }
                                        style={{
                                            ...inputStyle(),
                                            paddingTop: 9,
                                        }}
                                    />
                                </Field>
                            )}

                            {form.noteType === 'ubicacion' && (
                                <Field label="Ubicación">
                                    <input
                                        value={form.location}
                                        onChange={(event) => update('location', event.target.value)}
                                        placeholder="Ej: Biblioteca, Bloque C"
                                        style={inputStyle()}
                                    />
                                </Field>
                            )}

                            <Field label="Etiquetas">
                                <input
                                    value={form.tags}
                                    onChange={(event) => update('tags', event.target.value)}
                                    placeholder="Ej: parcial, lectura, investigación"
                                    style={inputStyle()}
                                />
                            </Field>
                        </>
                    )}

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

                    <Button variant="primary" icon="plus" onClick={handleSave}>
                        Guardar
                    </Button>
                </div>
            </div>
        </div>
    )
}