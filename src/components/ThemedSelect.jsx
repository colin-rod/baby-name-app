// src/components/ThemedSelect.jsx
import { theme } from '../theme'

export default function ThemedSelect({ children, className = '', ...props }) {
  return (
    <select
      className={`border border-${theme.primary} rounded px-3 py-2 bg-white text-${theme.primary} focus:outline-none focus:ring-2 focus:ring-${theme.secondary} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}