import { theme } from '../theme';

export default function Button({ children, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-[${theme.primary}] hover:bg-[${theme.primaryDark}] text-white px-4 py-2 rounded ${className}`}
    >
      {children}
    </button>
  );
}