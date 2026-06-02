// nav.jsx — navigation surfaces. Sidebar / rail / top tabs (desktop) + bottom nav (mobile).
const NAV_GROUPS = [
  { label: 'Principal', items: [
    { id: 'dashboard', label: 'Inicio', icon: 'dashboard' },
    { id: 'tasks', label: 'Tareas', icon: 'tasks' },
    { id: 'calendar', label: 'Calendario', icon: 'calendar' },
    { id: 'schedule', label: 'Horario', icon: 'clock' },
  ]},
  { label: 'Académico', items: [
    { id: 'notes', label: 'Notas', icon: 'notes' },
    { id: 'reminders', label: 'Recordatorios', icon: 'bell' },
    { id: 'map', label: 'Mapa del campus', icon: 'mapPin' },
  ]},
  { label: 'Cuenta', items: [
    { id: 'settings', label: 'Configuración', icon: 'settings' },
  ]},
];
const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);
const navItem = (id) => ALL_NAV.find(i => i.id === id);

/* ---------------- DESKTOP SIDEBAR / RAIL ---------------- */
function Sidebar({ route, go, rail, user, onPomodoro }) {
  const [hovId, setHovId] = React.useState(null);
  return (
    <nav style={{
      width: rail ? 76 : 232, flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      padding: rail ? '14px 0' : '16px 0', overflowY: 'auto', transition: 'width .25s var(--ease)',
    }}>
      <div style={{ padding: rail ? '0 0 14px' : '0 20px 16px', display: 'flex', justifyContent: rail ? 'center' : 'flex-start' }}>
        <button onClick={() => go('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {rail ? <Logo variant="mark" size={36} /> : <Logo variant="full" size={32} />}
        </button>
      </div>

      {NAV_GROUPS.map((g, gi) => (
        <div key={gi} style={{ marginBottom: 4 }}>
          {!rail && <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-3)', textTransform: 'uppercase', padding: '12px 20px 5px' }}>{g.label}</div>}
          {rail && gi > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '8px 18px' }} />}
          {g.items.map(it => {
            const active = route === it.id;
            const hov = hovId === it.id;
            return (
              <button key={it.id} onClick={() => go(it.id)} title={rail ? it.label : undefined}
                onMouseEnter={() => setHovId(it.id)} onMouseLeave={() => setHovId(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11, width: '100%',
                  padding: rail ? '0' : '9px 20px', height: rail ? 48 : 'auto',
                  justifyContent: rail ? 'center' : 'flex-start',
                  background: active ? 'var(--primary-soft)' : (hov ? 'var(--surface-2)' : 'transparent'),
                  border: 'none', borderLeft: rail ? 'none' : ('2px solid ' + (active ? 'var(--primary)' : 'transparent')),
                  color: active ? 'var(--primary-text)' : (hov ? 'var(--text)' : 'var(--text-2)'),
                  fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: active ? 600 : 500,
                  cursor: 'pointer', transition: 'background .14s, color .14s', position: 'relative',
                }}>
                {rail && active && <span style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, borderRadius: '0 3px 3px 0', background: 'var(--primary)' }} />}
                <span style={{
                  display: 'inline-flex', ...(rail ? { width: 40, height: 40, borderRadius: 'var(--r-sm)', alignItems: 'center', justifyContent: 'center', background: active ? 'transparent' : 'transparent' } : {}),
                }}>
                  <Icon name={it.icon} size={rail ? 20 : 18} stroke={active ? 2 : 1.8} />
                </span>
                {!rail && it.label}
              </button>
            );
          })}
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: rail ? '12px 0 0' : '12px 14px 0' }}>
        <button onClick={onPomodoro} title="Temporizador Pomodoro"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: rail ? 48 : '100%', height: 44, margin: rail ? '0 auto' : 0,
            background: 'var(--bg-tint)', color: 'var(--text-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500,
          }}>
          <Icon name="timer" size={17} />{!rail && 'Pomodoro'}
        </button>
        {!rail && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 6px 4px', marginTop: 10, borderTop: '1px solid var(--border)' }}>
            <Avatar initials={user.initials} size={34} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.short}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{user.program}</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ---------------- DESKTOP TOP TABS ---------------- */
function TopTabs({ route, go }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'var(--surface-2)', padding: 4, borderRadius: 'var(--r-full)' }}>
      {ALL_NAV.filter(i => i.id !== 'settings').map(it => {
        const active = route === it.id;
        return (
          <button key={it.id} onClick={() => go(it.id)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px',
            background: active ? 'var(--surface)' : 'transparent', boxShadow: active ? 'var(--shadow-sm)' : 'none',
            color: active ? 'var(--text)' : 'var(--text-2)', border: 'none', borderRadius: 'var(--r-full)',
            fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: active ? 600 : 500, cursor: 'pointer',
            transition: 'background .15s, color .15s',
          }}>
            <Icon name={it.icon} size={16} stroke={active ? 2 : 1.8} />{it.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- TOPBAR ---------------- */
function TopBar({ isMobile, navStyle, route, go, user, online, onSearch, onNotif, onMenu, onTheme, theme, unread }) {
  const title = (navItem(route) || {}).label || 'UPTGO';
  return (
    <header style={{
      background: 'color-mix(in oklch, var(--surface) 86%, transparent)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 14, padding: isMobile ? '0 14px' : '0 22px',
      height: isMobile ? 56 : 60, flexShrink: 0, zIndex: 20, position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {isMobile ? (
          <button onClick={() => go('dashboard')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Logo variant="mark" size={30} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--text)' }}>{route === 'dashboard' ? 'UPTGO' : title}</span>
          </button>
        ) : navStyle === 'top' ? (
          <React.Fragment>
            <button onClick={() => go('dashboard')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <Logo variant="full" size={30} />
            </button>
            <div style={{ marginLeft: 18 }}><TopTabs route={route} go={go} /></div>
          </React.Fragment>
        ) : (
          <h1 style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>{title}</h1>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '8px 14px', width: 260 }}>
            <Icon name="search" size={15} color="var(--text-3)" />
            <input placeholder="Buscar tareas, notas, materias…" onFocus={onSearch} readOnly
              style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text)', width: '100%', cursor: 'pointer' }} />
          </div>
        )}
        <SyncChip online={online} compact={isMobile} />
        {isMobile && <IconButton name="search" onClick={onSearch} title="Buscar" />}
        <IconButton name="bell" onClick={onNotif} badge={unread > 0} title="Notificaciones" />
        <IconButton name={theme === 'dark' ? 'sun' : 'moon'} onClick={onTheme} title="Tema" />
        {isMobile
          ? <IconButton name="menu" onClick={onMenu} title="Menú" />
          : <button onClick={() => go('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Avatar initials={user.initials} size={36} /></button>}
      </div>
    </header>
  );
}

/* ---------------- SYNC CHIP (offline indicator, RF-08/RF-11) ---------------- */
function SyncChip({ online, compact }) {
  const [pulse, setPulse] = React.useState(false);
  React.useEffect(() => { if (online) { setPulse(true); const t = setTimeout(() => setPulse(false), 1800); return () => clearTimeout(t); } }, [online]);
  const color = online ? 'var(--ok)' : 'var(--warn)';
  return (
    <div title={online ? 'En línea · sincronizado' : 'Sin conexión · cambios en cola'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, padding: compact ? '6px 9px' : '7px 12px',
        borderRadius: 'var(--r-full)', background: online ? 'var(--ok-soft)' : 'var(--warn-soft)',
        color, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      }}>
      <span style={{ position: 'relative', width: 8, height: 8 }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
        {online && pulse && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1.5px solid ${color}`, animation: 'uptgo-ping 1.4s var(--ease-out) infinite' }} />}
      </span>
      {!compact && (online ? 'Sincronizado' : 'Sin conexión')}
    </div>
  );
}

/* ---------------- MOBILE BOTTOM NAV ---------------- */
const BOTTOM_ITEMS = ['dashboard', 'tasks', '__fab', 'calendar', 'notes'];
function BottomNav({ route, go, onAdd }) {
  return (
    <nav style={{
      flexShrink: 0, background: 'color-mix(in oklch, var(--surface) 92%, transparent)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
      alignItems: 'center', padding: '6px 8px calc(6px + env(safe-area-inset-bottom))', position: 'relative', zIndex: 20,
    }}>
      {BOTTOM_ITEMS.map((id, i) => {
        if (id === '__fab') return (
          <div key="fab" style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={onAdd} aria-label="Crear" style={{
              width: 52, height: 52, marginTop: -22, borderRadius: 'var(--r-md)', border: '3px solid var(--surface)',
              background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-md)', cursor: 'pointer', transition: 'transform .12s var(--ease)',
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <Icon name="plus" size={24} stroke={2.2} />
            </button>
          </div>
        );
        const it = navItem(id); const active = route === id;
        return (
          <button key={id} onClick={() => go(id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 0',
            background: 'none', border: 'none', cursor: 'pointer',
            color: active ? 'var(--primary-text)' : 'var(--text-3)', transition: 'color .15s',
          }}>
            <Icon name={it.icon} size={22} stroke={active ? 2.1 : 1.8} />
            <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 500, fontFamily: 'var(--font-ui)' }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------------- MOBILE MENU SHEET ---------------- */
function MenuSheet({ open, onClose, route, go, user, theme, onTheme, onPomodoro }) {
  const extra = [navItem('schedule'), navItem('reminders'), navItem('map'), navItem('settings')];
  return (
    <Sheet open={open} onClose={onClose} title="Menú">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 2px 16px' }}>
        <Avatar initials={user.initials} size={46} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{user.program} · {user.semester}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {extra.map(it => (
          <button key={it.id} onClick={() => { go(it.id); onClose(); }} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '14px 14px', textAlign: 'left',
            background: route === it.id ? 'var(--primary-soft)' : 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', cursor: 'pointer', color: route === it.id ? 'var(--primary-text)' : 'var(--text)',
            fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 500,
          }}>
            <Icon name={it.icon} size={19} />{it.label}
          </button>
        ))}
        <button onClick={() => { onPomodoro(); onClose(); }} style={{
          display: 'flex', alignItems: 'center', gap: 11, padding: '14px', background: 'var(--surface-2)',
          border: '1px solid var(--border)', borderRadius: 'var(--r-md)', cursor: 'pointer', color: 'var(--text)',
          fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 500,
        }}>
          <Icon name="timer" size={19} />Pomodoro
        </button>
        <button onClick={onTheme} style={{
          display: 'flex', alignItems: 'center', gap: 11, padding: '14px', background: 'var(--surface-2)',
          border: '1px solid var(--border)', borderRadius: 'var(--r-md)', cursor: 'pointer', color: 'var(--text)',
          fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 500,
        }}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />{theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
        </button>
      </div>
    </Sheet>
  );
}

/* ---------------- GENERIC BOTTOM SHEET / MODAL ---------------- */
function Sheet({ open, onClose, title, children, side }) {
  const isMobile = window.__UPTGO_MOBILE__;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60, pointerEvents: open ? 'auto' : 'none',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'oklch(0 0 0 / 0.38)', backdropFilter: 'blur(2px)',
        opacity: open ? 1 : 0, transition: 'opacity .3s var(--ease)',
      }} />
      <div style={{
        position: 'absolute', background: 'var(--surface)', boxShadow: 'var(--shadow-pop)',
        ...(isMobile ? {
          left: 0, right: 0, bottom: 0, maxHeight: '86%', borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
          transform: open ? 'translateY(0)' : 'translateY(102%)',
        } : {
          top: 0, bottom: 0, right: 0, width: 'min(440px, 92%)', borderRadius: 'var(--r-lg) 0 0 var(--r-lg)',
          transform: open ? 'translateX(0)' : 'translateX(102%)',
        }),
        transition: 'transform .38s var(--ease)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {isMobile && <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-strong)', margin: '10px auto 2px' }} />}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: title ? '1px solid var(--border)' : 'none' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{title}</h3>
          <IconButton name="x" size={32} iconSize={16} onClick={onClose} />
        </div>
        <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

Object.assign(window, { NAV_GROUPS, ALL_NAV, navItem, Sidebar, TopTabs, TopBar, SyncChip, BottomNav, MenuSheet, Sheet });
