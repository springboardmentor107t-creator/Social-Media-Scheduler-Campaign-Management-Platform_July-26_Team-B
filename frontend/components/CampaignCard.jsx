import Link from "next/link";
import { Calendar, Target, DollarSign, Activity } from "lucide-react";

export default function CampaignCard({ campaign }) {
  const {
    id,
    name,
    status,
    startDate,
    endDate,
    budget,
    spent,
    engagement,
    platforms,
    goal,
  } = campaign;

  const statusColors = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    completed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  };

  const statusBadgeClass = statusColors[status] || statusColors.completed;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {name}
          </h3>
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <Target className="w-4 h-4" /> {goal}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass} uppercase tracking-wider`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Timeline
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {startDate} - {endDate}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> Engagement
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {engagement.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Budget
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            ${budget.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Spent
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            ${spent.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {platforms.map((platform) => (
            <span
              key={platform}
              className="text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md capitalize"
            >
              {platform}
            </span>
          ))}
        </div>
        <Link
          href={`/campaigns/${id}`}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
