import { clsx } from 'clsx';

const colorMap = {
  success: 'bg-green-100 text-green-700 border border-green-200',
  warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  danger: 'bg-red-100 text-red-700 border border-red-200',
  primary: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  slate: 'bg-slate-100 text-slate-600 border border-slate-200',
  purple: 'bg-purple-100 text-purple-700 border border-purple-200',
};

export default function Badge({ children, color = 'slate', className }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', colorMap[color], className)}>
      {children}
    </span>
  );
}
