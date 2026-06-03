import React from 'react'
import { DATA } from '../data/data'
import { Icon } from './Icons'

type AnyProps = Record<string, any>

type SubjectFallback = {
  id: string
  name: string
  room: string
  teacher: string
  color: number
  progress: number
  grade: number
}

const DEFAULT_SUBJECT: SubjectFallback = {
  id: 'default',
  name: 'Sin materia',
  room: 'Sin aula',
  teacher: 'Sin docente',
  color: 1,
  progress: 0,
  grade: 0,
}

export const subjectById = (id: string | number): any =>
  DATA.subjects.find((subject: any) => subject.id === id) || DEFAULT_SUBJECT

export const cVar = (n: string | number) => `var(--c-${n})`

export const cSoftVar = (n: string | number) => `var(--c-${n}-soft)`

export const PRIORITY = {
  alta: {
    label: 'Alta',
    color: 'var(--danger)',
    soft: 'var(--danger-soft)',
  },
  media: {
    label: 'Media',
    color: 'var(--warn)',
    soft: 'var(--warn-soft)',
  },
  baja: {
    label: 'Baja',
    color: 'var(--ok)',
    soft: 'var(--ok-soft)',
  },
}

export const STATUS = {
  pendiente: {
    label: 'Pendiente',
    color: 'var(--text-2)',
    soft: 'var(--surface-2)',
  },
  progreso: {
    label: 'En progreso',
    color: 'var(--c-2)',
    soft: 'var(--c-2-soft)',
  },
  entregada: {
    label: 'Entregada',
    color: 'var(--ok)',
    soft: 'var(--ok-soft)',
  },
  vencida: {
    label: 'Vencida',
    color: 'var(--danger)',
    soft: 'var(--danger-soft)',
  },
}

export function Card({
  children,
  style,
  pad = 18,
  className,
  onClick,
  hover,
  ...rest
}: AnyProps) {
  const [isHover, setIsHover] = React.useState(false)

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        background: 'var(--surface)',

        borderWidth: 1,
        borderStyle: 'solid',
        borderColor:
          hover && isHover
            ? 'var(--border-strong)'
            : 'var(--border)',

        borderRadius: 'var(--r-md)',
        padding: pad,
        boxShadow:
          hover && isHover
            ? 'var(--shadow-md)'
            : 'var(--shadow-sm)',

        transform:
          hover && isHover
            ? 'translateY(-1px)'
            : 'translateY(0)',

        transition:
          'border-color .18s var(--ease), box-shadow .18s var(--ease), transform .18s var(--ease)',
        cursor: onClick ? 'pointer' : 'default',

        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
type ButtonSize = 'sm' | 'md' | 'lg'
type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'outline' | 'danger'

type ButtonProps = {
  children?: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: string
  iconRight?: string
  full?: boolean
  style?: React.CSSProperties
  [key: string]: any
}

const BUTTON_SIZES: Record<ButtonSize, {
  padding: string
  fontSize: number
  gap: number
  h: number
}> = {
  sm: { padding: '7px 12px', fontSize: 13, gap: 6, h: 32 },
  md: { padding: '10px 16px', fontSize: 14, gap: 8, h: 40 },
  lg: { padding: '13px 20px', fontSize: 15, gap: 9, h: 48 },
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  full,
  style,
  ...rest
}: ButtonProps) {
  const [isHover, setIsHover] = React.useState(false)

  const sizes = BUTTON_SIZES[size]

  const BUTTON_VARIANTS: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: isHover ? 'var(--primary-hover)' : 'var(--primary)',
      color: 'var(--on-primary)',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-sm)',
    },
    soft: {
      background: isHover ? 'var(--bg-tint)' : 'var(--primary-soft)',
      color: 'var(--primary-text)',
      border: '1px solid transparent',
    },
    ghost: {
      background: isHover ? 'var(--surface-2)' : 'transparent',
      color: 'var(--text-2)',
      border: '1px solid transparent',
    },
    outline: {
      background: isHover ? 'var(--surface-2)' : 'var(--surface)',
      color: 'var(--text)',
      border: '1px solid var(--border-strong)',
    },
    danger: {
      background: isHover ? 'var(--danger-soft)' : 'transparent',
      color: 'var(--danger)',
      border: '1px solid var(--border)',
    },
  }

  const variants = BUTTON_VARIANTS[variant]

  return (
    <button
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizes.gap,
        padding: sizes.padding,
        minHeight: sizes.h,
        fontFamily: 'var(--font-ui)',
        fontSize: sizes.fontSize,
        fontWeight: 500,
        borderRadius: 'var(--r-sm)',
        cursor: 'pointer',
        width: full ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        transition: 'background .15s var(--ease), transform .1s var(--ease)',
        ...variants,
        ...style,
      }}
      onMouseDown={(event) => {
        event.currentTarget.style.transform = 'scale(0.97)'
      }}
      onMouseUp={(event) => {
        event.currentTarget.style.transform = 'scale(1)'
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={sizes.fontSize + 2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={sizes.fontSize + 2} />}
    </button>
  )
}

export function IconButton({
  name,
  size = 36,
  iconSize = 17,
  active,
  badge,
  title,
  style,
  ...rest
}: AnyProps) {
  const [isHover, setIsHover] = React.useState(false)

  return (
    <button
      title={title}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--r-full)',
        border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
        background: active
          ? 'var(--primary-soft)'
          : isHover
            ? 'var(--surface-2)'
            : 'var(--surface)',
        color: active ? 'var(--primary-text)' : 'var(--text-2)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        transition: 'background .15s var(--ease), color .15s',
        ...style,
      }}
      {...rest}
    >
      <Icon name={name} size={iconSize} />
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: 7,
            right: 7,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--primary)',
            border: '1.5px solid var(--surface)',
          }}
        />
      )}
    </button>
  )
}

export function Avatar({ initials, size = 34, color }: AnyProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--r-full)',
        background: color || 'var(--primary-soft)',
        color: color ? 'var(--on-primary)' : 'var(--primary-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 600,
        fontFamily: 'var(--font-display)',
        flexShrink: 0,
        letterSpacing: '-0.01em',
      }}
    >
      {initials}
    </div>
  )
}

export function Pill({
  children,
  color = 'var(--text-2)',
  bg = 'var(--surface-2)',
  dot,
  style,
}: AnyProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.01em',
        padding: dot ? '3px 9px 3px 8px' : '3px 9px',
        borderRadius: 'var(--r-full)',
        color,
        background: bg,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: color,
          }}
        />
      )}
      {children}
    </span>
  )
}

export function ProgressBar({
  value,
  color = 'var(--primary)',
  height = 7,
}: AnyProps) {
  return (
    <div
      style={{
        flex: 1,
        height,
        background: 'var(--surface-2)',
        borderRadius: 'var(--r-full)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          background: color,
          borderRadius: 'var(--r-full)',
          transition: 'width .6s var(--ease-out)',
        }}
      />
    </div>
  )
}

export function SectionTitle({ children, action, onAction }: AnyProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        gap: 12,
      }}
    >
      <h2
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text)',
          letterSpacing: '-0.01em',
        }}
      >
        {children}
      </h2>

      {action && (
        <button
          onClick={onAction}
          style={{
            fontSize: 12.5,
            color: 'var(--text-3)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {action}
          <Icon name="chevronRight" size={13} />
        </button>
      )}
    </div>
  )
}

export function FadeIn({ children, delay = 0, style }: AnyProps) {
  return (
    <div
      style={{
        animation: 'uptgo-fade .5s var(--ease-out) both',
        animationDelay: `${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function EmptyState({ icon, title, body }: AnyProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-3)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--r-md)',
          background: 'var(--surface-2)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Icon name={icon} size={22} />
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-2)',
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13 }}>{body}</div>
    </div>
  )
}

export function Sheet({ open, onClose, title, children }: AnyProps) {
  const isMobile = Boolean((window as any).__UPTGO_MOBILE__)

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'oklch(0 0 0 / 0.35)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? '0' : 24,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: isMobile ? '100%' : 460,
          maxWidth: isMobile ? '100%' : 'calc(100vw - 48px)',
          maxHeight: isMobile ? '86dvh' : 'min(720px, calc(100dvh - 48px))',
          overflowY: 'auto',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: isMobile
            ? 'var(--r-xl) var(--r-xl) 0 0'
            : 'var(--r-xl)',
          boxShadow: 'var(--shadow-pop)',
          padding: isMobile
            ? '10px 16px calc(18px + env(safe-area-inset-bottom))'
            : 18,
        }}
      >
        {isMobile && (
          <div
            style={{
              width: 42,
              height: 4,
              borderRadius: 'var(--r-full)',
              background: 'var(--border-strong)',
              margin: '0 auto 12px',
            }}
          />
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              color: 'var(--text)',
              margin: 0,
            }}
          >
            {title}
          </h3>

          <IconButton
            name="x"
            size={34}
            title="Cerrar"
            onClick={onClose}
          />
        </div>

        {children}
      </div>
    </div>
  )
}