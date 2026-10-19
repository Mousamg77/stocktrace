import { clsx } from 'clsx';

const colorMap = {
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-600' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', text: 'text-green-600' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', text: 'text-red-600' },
  slate: { bg: 'bg-slate-50', icon: 'bg-slate-100 text-slate-600', text: 'text-slate-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
};

export default function StatsCard({ label, value, icon, color = 'indigo', subtitle, trend }) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-800">{value ?? '—'}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', c.icon)}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <p className={clsx('mt-3 text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this month
        </p>
      )}
    </div>
  );
}
