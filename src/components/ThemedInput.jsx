import { theme } from '../theme'

export default function ThemedInput({ type = 'text', value, onChange, placeholder, className = '', ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[${theme.primary}] ${className}`}
      {...props}
    />
  )
}