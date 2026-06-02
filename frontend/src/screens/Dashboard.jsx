// screen_dashboard.jsx — Inicio
function MetricCard({ icon, color, label, value, sub, onClick }) {
  return (
    <Card hover={!!onClick} onClick={onClick} pad={16} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: cSoftVar(color), color: cVar(color), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={16} stroke={2} />
        </span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 500, color: 'var(--text)', lineHeight: 1.1, marginTop: 4, fontFamily: 'var(--font-display)' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

function DashTaskRow({ t, onToggle, onOpen }) {
  const s = subjectById(t.subject); const pr = PRIORITY[t.priority];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
      <button onClick={(e) => { e.stopPropagation(); onToggle(t.id); }} style={{
        width: 19, height: 19, borderRadius: 6, marginTop: 1, flexShrink: 0, cursor: 'pointer',
        border: t.done ? 'none' : '1.8px solid var(--border-strong)', background: t.done ? 'var(--primary)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s var(--ease)',
      }}>{t.done && <Icon name="check" size={12} color="var(--on-primary)" stroke={3} />}</button>
      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onOpen(t.id)}>
        <div style={{ fontSize: 13.5, color: t.done ? 'var(--text-3)' : 'var(--text)', textDecoration: t.done ? 'line-through' : 'none', fontWeight: 500, lineHeight: 1.35 }}>{t.title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: cVar(s.color) }} />{s.name}</span>
          <span>· {t.dueShort}</span>
          {!t.done && <Pill color={pr.color} bg={pr.soft}>{pr.label}</Pill>}
        </div>
      </div>
    </div>
  );
}

function EventRow({ e, last }) {
  const s = subjectById(e.subject);
  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <div style={{ minWidth: 46, fontSize: 12, color: 'var(--text-2)', fontWeight: 600, paddingTop: 1, fontFamily: 'var(--font-display)' }}>{e.time}</div>
      <div style={{ width: 3, borderRadius: 3, background: cVar(s.color), flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 500 }}>{e.title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icon name={e.type === 'asesoria' ? 'globe' : 'mapPin'} size={12} />{e.loc} · {e.dur}
        </div>
      </div>
    </div>
  );
}

function HeroFocus({ m, onOpenTask, go }) {
  return (
    <div style={{
      borderRadius: 'var(--r-lg)', overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(145deg, var(--primary), var(--primary-hover))', color: 'var(--on-primary)',
      padding: m ? '20px' : '28px 30px', boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ position: 'absolute', top: -60, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'oklch(1 0 0 / 0.08)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Lo próximo · ahora</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: m ? 22 : 28, fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Entrega: Proyecto de Bases de Datos</div>
            <div style={{ fontSize: 14, opacity: 0.92, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="clock" size={16} color="#fff" />Hoy 11:59 p.m. · quedan 3 horas</div>
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <button onClick={() => onOpenTask('t1')} style={{ padding: '11px 18px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', background: 'var(--surface)', color: 'var(--primary-text)', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>Ver tarea</button>
            <button onClick={() => go('schedule')} style={{ padding: '11px 16px', borderRadius: 'var(--r-sm)', border: '1.5px solid oklch(1 0 0 / 0.4)', cursor: 'pointer', background: 'transparent', color: '#fff', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600 }}>Horario</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ m, go, tasks, onToggle, onOpenTask, variant = 'resumen' }) {
  const upcoming = tasks.filter(t => !t.done).slice(0, 4);
  const pend = tasks.filter(t => !t.done).length;
  const altas = tasks.filter(t => !t.done && t.priority === 'alta').length;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const enfoque = variant === 'enfoque';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: m ? 16 : 20 }}>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: m ? 22 : 25, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>{greet}, {DATA.user.short.split(' ')[0]}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>Viernes, 8 de mayo de 2026</p>
          </div>
          {!m && <Pill color="var(--primary-text)" bg="var(--primary-soft)" style={{ fontSize: 12, padding: '6px 13px' }}>{DATA.user.semester}</Pill>}
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        {enfoque ? <HeroFocus m={m} onOpenTask={onOpenTask} go={go} /> : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 11, padding: '13px 16px', borderRadius: 'var(--r-md)',
          background: 'var(--primary-soft)', border: '1px solid color-mix(in oklch, var(--primary) 18%, transparent)',
        }}>
          <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="flag" size={17} stroke={2} />
          </span>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--primary-text)', lineHeight: 1.4 }}>
            <strong style={{ fontWeight: 600 }}>Entrega hoy:</strong> Proyecto de Bases de Datos · 11:59 p.m. — quedan <strong>3 horas</strong>.
          </div>
          {!m && <Button size="sm" variant="primary" onClick={() => onOpenTask('t1')}>Ver tarea</Button>}
        </div>
        )}
      </FadeIn>

      <FadeIn delay={120}>
        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr 1fr' : 'repeat(4, 1fr)', gap: m ? 11 : 14 }}>
          <MetricCard icon="tasks" color={1} label="Pendientes" value={pend} sub={`${altas} de alta prioridad`} onClick={() => go('tasks')} />
          <MetricCard icon="clock" color={2} label="Clases hoy" value="4" sub="Próxima en 1 h 20 m" onClick={() => go('schedule')} />
          <MetricCard icon="chart" color={3} label="Promedio" value="3.8" sub="Sobre 5.0" onClick={() => go('settings')} />
          <MetricCard icon="flame" color={4} label="Racha" value={`${DATA.user.streak} d`} sub="¡Sigue así!" />
        </div>
      </FadeIn>

      <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', gap: m ? 16 : 16 }}>
        <FadeIn delay={180}>
          <Card pad={m ? 16 : 18}>
            <SectionTitle action="Ver todas" onAction={() => go('tasks')}>Tareas próximas</SectionTitle>
            <div>{upcoming.map(t => <DashTaskRow key={t.id} t={t} onToggle={onToggle} onOpen={onOpenTask} />)}</div>
          </Card>
        </FadeIn>
        <FadeIn delay={240}>
          <Card pad={m ? 16 : 18}>
            <SectionTitle action="Calendario" onAction={() => go('calendar')}>Eventos de hoy</SectionTitle>
            <div>{DATA.events.map((e, i) => <EventRow key={e.id} e={e} last={i === DATA.events.length - 1} />)}</div>
          </Card>
        </FadeIn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', gap: 16 }}>
        <FadeIn delay={300}>
          <Card pad={m ? 16 : 18}>
            <SectionTitle action="Ver semana" onAction={() => go('schedule')}>Rendimiento por materia</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DATA.subjects.slice(0, 5).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ minWidth: m ? 96 : 120, fontSize: 12.5, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  <ProgressBar value={s.progress} color={cVar(s.color)} />
                  <div style={{ minWidth: 28, textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{s.grade.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>
        <FadeIn delay={360}>
          <Card pad={m ? 16 : 18}>
            <SectionTitle action="Ver horario" onAction={() => go('schedule')}>Próximas clases</SectionTitle>
            <div>
              {DATA.events.slice(0, 4).map((e, i) => <EventRow key={e.id} e={e} last={i === 3} />)}
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
