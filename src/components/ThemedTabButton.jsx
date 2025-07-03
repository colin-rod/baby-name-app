import { theme } from '../theme'

export default function ThemedTabButton({ children, onClick, active, color = 'primary' }) {
  const baseColor = color === 'primary' ? theme.primary : theme.accent
  const bg = active ? baseColor : '#E5E7EB' // gray-200 fallback
  const textColor = active ? '#ffffff' : theme.text

  return (
    <button
      onClick={onClick}
      className="flex-1 text-center px-4 py-2 rounded-t font-medium"
      style={{ backgroundColor: bg, color: textColor }}
    >
      {children}
    </button>
  )
}