import { theme } from '../theme'

const colorStyles = {
  primary: {
    base: theme.primary,
    hover: theme.primaryDark || '#6D28D9' // fallback if not defined
  },
  accent: {
    base: theme.accent,
    hover: theme.accentDark || '#059669'
  }
}

export default function Button({
  children,
  onClick,
  type = 'button',
  color = 'primary',
  disabled = false,
  className = ''
}) {
  const { base, hover } = colorStyles[color] || colorStyles.primary

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ backgroundColor: base }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = hover)}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = base)}
      className={`
        text-white
        px-4 py-2
        rounded
        transition-all
        disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  )
}