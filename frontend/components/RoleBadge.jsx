import { roleConfig } from "../lib/roleConfig";

export default function RoleBadge({ role }) {
 const config = roleConfig[role] || roleConfig.creator;
 
 return (
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm ${config.badgeColor}`}>
 {config.label}
 </span>
 );
}
