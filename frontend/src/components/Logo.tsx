
type LogoVariant = 'full' | 'mark' | 'wordmark'

type LogoMarkProps = {
  size?: number
  tile?: boolean
  tileColor?: string
  glyphColor?: string
  stroke?: number
}

type WordmarkProps = {
  size?: number
  color?: string
  weight?: number
}

type LogoProps = {
  variant?: LogoVariant
  size?: number
  tile?: boolean
  tileColor?: string
  glyphColor?: string
  color?: string
  weight?: number
}

export function LogoMark({
  size = 32,
  tile = true,
  tileColor,
  glyphColor,
  stroke = 5.2,
}: LogoMarkProps) {
  const tc = tileColor || 'var(--primary)'
  const gc = glyphColor || (tile ? 'var(--on-primary)' : 'var(--primary)')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {tile && <rect x="0" y="0" width="48" height="48" rx="13" fill={tc} />}

      <path
        d="M16 13 L16 25 A8 8 0 0 0 32 25 L32 13"
        stroke={gc}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="32" cy="13" r="3.6" fill={gc} />
      <circle
        cx="32"
        cy="13"
        r="6.4"
        stroke={gc}
        strokeWidth="1.6"
        opacity="0.35"
      />
    </svg>
  )
}

export function Wordmark({
  size = 20,
  color,
  weight = 600,
}: WordmarkProps) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: size,
        fontWeight: weight,
        letterSpacing: '-0.02em',
        color: color || 'var(--text)',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'baseline',
      }}
    >
      UPT<span style={{ color: color || 'var(--primary-text)' }}>GO</span>
    </span>
  )
}

export function Logo({
  variant = 'full',
  size = 32,
  tile = true,
  tileColor,
  glyphColor,
  color,
  weight = 600,
}: LogoProps) {
  if (variant === 'wordmark') {
    return <Wordmark size={size * 0.62} color={color} weight={weight} />
  }

  if (variant === 'mark') {
    return (
      <LogoMark
        size={size}
        tile={tile}
        tileColor={tileColor}
        glyphColor={glyphColor}
      />
    )
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.34,
      }}
    >
      <LogoMark
        size={size}
        tile={tile}
        tileColor={tileColor}
        glyphColor={glyphColor}
      />
      <Wordmark size={size * 0.62} color={color} weight={weight} />
    </span>
  )
}