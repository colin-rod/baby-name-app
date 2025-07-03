import { theme } from '../theme'

const colorStyles = {
  primary: {
    bg: 'bg-[#6366F1]',
    hover: 'hover:bg-[#4F46E5]',
    text: 'text-white'
  },
  accent: {
    bg: 'bg-[#10B981]',
    hover: 'hover:bg-[#059669]',
    text: 'text-white'
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
  const { bg, hover, text } = colorStyles[color] || colorStyles.primary

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${bg} ${hover} ${text}
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