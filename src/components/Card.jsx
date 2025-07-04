import { theme } from '../theme'

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white border rounded shadow p-4 ${className}`}
      style={{ borderColor: theme.secondary }}
      {...props}
    >
      {children}
    </div>
  )
}