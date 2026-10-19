import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Select = forwardRef(function Select({ label, error, children, className, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        ref={ref}
        {...props}
        className={clsx(
          'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          error ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300',
          className
        )}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Select;
