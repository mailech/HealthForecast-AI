import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-4">
      <Link to="/" className="hover:text-blue-600 transition-colors">
        <FiHome size={14} />
      </Link>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <FiChevronRight size={14} className="text-slate-300" />
          {item.href ? (
            <Link to={item.href} className="hover:text-blue-600 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-slate-700 dark:text-slate-200 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
