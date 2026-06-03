import React from 'react'
import { useState } from 'react'
import { DATA } from '../data/data'
import { Button, Card, EmptyState, FadeIn, IconButton, Pill, SectionTitle, cSoftVar, cVar, subjectById, } from '../components/UI'
import { Icon } from '../components/Icons'
type AnyProps = Record<string, any>

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

  const [createType, setCreateType] = React.useState<'evento' | 'clase' | 'tarea' | null>(null)
  const [createTitle, setCreateTitle] = React.useState('')
  const [createTime, setCreateTime] = React.useState('08:00')

  const year = 2026
  const month = 4
  const first = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const openCreateForm = (type: 'evento' | 'clase' | 'tarea') => {
    setQuickCreateOpen(false)
    setCreateType(type)
    setCreateTitle('')
    setCreateTime('08:00')
  }

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
    setSelectedCreateDate(null)
  }

  const agendaDay = (day: number) => {
    const items: any[] = []

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

  const createOptions = [
    {
      type: 'evento' as const,
      icon: 'calendar',
      title: 'Crear evento',
      sub: 'Agregar una actividad puntual a este día.',
    },
    {
      type: 'clase' as const,
      icon: 'clock',
      title: 'Crear clase',
      sub: 'Programar una clase o bloque académico.',
    },
    {
      type: 'tarea' as const,
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
            <IconButton name="chevronLeft" size={34} iconSize={16} />
            <IconButton name="chevronRight" size={34} iconSize={16} />
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
              {sel === 8 ? 'Hoy · ' : ''}
              {sel} de {MONTHS[month]}
            </SectionTitle>

            {agendaDay(sel).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {agendaDay(sel).map((item: any, index: number, arr: any[]) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: 13,
                      padding: '11px 0',
                      borderBottom:
                        index === arr.length - 1 ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        minWidth: 46,
                        fontSize: 12.5,
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
                          fontSize: 13.5,
                          color: 'var(--text)',
                          fontWeight: 500,
                        }}
                      >
                        {item.title}
                      </div>

                      <div
                        style={{
                          fontSize: 11.5,
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
            ) : (
              <EmptyState
                icon="calendar"
                title="Día libre"
                body="No hay actividades programadas."
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
    </div>
  )
}
export function Schedule({ m, onAdd, toast }: AnyProps) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  const rowH = m ? 44 : 52
  const headH = m ? 34 : 40

  const [dayIdx, setDayIdx] = React.useState(0)

  const shownDays = m ? [dayIdx] : [0, 1, 2, 3, 4]
  const gridWidth = m ? '100%' : 820

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
              Semana típica · 6 materias · 18 créditos
            </p>
          </div>
        )}

        {!m && (
          <SectionTitle
            title="Horario"
            subtitle="Semana típica · 6 materias · 18 créditos"
            action={
              <Button size="sm" onClick={onAdd}>
                Agregar clase
              </Button>
            }
          />
        )}

        {m && (
          <div
            className="schedule-day-tabs"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
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
                minWidth: m ? 0 : 820,
                display: 'grid',
                gridTemplateColumns: m
                  ? '44px minmax(0, 1fr)'
                  : `56px repeat(${shownDays.length}, minmax(142px, 1fr))`,
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

                  {DATA.schedule
                    .filter((block: any) => block.day === dayIndex)
                    .map((block: any) => {
                      const subject = subjectById(block.subject)
                      const top = (block.start - hours[0]) * rowH
                      const height = Math.max(
                        (block.end - block.start) * rowH - 5,
                        42,
                      )

                      return (
                        <button
                          key={`${block.day}-${block.start}-${block.subject}`}
                          onClick={() =>
                            toast(
                              `${subject.name} · ${block.start}:00–${block.end}:00`,
                            )
                          }
                          style={{
                            position: 'absolute',
                            top: top + 3,
                            left: m ? 5 : 8,
                            right: m ? 5 : 8,
                            height,
                            cursor: 'pointer',
                            textAlign: 'left',
                            background: cSoftVar(subject.color),
                            border: 'none',
                            borderLeft: `3px solid ${cVar(subject.color)}`,
                            borderRadius: 'var(--r-xs)',
                            padding: m ? '7px 8px' : '8px 10px',
                            overflow: 'hidden',
                            color: 'var(--text)',
                          }}
                        >
                          <strong
                            style={{
                              display: 'block',
                              fontSize: m ? 11.5 : 12.5,
                              lineHeight: 1.15,
                              color: cVar(subject.color),
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
                              {subject.room}
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

        <div
          className="schedule-legend"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 7,
            marginTop: 14,
            width: '100%',
            minWidth: 0,
          }}
        >
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
      </div>
    </FadeIn>
  )
}