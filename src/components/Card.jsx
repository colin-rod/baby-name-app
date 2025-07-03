import { theme } from '../theme';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-[${theme.secondary}] rounded shadow p-4 ${className}`}>
      {children}
    </div>
  );
}