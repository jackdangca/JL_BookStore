// ui.jsx - shared design-system primitives (icons, page header, alerts, badges)
import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ============ Inline SVG icon set (no emoji, consistent stroke style) ============ */
const paths = {
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  author: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 21c0-3.3-3.6-6-8-6s-8 2.7-8 6',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  'user-plus': 'M15 21c0-3.3-3.6-6-8-6s-8 2.7-8 6M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6',
  pencil: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z',
  dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  'arrow-left': 'M19 12H5M12 19l-7-7 7-7',
  check: 'M20 6 9 17l-5-5',
  alert: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
  spark: 'M12 2v4M12 18v4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M2 12h4M18 12h4M4.9 19.1l2.9-2.9M16.2 7.8l2.9-2.9',
  tag: 'M12 2H2v10l9.3 9.3a1 1 0 0 0 1.4 0l8.6-8.6a1 1 0 0 0 0-1.4L12 2zM7 7h.01',
  dollar: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  db: 'M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3zM21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5',
};

export function Icon({ name, className = 'h-5 w-5', strokeWidth = 2 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
         strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

/* ============ Page header ============ */
const accents = {
  brand: 'bg-brand-50 text-brand-600 ring-brand-100',
  violet: 'bg-violet-50 text-violet-600 ring-violet-100',
  teal: 'bg-teal-50 text-teal-600 ring-teal-100',
};

export function PageHeader({ icon, title, subtitle, accent = 'brand', children }) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4 animate-fade-up">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${accents[accent]}`}>
          <Icon name={icon} className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ============ Procedure callout (shows which stored procedure is behind the page) ============ */
export function ProcNote({ children }) {
  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-[13px] text-brand-900 animate-fade-in">
      <Icon name="db" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
      <p>{children}</p>
    </div>
  );
}

/* ============ Alert banner ============ */
export function Alert({ ok, children, onClose }) {
  if (!children) return null;
  return (
    <div role="status"
         className={`mt-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium animate-fade-up
           ${ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
      <span className="flex items-start gap-2">
        <Icon name={ok ? 'check' : 'alert'} className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{children}</span>
      </span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100" aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ============ Empty state ============ */
export function EmptyState({ icon = 'list', title, note }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      {note && <p className="max-w-sm text-[13px] text-slate-400">{note}</p>}
    </div>
  );
}

/* ============ Back link ============ */
export function BackLink() {
  return (
    <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-brand-600">
      <Icon name="arrow-left" className="h-3.5 w-3.5" />
      Main Menu
    </Link>
  );
}

/* ============ Section card with title ============ */
export function SectionCard({ title, action, className = '', children }) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-[15px] font-bold text-slate-800">{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/* ============ Category badge ============ */
const catPalette = [
  'bg-indigo-50 text-indigo-700', 'bg-violet-50 text-violet-700', 'bg-teal-50 text-teal-700',
  'bg-amber-50 text-amber-700', 'bg-rose-50 text-rose-700', 'bg-sky-50 text-sky-700',
  'bg-lime-50 text-lime-700', 'bg-orange-50 text-orange-700', 'bg-fuchsia-50 text-fuchsia-700',
];

export function CategoryBadge({ category }) {
  if (!category) return <span className="text-slate-400">—</span>;
  const hash = [...category].reduce((s, c) => s + c.charCodeAt(0), 0);
  return <span className={`badge ${catPalette[hash % catPalette.length]}`}>{category}</span>;
}

/* ============ Money ============ */
export function Money({ value, className = '' }) {
  if (value == null || value === '') return <span className="text-slate-400">—</span>;
  return <span className={className}>${Number(value).toFixed(2)}</span>;
}

/* ============ Book cover (image by ISBN, graceful fallback) ============ */
const coverGradients = [
  'from-brand-500 to-brand-700', 'from-violet-500 to-violet-700', 'from-teal-500 to-teal-700',
  'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600', 'from-sky-500 to-indigo-600',
];

export function BookCover({ isbn, title, className = 'h-14 w-10' }) {
  const [failed, setFailed] = useState(false);
  const seed = isbn || title || 'x';
  const gradient = coverGradients[[...seed].reduce((s, c) => s + c.charCodeAt(0), 0) % coverGradients.length];
  if (failed) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shadow-sm ${className}`}>
        <span className="text-[10px] font-extrabold text-white/90">{(title || '?').slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }
  return (
    <img
      src={`/covers/${isbn}.png`}
      alt={`Cover of ${title || isbn}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-lg object-cover shadow-sm ring-1 ring-black/5 ${className}`}
    />
  );
}
