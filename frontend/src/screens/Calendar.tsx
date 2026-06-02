import React from 'react'
import { DATA } from '../data/data'
import {
  Button,
  Card,
  EmptyState,
  FadeIn,
  IconButton,
  Pill,
  SectionTitle,
  cSoftVar,
  cVar,
  subjectById,
} from '../components/UI'
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

  const year = 2026
  const month = 4
  const first = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

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
        const subj = DATA.subjects.find((subject: any) => subject.color === color) || DATA.subjects[0]

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {m && <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Calendario</h1>}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--r-full)', padding: 3 }}>
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

            {!m && <Button icon="plus" onClick={onAdd}>Nuevo evento</Button>}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize', fontFamily: 'var(--font-display)' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: m ? 2 : 6 }}>
              {DOW.map((day) => (
                <div key={day} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', padding: '4px 0 8px' }}>
                  {m ? day[0] : day}
                </div>
              ))}

              {cells.map((day, index) => {
                if (!day) return <div key={index} />

                const today = day === 8
                const selected = day === sel
                const marks = DAY_MARKS[day] || []

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
                    style={{
                      aspectRatio: '1',
                      minHeight: m ? 40 : 72,
                      borderRadius: 'var(--r-sm)',
                      cursor: 'pointer',
                      border: '1px solid ' + (selected ? 'var(--primary)' : today ? 'var(--primary-soft)' : 'transparent'),
                      background: selected ? 'var(--primary-soft)' : today ? 'color-mix(in oklch, var(--primary) 10%, var(--surface))' : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      padding: m ? '6px 0' : '7px 0',
                      gap: 2,
                      overflow: 'hidden',
                      transition: 'background .15s',
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
                          color: selected || today ? 'var(--primary-text)' : 'var(--text)', fontFamily: 'var(--font-display)',
                        }}
                      >
                        {day}
                      </span>
                    </div>

                    {monthPreview(day).length > 0 && (
                      <div
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
                        {monthPreview(day).map((item: any, itemIndex: number) => (
                          <span
                            key={itemIndex}
                            style={{
                              width: '100%',
                              minHeight: m ? 5 : 14,
                              borderRadius: 6,
                              background: cSoftVar(item.color),
                              color: cVar(item.color),
                              borderLeft: m ? 'none' : `2px solid ${cVar(item.color)}`,
                              display: 'flex',
                              alignItems: 'center',
                              padding: m ? 0 : '0 5px',
                              fontSize: 9.5,
                              fontWeight: 600,
                              lineHeight: 1,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              opacity: selected ? 1 : 0.86,
                            }}
                          >
                            {!m && `${item.time} ${item.title}`}
                          </span>
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
      {popupDay && agendaDay(popupDay).length > 0 && (
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
              width: m ? '100%' : 380,
              maxWidth: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow-pop)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '15px 16px',
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
                  {agendaDay(popupDay).length} actividad{agendaDay(popupDay).length === 1 ? '' : 'es'}
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

            <div style={{ padding: '6px 16px 12px' }}>
              {agendaDay(popupDay).map((item: any, index: number, arr: any[]) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: index === arr.length - 1 ? 'none' : '1px solid var(--border)',
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
                        fontSize: 13.5,
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

    </div>
  )
}

export function Schedule({ m, onAdd, toast }: AnyProps) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  const rowH = 46
  const headH = 36
  const [dayIdx, setDayIdx] = React.useState(0)
  const shownDays = m ? [dayIdx] : [0, 1, 2, 3, 4]


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            {m && <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Horario</h1>}
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: m ? 3 : 0 }}>Semana típica · 6 materias · 18 créditos</p>
          </div>

          {!m && <Button icon="plus" onClick={onAdd}>Agregar clase</Button>}
        </div>
      </FadeIn>

      {m && (
        <FadeIn delay={50}>
          <div style={{ display: 'flex', gap: 7 }}>
            {days.map((day, index) => (
              <button
                key={day}
                onClick={() => setDayIdx(index)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid ' + (dayIdx === index ? 'transparent' : 'var(--border)'),
                  background: dayIdx === index ? 'var(--primary)' : 'var(--surface)',
                  color: dayIdx === index ? 'var(--on-primary)' : 'var(--text-2)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </FadeIn>
      )}

      <FadeIn delay={110}>
        <Card pad={m ? 10 : 16} style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', minWidth: m ? 'auto' : 620 }}>
            <div style={{ width: 44, flexShrink: 0, paddingTop: headH }}>
              {hours.map((hour) => (
                <div key={hour} style={{ height: rowH, fontSize: 10.5, color: 'var(--text-3)', textAlign: 'right', paddingRight: 8, transform: 'translateY(-6px)' }}>
                  {hour}:00
                </div>
              ))}
            </div>

            {shownDays.map((dayIndex) => (
              <div key={dayIndex} style={{ flex: 1, position: 'relative', borderLeft: '1px solid var(--border)' }}>
                <div style={{ height: headH, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
                  {days[dayIndex]}
                </div>

                <div style={{ position: 'relative' }}>
                  {hours.map((hour) => (
                    <div key={hour} style={{ height: rowH, borderTop: '1px solid var(--border)' }} />
                  ))}

                  {DATA.schedule.filter((block: any) => block.day === dayIndex).map((block: any, index: number) => {
                    const subject = subjectById(block.subject)
                    const top = (block.start - hours[0]) * rowH
                    const height = (block.end - block.start) * rowH - 4

                    return (
                      <button
                        key={index}
                        onClick={() => toast(`${subject.name} · ${block.start}:00–${block.end}:00`)}
                        style={{
                          position: 'absolute',
                          top: top + 2,
                          left: 3,
                          right: 3,
                          height,
                          cursor: 'pointer',
                          textAlign: 'left',
                          background: cSoftVar(subject.color),
                          borderLeft: `3px solid ${cVar(subject.color)}`,
                          borderRadius: 'var(--r-xs)',
                          padding: '5px 7px',
                          overflow: 'hidden',
                          border: 'none',
                          borderLeftWidth: 3,
                          borderLeftStyle: 'solid',
                          borderLeftColor: cVar(subject.color),
                        }}
                      >
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: cVar(subject.color), lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {subject.name}
                        </div>

                        <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 2 }}>
                          {block.start}:00–{block.end}:00
                        </div>

                        {height > 56 && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{subject.room}</div>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={160}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DATA.subjects.map((subject: any) => (
            <Pill key={subject.id} color={cVar(subject.color)} bg={cSoftVar(subject.color)} dot>
              {subject.name}
            </Pill>
          ))}
        </div>
      </FadeIn>
    </div>
  )
}