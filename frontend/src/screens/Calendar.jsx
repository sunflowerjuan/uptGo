// screen_calendar.jsx — Calendario (mes/agenda) + Horario semanal
const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
// day -> activity markers for May 2026 (subject color indices)
const DAY_MARKS = { 8: [1, 2, 3, 4], 10: [3], 12: [4], 14: [2, 2], 15: [6], 18: [1], 20: [2, 3], 22: [5], 27: [1, 4] };

function Calendar({ m, go, onAdd }) {
  const [view, setView] = React.useState('mes');
  const [sel, setSel] = React.useState(8);
  const year = 2026, month = 4; // May (0-idx)
  const first = new Date(year, month, 1);
  let startDow = (first.getDay() + 6) % 7; // make Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const agendaDay = (d) => {
    const items = [];
    if (DAY_MARKS[d]) {
      if (d === 8) return DATA.events.map(e => ({ time: e.time, title: e.title, sub: e.loc, color: subjectById(e.subject).color, type: 'evento' }));
      DAY_MARKS[d].forEach((c, i) => {
        const subj = DATA.subjects.find(s => s.color === c) || DATA.subjects[0];
        items.push({ time: ['08:00', '10:00', '14:00'][i % 3], title: subj.name, sub: subj.room, color: c, type: 'clase' });
      });
    }
    return items;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {m && <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Calendario</h1>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--r-full)', padding: 3 }}>
              {['mes', 'agenda'].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: '7px 16px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer',
                  background: view === v ? 'var(--surface)' : 'transparent', boxShadow: view === v ? 'var(--shadow-sm)' : 'none',
                  color: view === v ? 'var(--text)' : 'var(--text-2)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: view === v ? 600 : 500, textTransform: 'capitalize',
                }}>{v}</button>
              ))}
            </div>
            {!m && <Button icon="plus" onClick={onAdd}>Nuevo evento</Button>}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize', fontFamily: 'var(--font-display)' }}>{MONTHS[month]} {year}</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <IconButton name="chevronLeft" size={34} iconSize={16} />
            <IconButton name="chevronRight" size={34} iconSize={16} />
          </div>
        </div>
      </FadeIn>

      {view === 'mes' ? (
        <FadeIn delay={110}>
          <Card pad={m ? 10 : 16}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: m ? 2 : 6 }}>
              {DOW.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', padding: '4px 0 8px' }}>{m ? d[0] : d}</div>)}
              {cells.map((d, i) => {
                if (!d) return <div key={i} />;
                const today = d === 8; const selected = d === sel; const marks = DAY_MARKS[d] || [];
                return (
                  <button key={i} onClick={() => { setSel(d); if (m) setView('agenda'); }} style={{
                    aspectRatio: '1', minHeight: m ? 40 : 56, borderRadius: 'var(--r-sm)', cursor: 'pointer',
                    border: '1px solid ' + (selected ? 'var(--primary)' : 'transparent'),
                    background: today ? 'var(--primary)' : (selected ? 'var(--primary-soft)' : 'transparent'),
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: m ? 'center' : 'flex-start',
                    padding: m ? 0 : '7px 0', gap: 4, transition: 'background .15s',
                  }}>
                    <span style={{ fontSize: m ? 13 : 13.5, fontWeight: today ? 700 : 500, color: today ? 'var(--on-primary)' : (selected ? 'var(--primary-text)' : 'var(--text)'), fontFamily: 'var(--font-display)' }}>{d}</span>
                    {marks.length > 0 && <span style={{ display: 'flex', gap: 2 }}>
                      {marks.slice(0, 4).map((c, k) => <span key={k} style={{ width: m ? 4 : 5, height: m ? 4 : 5, borderRadius: '50%', background: today ? 'var(--on-primary)' : cVar(c) }} />)}
                    </span>}
                  </button>
                );
              })}
            </div>
          </Card>
        </FadeIn>
      ) : null}

      <FadeIn delay={view === 'mes' ? 160 : 110}>
        <Card pad={m ? 16 : 20}>
          <SectionTitle>{sel === 8 ? 'Hoy · ' : ''}{sel} de {MONTHS[month]}</SectionTitle>
          {agendaDay(sel).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {agendaDay(sel).map((it, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 13, padding: '11px 0', borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ minWidth: 46, fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600, fontFamily: 'var(--font-display)', paddingTop: 1 }}>{it.time}</div>
                  <div style={{ width: 3, borderRadius: 3, background: cVar(it.color), flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 500 }}>{it.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{it.sub}</div>
                  </div>
                  <Pill color="var(--text-2)" bg="var(--surface-2)">{it.type}</Pill>
                </div>
              ))}
            </div>
          ) : <EmptyState icon="calendar" title="Día libre" body="No hay actividades programadas." />}
        </Card>
      </FadeIn>
    </div>
  );
}

/* ---------------- HORARIO (weekly grid) ---------------- */
function Schedule({ m, onAdd, toast }) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const rowH = 46; const headH = 36;
  const [dayIdx, setDayIdx] = React.useState(0);
  const shownDays = m ? [dayIdx] : [0, 1, 2, 3, 4];

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
            {days.map((d, i) => (
              <button key={d} onClick={() => setDayIdx(i)} style={{
                flex: 1, padding: '9px 0', borderRadius: 'var(--r-sm)', border: '1px solid ' + (dayIdx === i ? 'transparent' : 'var(--border)'),
                background: dayIdx === i ? 'var(--primary)' : 'var(--surface)', color: dayIdx === i ? 'var(--on-primary)' : 'var(--text-2)',
                fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>{d}</button>
            ))}
          </div>
        </FadeIn>
      )}

      <FadeIn delay={110}>
        <Card pad={m ? 10 : 16} style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', minWidth: m ? 'auto' : 620 }}>
            {/* hour gutter */}
            <div style={{ width: 44, flexShrink: 0, paddingTop: headH }}>
              {hours.map(h => <div key={h} style={{ height: rowH, fontSize: 10.5, color: 'var(--text-3)', textAlign: 'right', paddingRight: 8, transform: 'translateY(-6px)' }}>{h}:00</div>)}
            </div>
            {shownDays.map(di => (
              <div key={di} style={{ flex: 1, position: 'relative', borderLeft: '1px solid var(--border)' }}>
                <div style={{ height: headH, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{days[di]}</div>
                <div style={{ position: 'relative' }}>
                  {hours.map(h => <div key={h} style={{ height: rowH, borderTop: '1px solid var(--border)' }} />)}
                  {DATA.schedule.filter(b => b.day === di).map((b, i) => {
                    const s = subjectById(b.subject);
                    const top = (b.start - hours[0]) * rowH;
                    const height = (b.end - b.start) * rowH - 4;
                    return (
                      <button key={i} onClick={() => toast(`${s.name} · ${b.start}:00–${b.end}:00`)} style={{
                        position: 'absolute', top: top + 2, left: 3, right: 3, height, cursor: 'pointer', textAlign: 'left',
                        background: cSoftVar(s.color), borderLeft: `3px solid ${cVar(s.color)}`, borderRadius: 'var(--r-xs)',
                        padding: '5px 7px', overflow: 'hidden', border: 'none', borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: cVar(s.color),
                      }}>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: cVar(s.color), lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 2 }}>{b.start}:00–{b.end}:00</div>
                        {height > 56 && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{s.room}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={160}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DATA.subjects.map(s => (
            <Pill key={s.id} color={cVar(s.color)} bg={cSoftVar(s.color)} dot>{s.name}</Pill>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}

Object.assign(window, { Calendar, Schedule });
