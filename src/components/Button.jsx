import { theme } from '../theme'

const colorStyles = {
  primary: {
    bg: `bg-[${theme.primary}]`,
    hover: `hover:bg-[${theme.primaryDark}]`
  },
  accent: {
    bg: `bg-[${theme.accent}]`,
    hover: `hover:bg-[${theme.accentDark}]`
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
  const { bg, hover } = colorStyles[color] || colorStyles.primary

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${bg} ${hover}
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