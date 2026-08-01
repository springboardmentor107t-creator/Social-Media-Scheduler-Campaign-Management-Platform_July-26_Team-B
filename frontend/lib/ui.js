export const card = "bg-beige-50 rounded-2xl shadow-xl border border-beige-200/60 backdrop-blur-sm";
export const input = "w-full px-4 py-3 border border-beige-300 rounded-xl bg-white text-beige-900 placeholder:text-beige-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-all duration-200";
export const buttonPrimary = "bg-accent-500 text-white px-5 py-3 rounded-xl font-medium shadow-sm hover:bg-accent-600 hover:shadow-md active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
export const buttonSecondary = "border border-beige-300 text-beige-800 px-5 py-3 rounded-xl font-medium hover:bg-beige-100 active:scale-[0.97] transition-all duration-150";
export const label = "block mb-2 text-xs font-semibold uppercase tracking-wide text-beige-600";
export const badge = (status) => {
  const map = {
    published: "bg-success-100 text-success-700",
    failed: "bg-danger-100 text-danger-700",
    scheduled: "bg-accent-500/10 text-accent-600",
    pending: "bg-beige-200 text-beige-700",
  };
  return `px-3 py-1 rounded-full text-xs font-semibold ${map[status] || map.pending}`;
};