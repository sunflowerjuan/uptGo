import React from 'react'
import { Icon } from '../components/Icons'
import { Logo } from '../components/Logo'
import { Button, FadeIn } from '../components/UI'

type AnyProps = Record<string, any>

declare global {
  interface Window {
    __UPTGO_MOBILE__?: boolean
  }
}

function Field({ icon, type = 'text', placeholder, value, onChange, trailing }: AnyProps) {
  const [focus, setFocus] = React.useState(false)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 50,
      background: 'var(--surface)', border: '1.5px solid ' + (focus ? 'var(--primary)' : 'var(--border)'),
      borderRadius: 'var(--r-sm)', transition: 'border-color .15s', boxShadow: focus ? '0 0 0 3px var(--primary-soft)' : 'none',
    }}>
      <Icon name={icon} size={17} color={focus ? 'var(--primary)' : 'var(--text-3)'} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text)' }}
      />
      {trailing}
    </div>
  )
}

export function Login({ onLogin }: AnyProps) {
  const m = Boolean(window.__UPTGO_MOBILE__)
  const [mode, setMode] = React.useState<'login' | 'register'>('login')
  const [email, setEmail] = React.useState('maria.mora@uptc.edu.co')
  const [pwd, setPwd] = React.useState('••••••••')
  const [show, setShow] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
  const [bioState, setBio] = React.useState<'idle' | 'scan' | 'ok'>('idle')

  const doBio = () => {
    setBio('scan')
    window.setTimeout(() => {
      setBio('ok')
      window.setTimeout(onLogin, 650)
    }, 1400)
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
            {[
              ['cloud', 'Offline'],
              ['bell', 'Push'],
              ['fingerprint', 'WebAuthn'],
            ].map(([ic, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.92 }}>
                <Icon name={ic} size={17} color="#fff" />
                {label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const form = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: m ? '26px 22px 30px' : '52px 56px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>
        <h2 style={{ fontSize: 23, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          {mode === 'login' ? 'Bienvenida de nuevo' : 'Crea tu cuenta'}
        </h2>

        <p style={{ fontSize: 13.5, color: 'var(--text-3)', marginTop: 5 }}>
          {mode === 'login' ? 'Ingresa para continuar con tus estudios.' : 'Únete con tu correo institucional.'}
        </p>

        <button onClick={doBio} style={{
          width: '100%', marginTop: 24, padding: '13px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
          border: '1.5px solid ' + (bioState === 'ok' ? 'var(--ok)' : 'var(--primary)'), background: bioState === 'ok' ? 'var(--ok-soft)' : 'var(--primary-soft)',
          color: bioState === 'ok' ? 'var(--ok)' : 'var(--primary-text)', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all .2s',
        }}>
          <Icon name={bioState === 'ok' ? 'check' : 'fingerprint'} size={20} style={bioState === 'scan' ? { animation: 'uptgo-pulse 1s ease-in-out infinite' } : {}} />
          {bioState === 'idle' ? 'Continuar con huella / Face ID' : bioState === 'scan' ? 'Verificando…' : '¡Identidad verificada!'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>o con tu correo</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field icon="mail" placeholder="Correo institucional" value={email} onChange={setEmail} />
          <Field
            icon="lock"
            type={show ? 'text' : 'password'}
            placeholder="Contraseña"
            value={pwd}
            onChange={setPwd}
            trailing={
              <button type="button" onClick={() => setShow((s) => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 0 }}>
                <Icon name="eye" size={17} />
              </button>
            }
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <button type="button" onClick={() => setRemember((r) => !r)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, border: '1.6px solid ' + (remember ? 'var(--primary)' : 'var(--border-strong)'), background: remember ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {remember && <Icon name="check" size={12} color="var(--on-primary)" stroke={3} />}
            </span>
            Recordarme
          </button>

          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-text)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500 }}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button variant="primary" full size="lg" style={{ marginTop: 20 }} onClick={onLogin} iconRight="arrowRight">
          {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </Button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 20 }}>
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button type="button" onClick={() => setMode((m2) => m2 === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-text)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 }}>
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: m ? 'column' : 'row', overflow: 'auto', background: 'var(--surface)' }}>
      {m ? (
        <>
          <div style={{ flex: '0 0 auto' }}>{brand}</div>
          {form}
        </>
      ) : (
        <>
          {brand}
          {form}
        </>
      )}
    </div>
  )
}

type ErrorKind = 'offline' | 'notfound'

export function ErrorScreen({ kind = 'offline', onRetry, onHome }: AnyProps) {
  const safeKind: ErrorKind = kind === 'notfound' ? 'notfound' : 'offline'

  const cfg = {
    offline: {
      icon: 'wifiOff',
      title: 'Sin conexión',
      body: 'No hay internet en este momento, pero tus datos siguen disponibles localmente. Los cambios se sincronizarán al reconectar.',
    },
    notfound: {
      icon: 'helpCircle',
      title: 'Página no encontrada',
      body: 'La ruta que buscas no existe o fue movida. Volvamos a un lugar seguro.',
    },
  }[safeKind]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 28, background: 'var(--bg)' }}>
      <FadeIn>
        <div style={{ width: 84, height: 84, borderRadius: 'var(--r-xl)', background: 'var(--primary-soft)', color: 'var(--primary-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
          <Icon name={cfg.icon} size={38} />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          {cfg.title}
        </h1>

        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55, maxWidth: 380, margin: '12px auto 26px' }}>
          {cfg.body}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {safeKind === 'offline' && <Button variant="outline" icon="refresh" onClick={onRetry}>Reintentar</Button>}
          <Button variant="primary" icon="dashboard" onClick={onHome}>Ir al inicio</Button>
        </div>
      </FadeIn>
    </div>
  )
}