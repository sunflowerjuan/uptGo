import React from 'react'
import { DATA } from '../data/data'
import { CreateAcademicItemModal, type CreateItemType, } from '../components/CreateAcademicItemModal'
import { Button, Card, EmptyState, FadeIn, IconButton, Pill, SectionTitle, cSoftVar, cVar, subjectById, } from '../components/UI'
import { Icon } from '../components/Icons'
type AnyProps = Record<string, any>

// ---- CSV PARSER TYPES ----

type CsvScheduleBlock = {
  id: string
  day: number
  start: number
  end: number
  subject: string
  title: string
  room: string
  teacher: string
  color: number
  created: boolean
  subjectData: {
    id: string
    name: string
    code: string
    teacher: string
    color: number
  }
}

const CSV_DAY_MAP: Record<string, number> = {
  L: 0, M: 1, X: 2, J: 3, V: 4, S: 5, D: 6,
  Lun: 0, Mar: 1, 'Mié': 2, Jue: 3, Vie: 4, 'Sáb': 5, Dom: 6,
}

function parseTimeToHour(timeStr: string): number {
  const [h] = timeStr.split(':')
  return parseInt(h, 10)
}

function parseCsvRow(row: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < row.length; i++) {
    const ch = row[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

function parseUptcCsv(text: string): CsvScheduleBlock[] | null {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return null

  const headers = parseCsvRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-záéíóú0-9]/gi, ''))

  const colIdx = {
    code: headers.findIndex((h) => h.includes('codigo') || h.includes('code')),
    name: headers.findIndex((h) => h.includes('asignatura') || h.includes('materia') || h.includes('nombre')),
    teacher: headers.findIndex((h) => h.includes('docente') || h.includes('profesor')),
    room: headers.findIndex((h) => h.includes('salon') || h.includes('aula') || h.includes('room')),
    schedule: headers.findIndex((h) => h.includes('horario') || h.includes('schedule')),
    group: headers.findIndex((h) => h.includes('grupo') || h.includes('group')),
  }

  if (colIdx.name === -1 || colIdx.schedule === -1) return null

  const subjectColorMap = new Map<string, number>()
  let colorCounter = 1

  const blocks: CsvScheduleBlock[] = []

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvRow(lines[i])
    if (row.length < 2) continue

    const code = colIdx.code >= 0 ? row[colIdx.code] || '' : ''
    const name = colIdx.name >= 0 ? row[colIdx.name] || '' : ''
    const teacher = colIdx.teacher >= 0 ? row[colIdx.teacher] || '' : ''
    const room = colIdx.room >= 0 ? row[colIdx.room] || '' : ''
    const scheduleStr = colIdx.schedule >= 0 ? row[colIdx.schedule] || '' : ''

    if (!name || !scheduleStr) continue

    const subjectKey = code || name
    if (!subjectColorMap.has(subjectKey)) {
      subjectColorMap.set(subjectKey, ((colorCounter - 1) % 6) + 1)
      colorCounter++
    }
    const color = subjectColorMap.get(subjectKey) || 1

    const subjectId = `csv-${subjectKey.replace(/\s/g, '-').toLowerCase()}`

    // Parse schedule: "L 08:00-10:00 / X 08:00-10:00"
    const parts = scheduleStr.split('/').map((p: string) => p.trim())
    for (const part of parts) {
      // Match: DAY HH:MM-HH:MM
      const match = part.match(/^([A-ZÁÉÍÓÚa-záéíóú]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/)
      if (!match) continue
      const dayKey = match[1].toUpperCase()
      const dayNum = CSV_DAY_MAP[dayKey] ?? CSV_DAY_MAP[match[1]]
      if (dayNum === undefined) continue
      const start = parseTimeToHour(match[2])
      const end = parseTimeToHour(match[3])

      blocks.push({
        id: `csv-${subjectId}-day${dayNum}-${start}`,
        day: dayNum,
        start,
        end,
        subject: subjectId,
        title: name,
        room,
        teacher,
        color,
        created: true,
        subjectData: {
          id: subjectId,
          name,
          code,
          teacher,
          color,
        },
      })
    }
  }

  return blocks.length > 0 ? blocks : null
}

function CsvImportModal({
  open,
  onClose,
  onImport,
}: {
  open: boolean
  onClose: () => void
  onImport: (blocks: CsvScheduleBlock[]) => void
}) {
  const [preview, setPreview] = React.useState<CsvScheduleBlock[] | null>(null)
  const [error, setError] = React.useState('')
  const [filename, setFilename] = React.useState('')
  const fileRef = React.useRef<HTMLInputElement | null>(null)

  const reset = () => {
    setPreview(null)
    setError('')
    setFilename('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const result = parseUptcCsv(text)
      if (!result) {
        setError('No se pudo interpretar el CSV. Verifica el formato UPTC.')
        setPreview(null)
      } else {
        setError('')
        setPreview(result)
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleImport = () => {
    if (!preview) return
    onImport(preview)
    reset()
    onClose()
  }

  if (!open) return null

  const DOW_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'oklch(0 0 0 / 0.28)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
      }}
      onClick={() => { reset(); onClose() }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: '100%',
          maxHeight: 'calc(100dvh - 36px)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 22,
          boxShadow: 'var(--shadow-pop)',
          overflow: 'hidden',
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
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
              Importar horario CSV
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              Formato UPTC: CODIGO, ASIGNATURA, DOCENTE, HORARIO, SALON
            </div>
          </div>
          <button
            onClick={() => { reset(); onClose() }}
            style={{ width: 34, height: 34, borderRadius: 'var(--r-full)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="x" size={15} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--r-md)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              background: 'var(--surface-2)',
            }}
            onClick={() => fileRef.current?.click()}
          >
            <Icon name="upload" size={28} color="var(--text-3)" />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
              {filename || 'Seleccionar archivo CSV'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Arrastra o haz clic para elegir un archivo .csv o .txt
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--r-sm)', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {preview && preview.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>
                VISTA PREVIA — {preview.length} bloque{preview.length !== 1 ? 's' : ''} detectado{preview.length !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                {preview.map((block) => (
                  <div
                    key={block.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      background: cSoftVar(block.color),
                      border: `1px solid ${cVar(block.color)}`,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cVar(block.color), flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: cVar(block.color) }}>{block.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                        {DOW_LABELS[block.day]} · {block.start}:00–{block.end}:00{block.room ? ` · ${block.room}` : ''}{block.teacher ? ` · ${block.teacher}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => { reset(); onClose() }}>Cancelar</Button>
          <Button
            variant="primary"
            icon="plus"
            onClick={handleImport}
          >
            Importar {preview ? `(${preview.length})` : ''}
          </Button>
        </div>
      </div>
    </div>
  )
}

const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const DAY_MARKS: Record<number, number[]> = {
  8: [1, 2, 3, 4],
  10: [3],
  12: [4],
  14: [2, 2],
  15: [6],
  18: [1],
  20: [2, 3],
  22: [5],
  27: [1, 4],
}

export function Calendar({ m, onAdd }: AnyProps) {
  const [view, setView] = React.useState<'mes' | 'agenda'>('mes')
  const [sel, setSel] = React.useState(8)
  const [popupDay, setPopupDay] = React.useState<number | null>(null)

  const [quickCreateOpen, setQuickCreateOpen] = React.useState(false)
  const [selectedCreateDate, setSelectedCreateDate] = React.useState<string | null>(null)
  const [createType, setCreateType] = React.useState<CreateItemType | null>(null)

  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 4, 1))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const isMockMonth = year === 2026 && month === 4
  const first = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: Array<number | null> = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const formatCreateDate = (day: number) => {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${year}-${mm}-${dd}`
  }

  const openQuickCreate = (day: number) => {
    setSel(day)
    setPopupDay(null)
    setSelectedCreateDate(formatCreateDate(day))
    setQuickCreateOpen(true)
  }

  const closeQuickCreate = () => {
    setQuickCreateOpen(false)
  }

  const openCreateForm = (type: CreateItemType) => {
    setQuickCreateOpen(false)
    setCreateType(type)
  }

  const closeCreateForm = () => {
    setCreateType(null)
  }

  const agendaDay = (day: number) => {
    const items: any[] = []

    if (!isMockMonth) {
      return items
    }

    if (DAY_MARKS[day]) {
      if (day === 8) {
        return DATA.events.map((event: any) => ({
          time: event.time,
          title: event.title,
          sub: event.loc,
          color: subjectById(event.subject).color,
          type: 'evento',
        }))
      }

      DAY_MARKS[day].forEach((color, index) => {
        const subj =
          DATA.subjects.find((subject: any) => subject.color === color) ||
          DATA.subjects[0]

        items.push({
          time: ['08:00', '10:00', '14:00'][index % 3],
          title: subj.name,
          sub: subj.room,
          color,
          type: 'clase',
        })
      })
    }

    return items
  }

  const monthPreview = (day: number) => {
    return agendaDay(day).slice(0, m ? 1 : 2)
  }
  const goPrevMonth = () => {
    setCurrentDate((current) => {
      return new Date(current.getFullYear(), current.getMonth() - 1, 1)
    })

    setSel(1)
    setPopupDay(null)
  }

  const goNextMonth = () => {
    setCurrentDate((current) => {
      return new Date(current.getFullYear(), current.getMonth() + 1, 1)
    })

    setSel(1)
    setPopupDay(null)
  }

  const monthAgenda = () => {
    if (!isMockMonth) {
      return []
    }
    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1
      const items = agendaDay(day)

      return {
        day,
        items,
      }
    }).filter((group) => group.items.length > 0)
  }
  const createOptions: Array<{
    type: CreateItemType
    icon: string
    title: string
    sub: string
  }> = [
      {
        type: 'evento',
        icon: 'calendar',
        title: 'Crear evento',
        sub: 'Agregar una actividad puntual a este día.',
      },
      {
        type: 'clase',
        icon: 'clock',
        title: 'Crear clase',
        sub: 'Programar una clase o bloque académico.',
      },
      {
        type: 'tarea',
        icon: 'tasks',
        title: 'Crear tarea',
        sub: 'Agregar una entrega o pendiente.',
      },
    ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                Calendario
              </h1>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                background: 'var(--surface-2)',
                borderRadius: 'var(--r-full)',
                padding: 3,
              }}
            >
              {(['mes', 'agenda'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setView(value)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 'var(--r-full)',
                    border: 'none',
                    cursor: 'pointer',
                    background: view === value ? 'var(--surface)' : 'transparent',
                    boxShadow: view === value ? 'var(--shadow-sm)' : 'none',
                    color: view === value ? 'var(--text)' : 'var(--text-2)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    fontWeight: view === value ? 600 : 500,
                    textTransform: 'capitalize',
                  }}
                >
                  {value}
                </button>
              ))}
            </div>

            {!m && (
              <Button icon="plus" onClick={onAdd}>
                Nuevo evento
              </Button>
            )}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: 'var(--text)',
              textTransform: 'capitalize',
              fontFamily: 'var(--font-display)',
            }}
          >
            {MONTHS[month]} {year}
          </h2>

          <div style={{ display: 'flex', gap: 6 }}>
            <IconButton name="chevronLeft" size={34} iconSize={16} onClick={goPrevMonth} />

            <IconButton name="chevronRight" size={34} iconSize={16} onClick={goNextMonth} />
          </div>
        </div>
      </FadeIn>

      {view === 'mes' && (
        <FadeIn delay={110}>
          <Card pad={m ? 10 : 16}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: m ? 2 : 6,
              }}
            >
              {DOW.map((day) => (
                <div
                  key={day}
                  style={{
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-3)',
                    padding: '4px 0 8px',
                  }}
                >
                  {m ? day[0] : day}
                </div>
              ))}

              {cells.map((day, index) => {
                if (!day) return <div key={index} />

                const today = day === 8
                const selected = day === sel
                const preview = monthPreview(day)

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSel(day)

                      if (agendaDay(day).length > 0) {
                        setPopupDay(day)
                      } else {
                        setPopupDay(null)
                      }
                    }}
                    onDoubleClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      openQuickCreate(day)
                    }}
                    title="Doble click para agregar"
                    style={{
                      aspectRatio: '1',
                      minHeight: m ? 40 : 82,
                      borderRadius: 'var(--r-sm)',
                      cursor: 'pointer',
                      border:
                        '1px solid ' +
                        (selected
                          ? 'color-mix(in oklch, var(--primary) 70%, var(--border))'
                          : today
                            ? 'color-mix(in oklch, var(--primary) 35%, var(--border))'
                            : 'transparent'),
                      background: selected
                        ? 'color-mix(in oklch, var(--primary) 14%, var(--surface))'
                        : today
                          ? 'color-mix(in oklch, var(--primary) 8%, var(--surface))'
                          : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      padding: m ? '6px 0' : '7px 0',
                      gap: 2,
                      overflow: 'hidden',
                      transition: 'background .15s, border-color .15s',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: m ? 'center' : 'space-between',
                        padding: m ? 0 : '0 7px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: m ? 13 : 13.5,
                          fontWeight: today ? 700 : 500,
                          color:
                            selected || today
                              ? 'var(--primary-text)'
                              : 'var(--text)',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {day}
                      </span>
                    </div>

                    {preview.length > 0 && (
                      <div
                        onClick={(event) => event.stopPropagation()}
                        onDoubleClick={(event) => event.stopPropagation()}
                        style={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3,
                          padding: m ? '0 4px' : '0 7px',
                          marginTop: m ? 3 : 5,
                          overflow: 'hidden',
                        }}
                      >
                        {preview.map((item: any, itemIndex: number) => (
                          <div
                            key={itemIndex}
                            style={{
                              width: '100%',
                              minHeight: m ? 4 : 16,
                              borderRadius: 8,
                              background: selected
                                ? 'color-mix(in oklch, var(--surface) 88%, var(--primary-soft))'
                                : 'color-mix(in oklch, var(--surface) 94%, var(--bg-tint))',
                              border:
                                '1px solid color-mix(in oklch, var(--border) 75%, transparent)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: m ? '0 4px' : '0 6px',
                              overflow: 'hidden',
                            }}
                          >
                            {!m && (
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: cVar(item.color),
                                  flexShrink: 0,
                                }}
                              />
                            )}

                            {!m && (
                              <span
                                style={{
                                  fontSize: 9.5,
                                  fontWeight: 500,
                                  color: 'var(--text-2)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1,
                                }}
                              >
                                {item.title.slice(0, 14)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>
        </FadeIn>
      )}

      {view === 'agenda' && (
        <FadeIn delay={110}>
          <Card pad={m ? 16 : 20}>
            <SectionTitle>
              Agenda de {MONTHS[month]} {year}
            </SectionTitle>

            {monthAgenda().length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 22,
                }}
              >
                {monthAgenda().map((group) => (
                  <div key={group.day}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 8,
                        marginBottom: 10,
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontFamily: 'var(--font-display)',
                          fontSize: 15,
                          fontWeight: 700,
                          color: 'var(--text)',
                        }}
                      >
                        {group.day === 8 && isMockMonth ? 'Hoy · ' : ''}
                        {group.day} de {MONTHS[month]}
                      </h3>

                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--text-3)',
                        }}
                      >
                        {group.items.length} actividad
                        {group.items.length === 1 ? '' : 'es'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      {group.items.map((item: any, index: number) => (
                        <div
                          key={`${group.day}-${index}`}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: m
                              ? '48px minmax(0, 1fr)'
                              : '64px minmax(0, 1fr) auto',
                            gap: m ? 10 : 14,
                            alignItems: 'center',
                            padding: '14px 0',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              color: 'var(--text-2)',
                              fontWeight: 700,
                              fontFamily: 'var(--font-display)',
                            }}
                          >
                            {item.time}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12,
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                width: 3,
                                alignSelf: 'stretch',
                                minHeight: 40,
                                borderRadius: 3,
                                background: cVar(item.color),
                                flexShrink: 0,
                              }}
                            />

                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 14,
                                  color: 'var(--text)',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {item.title}
                              </div>

                              <div
                                style={{
                                  fontSize: 12,
                                  color: 'var(--text-3)',
                                  marginTop: 3,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {item.sub}
                              </div>
                            </div>
                          </div>

                          {!m && (
                            <Pill color="var(--text-2)" bg="var(--surface-2)">
                              {item.type}
                            </Pill>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="calendar"
                title="Sin actividades este mes"
                body="No hay eventos, clases o tareas programadas para este mes."
              />
            )}
          </Card>
        </FadeIn>
      )}

      {view === 'mes' && popupDay && agendaDay(popupDay).length > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            background: 'oklch(0 0 0 / 0.18)',
            display: 'flex',
            alignItems: m ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: m ? '0 14px 18px' : 20,
          }}
          onClick={() => setPopupDay(null)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: m ? '100%' : 420,
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
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {popupDay === 8 ? 'Hoy · ' : ''}
                  {popupDay} de {MONTHS[month]}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-3)',
                    marginTop: 2,
                  }}
                >
                  {agendaDay(popupDay).length} actividad
                  {agendaDay(popupDay).length === 1 ? '' : 'es'}
                </div>
              </div>

              <button
                onClick={() => setPopupDay(null)}
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
                <Icon name="x" size={15} />
              </button>
            </div>

            <div style={{ padding: '8px 20px 18px' }}>
              {agendaDay(popupDay).map((item: any, index: number, arr: any[]) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '14px 0',
                    borderBottom:
                      index === arr.length - 1 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      minWidth: 45,
                      fontSize: 12,
                      color: 'var(--text-2)',
                      fontWeight: 600,
                      fontFamily: 'var(--font-display)',
                      paddingTop: 1,
                    }}
                  >
                    {item.time}
                  </div>

                  <div
                    style={{
                      width: 3,
                      borderRadius: 3,
                      background: cVar(item.color),
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        color: 'var(--text)',
                        fontWeight: 600,
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-3)',
                        marginTop: 2,
                      }}
                    >
                      {item.sub}
                    </div>
                  </div>

                  <Pill color="var(--text-2)" bg="var(--surface-2)">
                    {item.type}
                  </Pill>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {quickCreateOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'oklch(0 0 0 / 0.22)',
            display: 'flex',
            alignItems: m ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: m ? '0 14px 18px' : 20,
          }}
          onClick={closeQuickCreate}
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
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--text)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Agregar al calendario
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-3)',
                    marginTop: 2,
                  }}
                >
                  Fecha seleccionada: {selectedCreateDate}
                </div>
              </div>

              <button
                onClick={closeQuickCreate}
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
                <Icon name="x" size={15} />
              </button>
            </div>

            <div
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {createOptions.map((option) => (
                <button
                  key={option.title}
                  onClick={() => openCreateForm(option.type)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-ui)',
                    cursor: 'pointer',
                    textAlign: 'left',
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
                    <Icon name={option.icon} size={18} />
                  </span>

                  <span style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        display: 'block',
                        fontSize: 14,
                        color: 'var(--text)',
                      }}
                    >
                      {option.title}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        fontSize: 12,
                        color: 'var(--text-3)',
                        marginTop: 3,
                        lineHeight: 1.35,
                      }}
                    >
                      {option.sub}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <CreateAcademicItemModal
        open={!!createType}
        type={createType || 'evento'}
        initialDate={selectedCreateDate}
        onClose={closeCreateForm}
        onCreated={(item) => {
          console.log('Elemento creado desde calendario:', item)
        }}
      />
    </div>
  )
}

export function Schedule({ m, onAdd, toast, scheduleItems = [], onImportSchedule }: AnyProps) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  const rowH = m ? 44 : 52
  const headH = m ? 34 : 40

  const [dayIdx, setDayIdx] = React.useState(0)
  const [showCsvImport, setShowCsvImport] = React.useState(false)

  const shownDays = m ? [dayIdx] : [0, 1, 2, 3, 4, 5, 6]
  const gridWidth = m ? '100%' : 1120

  const fullSchedule = [
    ...scheduleItems,
    ...DATA.schedule,
  ]

  const createdSubjects = scheduleItems
    .filter((block: any) => block.subjectData)
    .map((block: any) => block.subjectData)

  const uniqueCreatedSubjects = createdSubjects.filter(
    (subject: any, index: number, arr: any[]) =>
      arr.findIndex((item) => item.id === subject.id) === index,
  )

  const getSubject = (block: any) => {
    if (block.subjectData) {
      return {
        id: block.subjectData.id,
        name: block.subjectData.name,
        teacher: block.subjectData.teacher,
        room: block.room || 'Sin aula',
        color: block.subjectData.color || 1,
      }
    }

    return subjectById(block.subject)
  }

  const getBlockKey = (block: any, index: number) => {
    return (
      block.id ||
      `${block.day}-${block.start}-${block.end}-${block.subject}-${index}`
    )
  }

  return (
    <FadeIn>
      <div
        className="uptgo-screen"
        style={{
          width: '100%',
          minWidth: 0,
        }}
      >
        {m && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                    lineHeight: 1.1,
                    color: 'var(--text)',
                    marginBottom: 8,
                  }}
                >
                  Horario
                </h1>

                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-2)',
                  }}
                >
                  Semana típica · {uniqueCreatedSubjects.length + DATA.subjects.length} materias
                </p>
              </div>
              <Button size="sm" variant="soft" icon="upload" onClick={() => setShowCsvImport(true)}>
                CSV
              </Button>
            </div>
          </div>
        )}

        {!m && (
          <SectionTitle
            title="Horario"
            subtitle={`Semana típica · ${uniqueCreatedSubjects.length + DATA.subjects.length} materias`}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" variant="soft" icon="upload" onClick={() => setShowCsvImport(true)}>
                  Importar CSV
                </Button>
                <Button size="sm" onClick={onAdd}>
                  Agregar clase
                </Button>
              </div>
            }
          />
        )}

        {m && (
          <div
            className="schedule-day-tabs"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: 7,
              width: '100%',
              marginBottom: 14,
            }}
          >
            {days.map((day, index) => (
              <button
                key={day}
                onClick={() => setDayIdx(index)}
                style={{
                  minWidth: 0,
                  padding: '9px 0',
                  borderRadius: 'var(--r-sm)',
                  border:
                    '1px solid ' +
                    (dayIdx === index ? 'transparent' : 'var(--border)'),
                  background:
                    dayIdx === index ? 'var(--primary)' : 'var(--surface)',
                  color:
                    dayIdx === index ? 'var(--on-primary)' : 'var(--text-2)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {day}
              </button>
            ))}
          </div>
        )}

        <div
          className="schedule-legend"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 7,
            marginBottom: 14,
            width: '100%',
            minWidth: 0,
          }}
        >
          {uniqueCreatedSubjects.map((subject: any) => (
            <span
              key={subject.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                maxWidth: '100%',
                padding: '5px 9px',
                borderRadius: 'var(--r-full)',
                background: cSoftVar(subject.color || 1),
                color: cVar(subject.color || 1),
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: cVar(subject.color || 1),
                  flexShrink: 0,
                }}
              />
              {subject.name}
            </span>
          ))}

          {DATA.subjects.map((subject: any) => (
            <span
              key={subject.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                maxWidth: '100%',
                padding: '5px 9px',
                borderRadius: 'var(--r-full)',
                background: cSoftVar(subject.color),
                color: cVar(subject.color),
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: cVar(subject.color),
                  flexShrink: 0,
                }}
              />
              {subject.name}
            </span>
          ))}
        </div>

        <Card
          style={{
            width: '100%',
            minWidth: 0,
            overflow: 'hidden',
            padding: m ? 10 : 16,
          }}
        >
          <div
            className={!m ? 'uptgo-scroll-x' : undefined}
            style={{
              width: '100%',
              minWidth: 0,
              overflowX: m ? 'hidden' : 'auto',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: gridWidth,
                minWidth: m ? 0 : 1120,
                display: 'grid',
                gridTemplateColumns: m
                  ? '44px minmax(0, 1fr)'
                  : `56px repeat(${shownDays.length}, minmax(130px, 1fr))`,
              }}
            >
              <div
                style={{
                  height: headH,
                  borderRight: '1px solid var(--border)',
                }}
              />

              {shownDays.map((dayIndex) => (
                <div
                  key={dayIndex}
                  style={{
                    height: headH,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-2)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {days[dayIndex]}
                </div>
              ))}

              <div>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    style={{
                      height: rowH,
                      paddingTop: 6,
                      paddingRight: 7,
                      textAlign: 'right',
                      fontSize: 10.5,
                      color: 'var(--text-3)',
                      borderRight: '1px solid var(--border)',
                    }}
                  >
                    {hour}:00
                  </div>
                ))}
              </div>

              {shownDays.map((dayIndex) => (
                <div
                  key={dayIndex}
                  style={{
                    position: 'relative',
                    minWidth: 0,
                    height: rowH * hours.length,
                  }}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      style={{
                        height: rowH,
                        borderBottom: '1px solid var(--border)',
                      }}
                    />
                  ))}

                  {fullSchedule
                    .filter((block: any) => block.day === dayIndex)
                    .map((block: any, index: number) => {
                      const subject = getSubject(block)
                      const top = (block.start - hours[0]) * rowH
                      const height = Math.max(
                        (block.end - block.start) * rowH - 5,
                        42,
                      )

                      const room = block.room || subject.room || 'Sin aula'
                      const color = subject.color || 1

                      return (
                        <button
                          key={getBlockKey(block, index)}
                          onClick={() => {
                            const text = `${subject.name} · ${block.start}:00–${block.end}:00`

                            if (block.locationUrl) {
                              toast(`${text} · ubicación asignada`)
                              return
                            }

                            toast(text)
                          }}
                          style={{
                            position: 'absolute',
                            top: top + 3,
                            left: m ? 5 : 8,
                            right: m ? 5 : 8,
                            height,
                            cursor: 'pointer',
                            textAlign: 'left',
                            background: cSoftVar(color),
                            border: 'none',
                            borderLeft: `3px solid ${cVar(color)}`,
                            borderRadius: 'var(--r-xs)',
                            padding: m ? '7px 8px' : '8px 10px',
                            overflow: 'hidden',
                            color: 'var(--text)',
                            zIndex: block.created ? 3 : 1,
                            boxShadow: block.created ? 'var(--shadow-sm)' : 'none',
                          }}
                        >
                          <strong
                            style={{
                              display: 'block',
                              fontSize: m ? 11.5 : 12.5,
                              lineHeight: 1.15,
                              color: cVar(color),
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {subject.name}
                          </strong>

                          <span
                            style={{
                              display: 'block',
                              marginTop: 3,
                              fontSize: m ? 10.5 : 11.5,
                              color: 'var(--text-2)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {block.start}:00–{block.end}:00
                          </span>

                          {height > 56 && (
                            <span
                              style={{
                                display: 'block',
                                marginTop: 2,
                                fontSize: m ? 10 : 11,
                                color: 'var(--text-3)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {room}
                            </span>
                          )}

                          {block.created && height > 72 && (
                            <span
                              style={{
                                display: 'block',
                                marginTop: 3,
                                fontSize: m ? 9.5 : 10.5,
                                color: cVar(color),
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              Nueva clase
                            </span>
                          )}
                        </button>
                      )
                    })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <CsvImportModal
        open={showCsvImport}
        onClose={() => setShowCsvImport(false)}
        onImport={(blocks) => {
          onImportSchedule?.(blocks)
          toast?.(`${blocks.length} bloque${blocks.length !== 1 ? 's' : ''} importado${blocks.length !== 1 ? 's' : ''} correctamente`)
        }}
      />
    </FadeIn>
  )
}