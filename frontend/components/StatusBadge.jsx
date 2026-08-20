const STATUS_META = {
 scheduled: {
 label: "Scheduled",
 classes: "bg-amber-500/10 text-amber-600 ",
 icon: (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 ),
 },
 published: {
 label: "Published",
 classes: "bg-green-500/10 text-green-700 ",
 icon: (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
 ),
 },
 failed: {
 label: "Failed",
 classes: "bg-red-500/10 text-red-600 ",
 icon: (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 ),
 },
 pending: {
 label: "Pending",
 classes: "bg-background-secondary text-foreground-subtle ",
 icon: <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />,
 },
 cancelled: {
 label: "Cancelled",
 classes: "bg-background-secondary text-foreground-muted ",
 icon: (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
 ),
 },
};

export default function StatusBadge({ status }) {
 const meta = STATUS_META[status] || STATUS_META.pending;
 return (
 <span
 className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.classes}`}
 >
 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 {meta.icon}
 </svg>
 {meta.label}
 </span>
 );
}