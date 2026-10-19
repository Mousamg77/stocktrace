import { clsx } from 'clsx';

export default function Card({ children, className, padding = true }) {
  return (
    <div className={clsx('bg-white rounded-xl border border-slate-100 shadow-sm', padding && 'p-5', className)}>
      {children}
    </div>
  );
}
