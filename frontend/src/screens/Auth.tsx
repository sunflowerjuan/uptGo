import React from 'react'
import { Icon } from '../components/Icons'
import { Logo } from '../components/Logo'
import { Button, FadeIn, Sheet } from '../components/UI'
import { useAuth } from '../contexts/AuthContext'
import { ApiError } from '../services/api'

type FieldProps = {
  icon: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  trailing?: React.ReactNode
  disabled?: boolean
}

function Field({ icon, type = 'text', placeholder, value, onChange, trailing, disabled }: FieldProps) {
  const [focus, setFocus] = React.useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 50,
      background: 'var(--surface)', border: '1.5px solid ' + (focus ? 'var(--primary)' : 'var(--border)'),
      borderRadius: 'var(--r-sm)', transition: 'border-color .15s', boxShadow: focus ? '0 0 0 3px var(--primary-soft)' : 'none',
      opacity: disabled ? 0.6 : 1,
    }}>
      <Icon name={icon} size={17} color={focus ? 'var(--primary)' : 'var(--text-3)'} />
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        disabled={disabled}
        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text)' }}
      />
      {trailing}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export function Login({ onLogin }: { onLogin: () => void }) {
  const m = Boolean(window.__UPTGO_MOBILE__)
  const { login, register, loginWithGoogle, loginWithWebAuthn, loading } = useAuth()

  const [mode, setMode] = React.useState<'login' | 'register'>('login')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')
  const [program, setProgram] = React.useState('')
  const [semester, setSemester] = React.useState('')
  const [show, setShow] = React.useState(false)
  const [error, setError] = React.useState('')
  const [bioState, setBio] = React.useState<'idle' | 'scanning' | 'ok'>('idle')

  const clearError = () => setError('')

  const handleSubmit = async () => {
    clearError()
    if (!email.trim() || !password.trim()) {
      setError('El correo y la contraseña son obligatorios')
      return
    }
    if (mode === 'register' && !name.trim()) {
      setError('El nombre es obligatorio para registrarse')
      return
    }
    try {
      if (mode === 'login') {
        await login(email.trim(), password)
      } else {
        await register({
          email: email.trim(),
          password,
          name: name.trim(),
          program: program.trim() || undefined,
          semester: semester.trim() || undefined,
        })
      }
      onLogin()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado. Intenta de nuevo.')
    }
  }

  const handleBio = async () => {
    clearError()
    if (!email.trim()) {
      setError('Escribe tu correo antes de usar la biometría')
      return
    }
    setBio('scanning')
    try {
      await loginWithWebAuthn(email.trim())
      setBio('ok')
      setTimeout(onLogin, 500)
    } catch (err) {
      setBio('idle')
      if (err instanceof ApiError && err.status === 404) {
        setError('No hay credenciales biométricas registradas para este correo')
      } else {
        setError(err instanceof Error ? err.message : 'Autenticación biométrica fallida')
      }
    }
  }

  const brand = (
    <div style={{ flex: 1, background: 'linear-gradient(150deg, var(--primary), var(--primary-hover))', color: 'var(--on-primary)', padding: m ? '40px 26px 30px' : '52px 46px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'oklch(1 0 0 / 0.08)' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -70, width: 240, height: 240, borderRadius: '50%', background: 'oklch(1 0 0 / 0.06)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Logo variant="mark" size={m ? 44 : 52} tileColor="oklch(1 0 0 / 0.16)" glyphColor="#fff" />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: m ? 28 : 40, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          Tu vida académica,<br />en un solo lugar.
        </h1>
        <p style={{ fontSize: m ? 14 : 16, opacity: 0.9, marginTop: 14, lineHeight: 1.5, maxWidth: 380 }}>
          Tareas, horario, notas y recordatorios — disponibles incluso sin conexión.
        </p>
        {!m && (
          <div style={{ display: 'flex', gap: 22, marginTop: 30 }}>
            {[['cloud', 'Offline'], ['bell', 'Push'], ['fingerprint', 'WebAuthn']].map(([ic, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.92 }}>
                <Icon name={ic} size={17} color="#fff" />{l}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const form = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: m ? '26px 22px 30px' : '52px 56px', background: 'var(--surface)', overflowY: 'auto' }}>
      <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>
        <h2 style={{ fontSize: 23, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-3)', marginTop: 5 }}>
          {mode === 'login' ? 'Ingresa para continuar con tus estudios.' : 'Únete con tu correo institucional.'}
        </p>

        {/* Biometric button — solo en login */}
        {mode === 'login' && (
          <button
            onClick={handleBio}
            disabled={loading}
            style={{
              width: '100%', marginTop: 24, padding: '13px', borderRadius: 'var(--r-sm)', cursor: loading ? 'not-allowed' : 'pointer',
              border: '1.5px solid ' + (bioState === 'ok' ? 'var(--ok)' : 'var(--primary)'),
              background: bioState === 'ok' ? 'var(--ok-soft)' : 'var(--primary-soft)',
              color: bioState === 'ok' ? 'var(--ok)' : 'var(--primary-text)',
              fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all .2s',
            }}
          >
            <Icon
              name={bioState === 'ok' ? 'check' : 'fingerprint'}
              size={20}
              style={bioState === 'scanning' ? { animation: 'uptgo-pulse 1s ease-in-out infinite' } : {}}
            />
            {bioState === 'idle' ? 'Continuar con huella / Face ID' : bioState === 'scanning' ? 'Verificando…' : '¡Identidad verificada!'}
          </button>
        )}

        {/* Google button */}
        {mode === 'login' && (
          <button
            onClick={() => { clearError(); loginWithGoogle() }}
            disabled={loading}
            style={{
              width: '100%', marginTop: 10, padding: '13px', borderRadius: 'var(--r-sm)', cursor: loading ? 'not-allowed' : 'pointer',
              border: '1.5px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-2)', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all .15s',
            }}
          >
            <GoogleIcon />
            Continuar con Google
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>o con tu correo</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '10px 14px', marginBottom: 12, borderRadius: 'var(--r-sm)',
            background: 'oklch(0.97 0.02 15)', border: '1px solid oklch(0.82 0.08 15)',
            color: 'oklch(0.45 0.15 15)', fontSize: 13, lineHeight: 1.45,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field icon="mail" placeholder="Correo institucional" value={email} onChange={(v) => { setEmail(v); clearError() }} disabled={loading} />

          {/* Campos extra solo en registro */}
          {mode === 'register' && (
            <>
              <Field icon="user" placeholder="Nombre completo *" value={name} onChange={(v) => { setName(v); clearError() }} disabled={loading} />
              <Field icon="book" placeholder="Programa académico (opcional)" value={program} onChange={(v) => { setProgram(v); clearError() }} disabled={loading} />
              <Field icon="calendar" placeholder="Semestre (opcional)" value={semester} onChange={(v) => { setSemester(v); clearError() }} disabled={loading} />
            </>
          )}

          <Field
            icon="lock"
            type={show ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(v) => { setPassword(v); clearError() }}
            disabled={loading}
            trailing={
              <button type="button" onClick={() => setShow(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 0 }}>
                <Icon name="eye" size={17} />
              </button>
            }
          />
        </div>

        <Button
          variant="primary"
          full
          size="lg"
          style={{ marginTop: 20 }}
          onClick={handleSubmit}
          iconRight={loading ? undefined : 'arrowRight'}
        >
          {loading ? 'Cargando…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </Button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 20 }}>
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            type="button"
            onClick={() => { setMode(m2 => m2 === 'login' ? 'register' : 'login'); clearError() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-text)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 }}
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: m ? 'column' : 'row', overflow: 'auto', background: 'var(--surface)' }}>
      {m ? (<>{<div style={{ flex: '0 0 auto' }}>{brand}</div>}{form}</>) : (<>{brand}{form}</>)}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  background: 'var(--surface)',
  fontFamily: 'var(--font-ui)',
  fontSize: 14,
  color: 'var(--text)',
  outline: 'none',
  boxSizing: 'border-box',
}

export function CompleteProfileModal({ onDismiss }: { onDismiss: () => void }) {
  const { user, updateProfile } = useAuth()
  const [program, setProgram] = React.useState('')
  const [semester, setSemester] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSave = async () => {
    if (!program.trim()) {
      setError('El programa académico es obligatorio')
      return
    }
    setLoading(true)
    setError('')
    try {
      await updateProfile({ program: program.trim(), semester: semester.trim() || undefined })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <Sheet open onClose={onDismiss} title="Completa tu perfil">
      <p style={{ fontSize: 13.5, color: 'var(--text-2)', margin: '0 0 20px', lineHeight: 1.55 }}>
        Añade tu información académica para personalizar la experiencia.
      </p>

      <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="mail" size={13} color="var(--text-3)" />
        {user?.email}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          placeholder="Programa académico *"
          value={program}
          onChange={e => { setProgram(e.target.value); setError('') }}
          disabled={loading}
          style={{ ...inputStyle, opacity: loading ? 0.6 : 1 }}
        />
        <input
          placeholder="Semestre (opcional)"
          value={semester}
          onChange={e => setSemester(e.target.value)}
          disabled={loading}
          style={{ ...inputStyle, opacity: loading ? 0.6 : 1 }}
        />
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

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <Button variant="outline" full onClick={onDismiss} disabled={loading}>Más tarde</Button>
        <Button variant="primary" full onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </Sheet>
  )
}

type ErrorKind = 'offline' | 'notfound'

export function ErrorScreen({ kind = 'offline', onRetry, onHome }: { kind?: ErrorKind; onRetry?: () => void; onHome?: () => void }) {
  const safeKind: ErrorKind = kind === 'notfound' ? 'notfound' : 'offline'
  const cfg = {
    offline: { icon: 'wifiOff', title: 'Sin conexión', body: 'No hay internet en este momento, pero tus datos siguen disponibles localmente. Los cambios se sincronizarán al reconectar.' },
    notfound: { icon: 'helpCircle', title: 'Página no encontrada', body: 'La ruta que buscas no existe o fue movida. Volvamos a un lugar seguro.' },
  }[safeKind]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 28, background: 'var(--bg)' }}>
      <FadeIn>
        <div style={{ width: 84, height: 84, borderRadius: 'var(--r-xl)', background: 'var(--primary-soft)', color: 'var(--primary-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
          <Icon name={cfg.icon} size={38} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{cfg.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55, maxWidth: 380, margin: '12px auto 26px' }}>{cfg.body}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {safeKind === 'offline' && <Button variant="outline" icon="refresh" onClick={onRetry}>Reintentar</Button>}
          <Button variant="primary" icon="dashboard" onClick={onHome}>Ir al inicio</Button>
        </div>
      </FadeIn>
    </div>
  )
}
