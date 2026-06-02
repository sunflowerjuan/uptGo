// screen_misc.jsx — Mapa de campus, Configuración, Pomodoro
function CampusMap({ m, toast }) {
  const [sel, setSel] = React.useState('p1');
  const place = DATA.campus.find(p => p.id === sel);
  // decorative building blocks (abstract)
  const blocks = [
    { x: 18, y: 18, w: 22, h: 16 }, { x: 52, y: 14, w: 26, h: 20 },
    { x: 16, y: 44, w: 18, h: 22 }, { x: 40, y: 46, w: 20, h: 16 },
    { x: 66, y: 50, w: 24, h: 26 }, { x: 30, y: 68, w: 24, h: 14 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FadeIn>
        <div>
          {m && <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Mapa del campus</h1>}
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: m ? 3 : 0 }}>Ubica aulas, laboratorios y tus lugares de estudio.</p>
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: m ? 280 : 380, background: 'var(--bg-tint)', overflow: 'hidden' }}>
            {/* paths */}
            <div style={{ position: 'absolute', left: '8%', right: '8%', top: '40%', height: 10, background: 'var(--surface-2)', borderRadius: 5 }} />
            <div style={{ position: 'absolute', top: '10%', bottom: '10%', left: '46%', width: 10, background: 'var(--surface-2)', borderRadius: 5 }} />
            {/* blocks */}
            {blocks.map((b, i) => (
              <div key={i} style={{ position: 'absolute', left: b.x + '%', top: b.y + '%', width: b.w + '%', height: b.h + '%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', boxShadow: 'var(--shadow-sm)' }} />
            ))}
            {/* pins */}
            {DATA.campus.map(p => {
              const active = p.id === sel;
              return (
                <button key={p.id} onClick={() => setSel(p.id)} style={{
                  position: 'absolute', left: p.x + '%', top: p.y + '%', transform: 'translate(-50%,-100%)',
                  background: 'none', border: 'none', cursor: 'pointer', zIndex: active ? 5 : 2, transition: 'transform .15s',
                }}>
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{
                      width: active ? 36 : 28, height: active ? 36 : 28, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)',
                      background: cVar(p.color), boxShadow: 'var(--shadow-md)', border: '2px solid var(--surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s var(--ease)',
                    }}>
                      <span style={{ transform: 'rotate(45deg)', color: '#fff', display: 'flex' }}><Icon name={p.fav ? 'star' : 'mapPin'} size={active ? 15 : 12} color="#fff" /></span>
                    </span>
                  </span>
                </button>
              );
            })}
            <div style={{ position: 'absolute', top: 12, left: 12, fontFamily: 'monospace', fontSize: 10, color: 'var(--text-3)', background: 'var(--surface)', padding: '4px 9px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)' }}>Campus · vista esquemática</div>
          </div>
          {place && (
            <div style={{ padding: m ? 16 : 18, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 13 }}>
              <span style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: cSoftVar(place.color), color: cVar(place.color), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={place.fav ? 'star' : 'mapPin'} size={19} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{place.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{place.kind}</div>
              </div>
              <Button variant="soft" size="sm" icon="arrowRight" onClick={() => toast('Cómo llegar a ' + place.name)}>Ir</Button>
            </div>
          )}
        </Card>
      </FadeIn>

      <FadeIn delay={120}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 15px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: 12.5, color: 'var(--text-2)' }}>
          <Icon name="mapPin" size={15} color="var(--text-3)" />
          La geolocalización se usa solo con la app en primer plano. Sin rastreo en segundo plano.
        </div>
      </FadeIn>
    </div>
  );
}

/* ---------------- CONFIGURACIÓN ---------------- */
function ToggleSwitch({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 44, height: 26, borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
      background: on ? 'var(--primary)' : 'var(--border-strong)', transition: 'background .2s',
    }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: 'var(--surface)', transition: 'left .2s var(--ease)', boxShadow: 'var(--shadow-sm)' }} />
    </button>
  );
}

function SettingRow({ icon, title, sub, children, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      {icon && <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={16} /></span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function Settings({ m, theme, onTheme, palette, onPalette, onLogout, toast }) {
  const [notif, setNotif] = React.useState({ vencimiento: true, clase: true, recordatorio: true, sync: false });
  const [lang, setLang] = React.useState('es');
  const palettes = [['verde', 'Verde'], ['cobalto', 'Cobalto'], ['arcilla', 'Arcilla']];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720, width: '100%', margin: '0 auto' }}>
      {m && <FadeIn><h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Configuración</h1></FadeIn>}

      <FadeIn delay={50}>
        <Card pad={m ? 18 : 22}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <Avatar initials={DATA.user.initials} size={64} />
              <button onClick={() => toast('Cambiar foto (cámara)')} style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="camera" size={13} /></button>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{DATA.user.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{DATA.user.program}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 1 }}>{DATA.user.email}</div>
            </div>
            {!m && <Button variant="outline" size="sm" icon="edit" onClick={() => toast('Editar perfil')}>Editar</Button>}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={100}>
        <Card pad={m ? 16 : 20}>
          <SectionTitle>Apariencia</SectionTitle>
          <SettingRow icon="moon" title="Tema" sub="Claro, oscuro o según el sistema">
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', padding: 3 }}>
              {[['light', 'sun'], ['dark', 'moon']].map(([t, ic]) => (
                <button key={t} onClick={() => theme !== t && onTheme()} style={{ width: 34, height: 30, borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', background: theme === t ? 'var(--surface)' : 'transparent', boxShadow: theme === t ? 'var(--shadow-sm)' : 'none', color: theme === t ? 'var(--primary-text)' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={15} /></button>
              ))}
            </div>
          </SettingRow>
          <SettingRow icon="layers" title="Paleta de color" sub="Tema visual de la aplicación" last>
            <div style={{ display: 'flex', gap: 7 }}>
              {palettes.map(([id, label]) => (
                <button key={id} onClick={() => onPalette(id)} title={label} style={{
                  width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', border: '2px solid ' + (palette === id ? 'var(--text)' : 'var(--border)'),
                  background: { verde: 'oklch(0.52 0.125 142)', cobalto: 'oklch(0.52 0.16 258)', arcilla: 'oklch(0.58 0.135 45)' }[id],
                }} />
              ))}
            </div>
          </SettingRow>
        </Card>
      </FadeIn>

      <FadeIn delay={150}>
        <Card pad={m ? 16 : 20}>
          <SectionTitle>Notificaciones</SectionTitle>
          {[['vencimiento', 'flag', 'Vencimiento de tareas'], ['clase', 'clock', 'Inicio de clases'], ['recordatorio', 'bell', 'Recordatorios personales'], ['sync', 'cloudCheck', 'Sincronización completada']].map(([k, ic, label], i, arr) => (
            <SettingRow key={k} icon={ic} title={label} last={i === arr.length - 1}>
              <ToggleSwitch on={notif[k]} onChange={(v) => setNotif(s => ({ ...s, [k]: v }))} />
            </SettingRow>
          ))}
        </Card>
      </FadeIn>

      <FadeIn delay={200}>
        <Card pad={m ? 16 : 20}>
          <SectionTitle>Preferencias</SectionTitle>
          <SettingRow icon="globe" title="Idioma">
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', padding: 3 }}>
              {[['es', 'ES'], ['en', 'EN']].map(([id, label]) => (
                <button key={id} onClick={() => setLang(id)} style={{ padding: '5px 13px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', background: lang === id ? 'var(--surface)' : 'transparent', boxShadow: lang === id ? 'var(--shadow-sm)' : 'none', color: lang === id ? 'var(--text)' : 'var(--text-3)', fontFamily: 'var(--font-ui)', fontSize: 12.5, fontWeight: 600 }}>{label}</button>
              ))}
            </div>
          </SettingRow>
          <SettingRow icon="timer" title="Duración Pomodoro" sub="Enfoque / descanso">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}>25 / 5 min</span>
          </SettingRow>
          <SettingRow icon="download" title="Almacenamiento local" sub="14.2 MB usados · datos offline" last>
            <Button variant="ghost" size="sm" onClick={() => toast('Caché limpiada')}>Limpiar</Button>
          </SettingRow>
        </Card>
      </FadeIn>

      <FadeIn delay={250}>
        <Button variant="danger" icon="logout" full onClick={onLogout}>Cerrar sesión</Button>
      </FadeIn>
      <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-3)', paddingBottom: 4 }}>UPTGO · versión 1.0 · PWA</div>
    </div>
  );
}

/* ---------------- POMODORO MODAL ---------------- */
function Pomodoro({ open, onClose }) {
  const WORK = 25 * 60, BREAK = 5 * 60;
  const [mode, setMode] = React.useState('work');
  const [secs, setSecs] = React.useState(WORK);
  const [running, setRunning] = React.useState(false);
  const total = mode === 'work' ? WORK : BREAK;
  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs(s => s <= 1 ? 0 : s - 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  React.useEffect(() => { if (secs === 0) setRunning(false); }, [secs]);
  React.useEffect(() => { setSecs(mode === 'work' ? WORK : BREAK); setRunning(false); }, [mode]);
  const pct = ((total - secs) / total) * 100;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return (
    <Sheet open={open} onClose={onClose} title="Pomodoro">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, padding: '10px 0 6px' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', padding: 3 }}>
          {[['work', 'Enfoque'], ['break', 'Descanso']].map(([id, label]) => (
            <button key={id} onClick={() => setMode(id)} style={{ padding: '8px 20px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', background: mode === id ? 'var(--surface)' : 'transparent', boxShadow: mode === id ? 'var(--shadow-sm)' : 'none', color: mode === id ? 'var(--text)' : 'var(--text-2)', fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: mode === id ? 600 : 500 }}>{label}</button>
          ))}
        </div>
        <div style={{ position: 'relative', width: 220, height: 220 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(var(--primary) ${pct}%, var(--surface-2) ${pct}%)`, transition: 'background .9s linear' }} />
          <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 52, fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{mm}:{ss}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>{mode === 'work' ? 'Tiempo de estudio' : 'Toma un respiro'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" icon="refresh" onClick={() => { setSecs(total); setRunning(false); }}>Reiniciar</Button>
          <Button variant="primary" icon={running ? 'pause' : 'play'} onClick={() => setRunning(r => !r)} style={{ minWidth: 130 }}>{running ? 'Pausar' : 'Iniciar'}</Button>
        </div>
      </div>
    </Sheet>
  );
}

Object.assign(window, { CampusMap, Settings, Pomodoro, ToggleSwitch });
