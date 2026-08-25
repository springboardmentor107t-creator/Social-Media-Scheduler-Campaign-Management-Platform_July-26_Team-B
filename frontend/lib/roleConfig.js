// The 4 Core Roles for Registration & User Selection
export const roleOptions = [
  {
    value: "creator",
    label: "Content Creator",
    description: "Create, draft, and schedule your own posts",
    icon: "✏️",
  },
  {
    value: "marketing",
    label: "Marketing Team",
    description: "Manage marketing campaigns and cross-channel schedule",
    icon: "📊",
  },
  {
    value: "business",
    label: "Business User",
    description: "Oversee social accounts, billing plans, and business presence",
    icon: "💼",
  },
  {
    value: "admin",
    label: "Administrator",
    description: "Full platform administration, user oversight, and content moderation",
    icon: "🛡️",
  },
];

const STANDARD_NAV = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Post Library", href: "/posts" },
  { name: "Create Post", href: "/posts/create" },
  { name: "Campaigns", href: "/campaigns" },
  { name: "Analytics", href: "/analytics" },
  { name: "Reports", href: "/reports" },
  { name: "Drafts", href: "/drafts" },
  { name: "Queue", href: "/queue" },
  { name: "Calendar", href: "/calendar" },
  { name: "Social Channels", href: "/social-accounts" },
  { name: "Profile", href: "/profile" },
];

export const roleConfig = {
  creator: {
    label: "Creator",
    badgeColor: "bg-brand-500 text-white",
    landingTitle: "Content Creator Studio",
    landingDesc: "Create compelling posts, media, and draft content.",
    primaryAction: "Create Post",
    navItems: STANDARD_NAV,
  },
  marketing: {
    label: "Marketing",
    badgeColor: "bg-blue-500 text-white",
    landingTitle: "Marketing Operations",
    landingDesc: "Manage cross-channel campaigns, performance, and scheduling.",
    primaryAction: "Create Campaign",
    navItems: STANDARD_NAV,
  },
  business: {
    label: "Business",
    badgeColor: "bg-emerald-500 text-white",
    landingTitle: "Business Management",
    landingDesc: "Oversee connected social accounts, team seats, and billing.",
    primaryAction: "Connect Account",
    navItems: [
      ...STANDARD_NAV,
      { name: "Billing", href: "/billing" },
    ],
  },
  admin: {
    label: "Admin",
    badgeColor: "bg-rose-500 text-white",
    landingTitle: "System Administration",
    landingDesc: "Full administrative governance over users, content moderation, and platform settings.",
    primaryAction: "Manage Users",
    navItems: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Post Library", href: "/posts" },
      { name: "Create Post", href: "/posts/create" },
      { name: "Campaigns", href: "/campaigns" },
      { name: "Analytics", href: "/analytics" },
      { name: "Reports", href: "/reports" },
      { name: "Drafts", href: "/drafts" },
      { name: "Queue", href: "/queue" },
      { name: "Calendar", href: "/calendar" },
      { name: "All Users", href: "/admin/users" },
      { name: "All Content", href: "/admin/content" },
      { name: "Social Channels", href: "/social-accounts" },
      { name: "System Settings", href: "/settings" },
      { name: "Profile", href: "/profile" },
    ],
  },
};

