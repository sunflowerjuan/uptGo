// ui.jsx — shared UI primitives + helpers. Exported to window.
const DATA = window.UPTGO_DATA;
const subjectById = (id) => DATA.subjects.find(s => s.id === id) || {};
const cVar = (n) => `var(--c-${n})`;
const cSoftVar = (n) => `var(--c-${n}-soft)`;

function Card({ children, style, pad = 18, className, onClick, hover, ...rest }) {
  const [h, setH] = React.useState(false);
  return (
    <div className={className} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        padding: pad,
        boxShadow: 'var(--shadow-sm)',
        transition: 'border-color .18s var(--ease), box-shadow .18s var(--ease), transform .18s var(--ease)',
        cursor: onClick ? 'pointer' : 'default',
        ...(hover && h ? { borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-md)', transform: 'translateY(-1px)' } : {}),
        ...style,
      }} {...rest}>
      {children}
    </div>
  );
}

function Button({ children, variant = 'primary', size = 'md', icon, iconRight, full, style, ...rest }) {
  const [h, setH] = React.useState(false);
  const sizes = {
    sm: { padding: '7px 12px', fontSize: 13, gap: 6, h: 32 },
    md: { padding: '10px 16px', fontSize: 14, gap: 8, h: 40 },
    lg: { padding: '13px 20px', fontSize: 15, gap: 9, h: 48 },
  }[size];
  const variants = {
    primary: { background: h ? 'var(--primary-hover)' : 'var(--primary)', color: 'var(--on-primary)', border: '1px solid transparent', boxShadow: 'var(--shadow-sm)' },
    soft: { background: h ? 'var(--bg-tint)' : 'var(--primary-soft)', color: 'var(--primary-text)', border: '1px solid transparent' },
    ghost: { background: h ? 'var(--surface-2)' : 'transparent', color: 'var(--text-2)', border: '1px solid transparent' },
    outline: { background: h ? 'var(--surface-2)' : 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border-strong)' },
    danger: { background: h ? 'var(--danger-soft)' : 'transparent', color: 'var(--danger)', border: '1px solid var(--border)' },
  }[variant];
  return (
    <button onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: sizes.gap, padding: sizes.padding, minHeight: sizes.h,
        fontFamily: 'var(--font-ui)', fontSize: sizes.fontSize, fontWeight: 500,
        borderRadius: 'var(--r-sm)', cursor: 'pointer',
        width: full ? '100%' : 'auto', whiteSpace: 'nowrap',
        transition: 'background .15s var(--ease), transform .1s var(--ease)',
        ...variants, ...style,
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      {...rest}>
      {icon && <Icon name={icon} size={sizes.fontSize + 2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={sizes.fontSize + 2} />}
    </button>
  );
}

function IconButton({ name, size = 36, iconSize = 17, active, badge, title, style, ...rest }) {
  const [h, setH] = React.useState(false);
  return (
    <button title={title} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: size, height: size, borderRadius: 'var(--r-full)',
        border: '1px solid ' + (active ? 'transparent' : 'var(--border)'),
        background: active ? 'var(--primary-soft)' : (h ? 'var(--surface-2)' : 'var(--surface)'),
        color: active ? 'var(--primary-text)' : 'var(--text-2)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', position: 'relative', flexShrink: 0,
        transition: 'background .15s var(--ease), color .15s', ...style,
      }} {...rest}>
      <Icon name={name} size={iconSize} />
      {badge && <span style={{
        position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%',
        background: 'var(--primary)', border: '1.5px solid var(--surface)',
      }} />}
    </button>
  );
}

function Avatar({ initials, size = 34, color }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 'var(--r-full)',
      background: color || 'var(--primary-soft)', color: color ? 'var(--on-primary)' : 'var(--primary-text)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, fontFamily: 'var(--font-display)',
      flexShrink: 0, letterSpacing: '-0.01em',
    }}>{initials}</div>
  );
}

const PRIORITY = {
  alta:  { label: 'Alta',  color: 'var(--danger)', soft: 'var(--danger-soft)' },
  media: { label: 'Media', color: 'var(--warn)',   soft: 'var(--warn-soft)' },
  baja:  { label: 'Baja',  color: 'var(--ok)',     soft: 'var(--ok-soft)' },
};
const STATUS = {
  pendiente: { label: 'Pendiente', color: 'var(--text-2)', soft: 'var(--surface-2)' },
  progreso:  { label: 'En progreso', color: 'var(--c-2)', soft: 'var(--c-2-soft)' },
  entregada: { label: 'Entregada', color: 'var(--ok)', soft: 'var(--ok-soft)' },
  vencida:   { label: 'Vencida', color: 'var(--danger)', soft: 'var(--danger-soft)' },
};

function Pill({ children, color = 'var(--text-2)', bg = 'var(--surface-2)', dot, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
      padding: dot ? '3px 9px 3px 8px' : '3px 9px', borderRadius: 'var(--r-full)',
      color, background: bg, whiteSpace: 'nowrap', ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
      {children}
    </span>
  );
}

function ProgressBar({ value, color = 'var(--primary)', height = 7 }) {
  return (
    <div style={{ flex: 1, height, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
      <div style={{ width: value + '%', height: '100%', background: color, borderRadius: 'var(--r-full)', transition: 'width .6s var(--ease-out)' }} />
    </div>
  );
}

function SectionTitle({ children, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{children}</h2>
      {action && <button onClick={onAction} style={{
        fontSize: 12.5, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-ui)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 3,
      }}>{action}<Icon name="chevronRight" size={13} /></button>}
    </div>
  );
}

// page transition wrapper — CSS animation (robust; degrades to visible)
function FadeIn({ children, delay = 0, y = 8, style }) {
  return (
    <div style={{ animation: 'uptgo-fade .5s var(--ease-out) both', animationDelay: delay + 'ms', ...style }}>
      {children}
    </div>
  );
}

function EmptyState({ icon, title, body }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon name={icon} size={22} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{body}</div>
    </div>
  );
}

Object.assign(window, {
  DATA, subjectById, cVar, cSoftVar,
  Card, Button, IconButton, Avatar, Pill, ProgressBar, SectionTitle, FadeIn, EmptyState,
  PRIORITY, STATUS,
});
