import { clsx } from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, className, icon, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          {...props}
          className={clsx(
            'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            error ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300',
            icon && 'pl-9',
            className
          )}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Input;
