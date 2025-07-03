import { theme } from '../theme';

export default function SectionHeader({ title }) {
  return (
    <h2
      className={`text-xl font-semibold text-[${theme.primary}] mb-4 border-b border-[${theme.primary}] pb-1`}
    >
      {title}
    </h2>
  );
}