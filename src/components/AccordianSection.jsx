import React from 'react';
import { theme } from '../theme';

export default function AccordionSection({ title, isOpen, onToggle, children }) {
  return (
    <div className="mb-4 border rounded shadow-sm" style={{ borderColor: theme.primary }}>
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-2 font-semibold bg-white border-b flex justify-between items-center"
        style={{ borderColor: theme.primary }}
      >
        <span>{title}</span>
        <span>{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
}