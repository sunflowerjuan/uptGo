import React, { useState } from 'react'
import { DATA } from '../data/data'
import { GoogleCampusMap, type CampusPlace } from '../components/GoogleCampusMap'
import { Icon } from '../components/Icons'
import { Avatar, Button, Card, FadeIn, SectionTitle, Sheet } from '../components/UI'
import { useAuth } from '../contexts/AuthContext'
import { ApiError } from '../services/api'

type AnyProps = Record<string, any>

const CAMPUS_PLACES: CampusPlace[] = [
  {
    id: 'aula-204',
    title: 'Aula 204 · Bloque C',
    subtitle: 'Bases de Datos',
    query: 'Universidad Pedagógica y Tecnológica de Colombia Tunja Bloque C',
  },
  {
    id: 'biblioteca',
    title: 'Biblioteca',
    subtitle: 'Zona de estudio',
    query: 'Biblioteca UPTC Tunja',
  },
  {
    id: 'laboratorios',
    title: 'Laboratorios',
    subtitle: 'Prácticas académicas',
    query: 'Laboratorios UPTC Tunja',
  },
  {
    id: 'cafeteria',
    title: 'Cafetería',
    subtitle: 'Punto de descanso',
    query: 'Cafetería UPTC Tunja',
  },
]
export function CampusMap({ m }: any) {
  const [selectedPlace, setSelectedPlace] = useState<CampusPlace>(CAMPUS_PLACES[0])

  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: m ? 14 : 20,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: m ? 24 : 28,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}
        >
          Mapa del campus
        </h1>

        <p
          style={{
            margin: '8px 0 0',
            fontSize: 14,
            color: 'var(--text-2)',
          }}
        >
          Ubica aulas, laboratorios y tus lugares de estudio.
        </p>
      </div>

      <GoogleCampusMap
        selectedPlace={selectedPlace}
        places={CAMPUS_PLACES}
        onSelectPlace={setSelectedPlace}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--text-3)',
          fontSize: 12.5,
        }}
      >
        <Icon name="mapPin" size={14} />
        La geolocalización se usa solo con la app en primer plano. Sin rastreo en segundo plano.
      </div>
    </div>
  )
}

function ToggleSwitch({ on, onChange }: AnyProps) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 44, height: 26, borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
      background: on ? 'var(--primary)' : 'var(--border-strong)', transition: 'background .2s',
    }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: 'var(--surface)', transition: 'left .2s var(--ease)', boxShadow: 'var(--shadow-sm)' }} />
    </button>
  )
}

function SettingRow({ icon, title, sub, children, last }: AnyProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      {icon && <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={16} /></span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

const settingInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  background: 'var(--surface)',
  fontFamily: 'var(--font-ui)',
  fontSize: 14,
  color: 'var(--text)',
  outline: 'none',
  boxSizing: 'border-box',
}

const AVATAR_KEY = 'uptgo_user_avatar'
const WEBAUTHN_KEY = (userId: string) => `uptgo_webauthn_${userId}`

function EditProfileSheet({ open, onClose, toast }: { open: boolean; onClose: () => void; toast: (msg: string) => void }) {
  const { user, updateProfile } = useAuth()
  const [name, setName] = React.useState('')
  const [program, setProgram] = React.useState('')
  const [semester, setSemester] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setName(user?.name ?? '')
      setProgram(user?.program ?? '')
      setSemester(user?.semester ?? '')
      setError('')
    }
  }, [open, user])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setLoading(true)
    setError('')
    try {
      await updateProfile({
        name: name.trim(),
        program: program.trim() || undefined,
        semester: semester.trim() || undefined,
      })
      onClose()
      toast('Perfil actualizado')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Editar perfil" disableBackdropClose>
      <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="mail" size={13} color="var(--text-3)" />
        {user?.email}
        <span style={{ marginLeft: 4, fontSize: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '1px 8px' }}>
          no editable
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Nombre completo *</label>
          <input
            placeholder="Tu nombre"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            disabled={loading}
            style={{ ...settingInputStyle, opacity: loading ? 0.6 : 1 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Programa académico</label>
          <input
            placeholder="Ej: Ingeniería de Sistemas"
            value={program}
            onChange={e => setProgram(e.target.value)}
            disabled={loading}
            style={{ ...settingInputStyle, opacity: loading ? 0.6 : 1 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Semestre</label>
          <input
            placeholder="Ej: Semestre VIII · 2026"
            value={semester}
            onChange={e => setSemester(e.target.value)}
            disabled={loading}
            style={{ ...settingInputStyle, opacity: loading ? 0.6 : 1 }}
          />
        </div>
      </div>

      {error && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 'var(--r-sm)',
          background: 'oklch(0.97 0.02 15)', border: '1px solid oklch(0.82 0.08 15)',
          color: 'oklch(0.45 0.15 15)', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <Button variant="outline" full onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="primary" full onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </Sheet>
  )
}

export function Settings({ m, theme, onTheme, palette, onPalette, onLogout, toast }: AnyProps) {
  const { user, registerWebAuthn } = useAuth()
  const [notif, setNotif] = React.useState<Record<string, boolean>>({ vencimiento: true, clase: true, recordatorio: true, sync: false })
  const [lang, setLang] = React.useState('es')
  const [editOpen, setEditOpen] = React.useState(false)

  const bioKey = user ? WEBAUTHN_KEY(user.id) : null
  const [bioState, setBioState] = React.useState<'idle' | 'registering' | 'ok' | 'error'>(() =>
    bioKey && localStorage.getItem(bioKey) === 'true' ? 'ok' : 'idle'
  )
  const [bioError, setBioError] = React.useState('')

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(() => localStorage.getItem(AVATAR_KEY))

  const palettes = [['verde', 'Verde'], ['cobalto', 'Cobalto'], ['arcilla', 'Arcilla']]
  const paletteColors: Record<string, string> = {
    verde: 'oklch(0.52 0.125 142)',
    cobalto: 'oklch(0.52 0.16 258)',
    arcilla: 'oklch(0.58 0.135 45)',
  }

  const displayName = user?.name ?? DATA.user.name
  const displayEmail = user?.email ?? DATA.user.email
  const displayProgram = user?.program ?? null
  const displayInitials = user?.initials ?? (user?.name ? user.name.slice(0, 2).toUpperCase() : DATA.user.initials)

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 96
        canvas.height = 96
        const ctx = canvas.getContext('2d')!
        const side = Math.min(img.width, img.height)
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 96, 96)
        const url = canvas.toDataURL('image/jpeg', 0.85)
        localStorage.setItem(AVATAR_KEY, url)
        setAvatarUrl(url)
        toast('Foto de perfil actualizada')
      }
      img.src = ev.target!.result as string
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removeAvatar = () => {
    localStorage.removeItem(AVATAR_KEY)
    setAvatarUrl(null)
    toast('Foto de perfil eliminada')
  }

  const handleRegisterBio = async () => {
    setBioState('registering')
    setBioError('')
    try {
      await registerWebAuthn()
      setBioState('ok')
      if (bioKey) localStorage.setItem(bioKey, 'true')
      toast('Huella / Face ID registrado correctamente')
    } catch (err) {
      if (err instanceof Error && err.name === 'InvalidStateError') {
        setBioState('ok')
        if (bioKey) localStorage.setItem(bioKey, 'true')
        toast('Credencial biométrica ya registrada en este dispositivo')
      } else {
        setBioState('error')
        setBioError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Error al registrar biometría')
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720, width: '100%', margin: '0 auto' }}>
      {m && <FadeIn><h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Configuración</h1></FadeIn>}

      <FadeIn delay={50}>
        <Card pad={m ? 18 : 22}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ position: 'relative' }}>
                <Avatar initials={displayInitials} size={64} photo={avatarUrl} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Cambiar foto"
                  style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Icon name="camera" size={13} />
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarFile} style={{ display: 'none' }} />
              </div>
              {avatarUrl && (
                <button onClick={removeAvatar} style={{ fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', padding: 0, whiteSpace: 'nowrap' }}>
                  Eliminar foto
                </button>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              {displayProgram
                ? <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{displayProgram}</div>
                : <div style={{ fontSize: 12, color: 'var(--warn)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="flag" size={11} color="var(--warn)" />Perfil incompleto</div>
              }
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayEmail}</div>
            </div>
            <Button variant="outline" size="sm" icon="edit" onClick={() => setEditOpen(true)}>Editar</Button>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={100}>
        <Card pad={m ? 16 : 20}>
          <SectionTitle>Apariencia</SectionTitle>
          <SettingRow icon="moon" title="Tema" sub="Claro, oscuro o según el sistema">
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', padding: 3 }}>
              {[['light', 'sun'], ['dark', 'moon']].map(([id, ic]) => (
                <button key={id} onClick={() => theme !== id && onTheme()} style={{ width: 34, height: 30, borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', background: theme === id ? 'var(--surface)' : 'transparent', boxShadow: theme === id ? 'var(--shadow-sm)' : 'none', color: theme === id ? 'var(--primary-text)' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ic} size={15} />
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow icon="layers" title="Paleta de color" sub="Tema visual de la aplicación" last>
            <div style={{ display: 'flex', gap: 7 }}>
              {palettes.map(([id, label]) => (
                <button key={id} onClick={() => onPalette(id)} title={label} style={{
                  width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', border: '2px solid ' + (palette === id ? 'var(--text)' : 'var(--border)'),
                  background: paletteColors[id],
                }} />
              ))}
            </div>
          </SettingRow>
        </Card>
      </FadeIn>

      <FadeIn delay={150}>
        <Card pad={m ? 16 : 20}>
          <SectionTitle>Seguridad</SectionTitle>
          <SettingRow
            icon="fingerprint"
            title="Huella / Face ID"
            sub={bioState === 'ok' ? 'Credencial biométrica registrada' : bioState === 'error' ? bioError || 'No se pudo registrar' : 'Inicia sesión sin contraseña'}
            last
          >
            {bioState === 'ok' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="check" size={14} color="var(--ok)" />Registrada
                </span>
                <Button variant="ghost" size="sm" onClick={() => { setBioState('idle'); setBioError('') }}>Actualizar</Button>
              </div>
            ) : (
              <button
                onClick={handleRegisterBio}
                disabled={bioState === 'registering'}
                style={{
                  padding: '7px 14px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--primary)',
                  background: bioState === 'error' ? 'var(--danger-soft)' : 'var(--primary-soft)',
                  color: bioState === 'error' ? 'var(--danger)' : 'var(--primary-text)',
                  fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
                  cursor: bioState === 'registering' ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
                  borderColor: bioState === 'error' ? 'var(--danger)' : 'var(--primary)',
                }}
              >
                <Icon
                  name="fingerprint"
                  size={15}
                  style={bioState === 'registering' ? { animation: 'uptgo-pulse 1s ease-in-out infinite' } : {}}
                />
                {bioState === 'registering' ? 'Verificando…' : bioState === 'error' ? 'Reintentar' : 'Registrar'}
              </button>
            )}
          </SettingRow>
        </Card>
      </FadeIn>

      <FadeIn delay={200}>
        <Card pad={m ? 16 : 20}>
          <SectionTitle>Notificaciones</SectionTitle>
          {[
            ['vencimiento', 'flag', 'Vencimiento de tareas'],
            ['clase', 'clock', 'Inicio de clases'],
            ['recordatorio', 'bell', 'Recordatorios personales'],
            ['sync', 'cloudCheck', 'Sincronización completada'],
          ].map(([k, ic, label], i, arr) => (
            <SettingRow key={k} icon={ic} title={label} last={i === arr.length - 1}>
              <ToggleSwitch on={notif[k]} onChange={(v: boolean) => setNotif((s) => ({ ...s, [k]: v }))} />
            </SettingRow>
          ))}
        </Card>
      </FadeIn>

      <FadeIn delay={250}>
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

      <FadeIn delay={300}>
        <Button variant="danger" icon="logout" full onClick={onLogout}>Cerrar sesión</Button>
      </FadeIn>

      <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-3)', paddingBottom: 4 }}>UPTGO · versión 1.0 · PWA</div>

      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} toast={toast} />
    </div>
  )
}

export function Pomodoro({ open, onClose }: AnyProps) {
  const WORK = 25 * 60
  const BREAK = 5 * 60
  const [mode, setMode] = React.useState<'work' | 'break'>('work')
  const [secs, setSecs] = React.useState(WORK)
  const [running, setRunning] = React.useState(false)
  const total = mode === 'work' ? WORK : BREAK

  React.useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setSecs((s) => (s <= 1 ? 0 : s - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [running])

  React.useEffect(() => {
    if (secs === 0) setRunning(false)
  }, [secs])

  React.useEffect(() => {
    setSecs(mode === 'work' ? WORK : BREAK)
    setRunning(false)
  }, [mode])

  const pct = ((total - secs) / total) * 100
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  return (
    <Sheet open={open} onClose={onClose} title="Pomodoro">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, padding: '10px 0 6px' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', padding: 3 }}>
          {[
            ['work', 'Enfoque'],
            ['break', 'Descanso'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setMode(id as 'work' | 'break')} style={{ padding: '8px 20px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', background: mode === id ? 'var(--surface)' : 'transparent', boxShadow: mode === id ? 'var(--shadow-sm)' : 'none', color: mode === id ? 'var(--text)' : 'var(--text-2)', fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: mode === id ? 600 : 500 }}>
              {label}
            </button>
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
          <Button variant="outline" icon="refresh" onClick={() => { setSecs(total); setRunning(false) }}>Reiniciar</Button>
          <Button variant="primary" icon={running ? 'pause' : 'play'} onClick={() => setRunning((r) => !r)} style={{ minWidth: 130 }}>
            {running ? 'Pausar' : 'Iniciar'}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}