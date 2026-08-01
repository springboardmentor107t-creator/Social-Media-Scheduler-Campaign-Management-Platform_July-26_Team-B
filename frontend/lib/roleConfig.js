export const roleConfig = {
  creator: {
    label: "Creator",
    badgeColor: "bg-brand-500 text-white",
    landingTitle: "My Content",
    landingDesc: "Manage your scheduled and draft posts.",
    primaryAction: "Create Post",
    navItems: [
      { name: "Dashboard", href: "/profile" }, // Currently mapped to profile, or we can make a true dashboard
      { name: "My Posts", href: "#" },
      { name: "Connected Accounts", href: "/social-accounts" },
      { name: "Profile", href: "/profile" },
    ],
  },
  marketing: {
    label: "Marketing",
    badgeColor: "bg-blue-500 text-white",
    landingTitle: "Team Content",
    landingDesc: "Overview of all team-wide scheduled content.",
    primaryAction: "Create Campaign",
    navItems: [
      { name: "Dashboard", href: "/profile" },
      { name: "Team Posts", href: "#" },
      { name: "Connected Accounts", href: "/social-accounts" },
      { name: "Profile", href: "/profile" },
    ],
  },
  business: {
    label: "Business",
    badgeColor: "bg-green-500 text-white",
    landingTitle: "Account Overview",
    landingDesc: "Manage connected accounts and view summary.",
    primaryAction: "Connect Account",
    navItems: [
      { name: "Dashboard", href: "/profile" },
      { name: "Connected Accounts", href: "/social-accounts" },
      { name: "Billing", href: "#" },
      { name: "Profile", href: "/profile" },
    ],
  },
  admin: {
    label: "Admin",
    badgeColor: "bg-red-500 text-white",
    landingTitle: "Platform Overview",
    landingDesc: "View all users and system activity.",
    primaryAction: "Manage Users",
    navItems: [
      { name: "Dashboard", href: "/profile" },
      { name: "All Users", href: "#" },
      { name: "All Content", href: "#" },
      { name: "System Settings", href: "#" },
      { name: "Profile", href: "/profile" },
    ],
  },
};
