"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "../../lib/auth";
import api from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import RoleBadge from "../../components/RoleBadge";

// Available Subscription Plans
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "For solo founders & small boutique brands starting their presence.",
    monthlyPrice: 29,
    annualPrice: 279, // ~$23.25/mo
    limits: {
      channels: 5,
      postsPerMonth: 150,
      teamSeats: 2,
      aiCredits: 250,
      storageGb: 5,
    },
    features: [
      "5 Connected Social Channels",
      "150 Scheduled Posts / Month",
      "2 Team Member Seats",
      "250 AI Caption Generation Credits",
      "Standard Analytics & CSV Reports",
      "Email Support (24h response)",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    description: "For growing agencies and businesses scaling up multi-channel reach.",
    monthlyPrice: 59,
    annualPrice: 566, // ~$47.16/mo
    limits: {
      channels: 10,
      postsPerMonth: 600,
      teamSeats: 5,
      aiCredits: 750,
      storageGb: 20,
    },
    features: [
      "10 Connected Social Channels",
      "600 Scheduled Posts / Month",
      "5 Team Member Seats",
      "750 AI Caption Generation Credits",
      "Advanced ROI & Campaign Tracking",
      "Priority Queue Dispatch",
      "Priority Support (4h response)",
    ],
  },
  {
    id: "business",
    name: "Business Scale",
    description: "Full suite for enterprise businesses, active marketing teams & high volumes.",
    popular: true,
    monthlyPrice: 99,
    annualPrice: 950, // ~$79.16/mo
    limits: {
      channels: 20,
      postsPerMonth: 2000,
      teamSeats: 10,
      aiCredits: 2000,
      storageGb: 50,
    },
    features: [
      "20 Connected Social Channels",
      "2,000 Scheduled Posts / Month",
      "10 Team Member Seats",
      "2,000 AI Caption Generation Credits",
      "50 GB Media Cloud Storage",
      "Executive PDF & CSV Audit Exports",
      "Dedicated Social Account Tokens",
      "24/7 Priority SLA & Phone Support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom scalability, dedicated infrastructure, and governance compliance.",
    monthlyPrice: 249,
    annualPrice: 2390, // ~$199.16/mo
    limits: {
      channels: 50,
      postsPerMonth: 10000,
      teamSeats: 30,
      aiCredits: 10000,
      storageGb: 250,
    },
    features: [
      "50+ Connected Social Channels",
      "10,000+ Scheduled Posts / Month",
      "30 Team Member Seats",
      "10,000 AI Credits / Month",
      "250 GB Media Vault",
      "Custom SSO & SAML Security",
      "Dedicated Account Manager",
      "Custom SLA & Compliance Guarantees",
    ],
  },
];

// Initial Payment Methods
const INITIAL_PAYMENT_METHODS = [
  {
    id: "pm_1",
    brand: "visa",
    last4: "4242",
    expMonth: 8,
    expYear: 2028,
    holder: "David Business Owner",
    isDefault: true,
  },
  {
    id: "pm_2",
    brand: "mastercard",
    last4: "8819",
    expMonth: 11,
    expYear: 2027,
    holder: "David Business Owner",
    isDefault: false,
  },
];

// Initial Billing Profile
const INITIAL_BILLING_DETAILS = {
  companyName: "Acme Media & Growth Partners LLC",
  taxId: "US-EIN-9842104-B",
  billingEmail: "billing@acmemedia.io",
  addressLine1: "100 Innovation Boulevard, Suite 400",
  city: "San Francisco",
  state: "CA",
  postalCode: "94105",
  country: "United States",
};

// Initial Invoices
const INITIAL_INVOICES = [
  {
    id: "INV-2026-008",
    date: "2026-08-01",
    period: "Aug 01, 2026 - Aug 31, 2026",
    planName: "Business Scale",
    amount: 99.0,
    tax: 7.92,
    total: 106.92,
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    items: [
      { desc: "Business Scale Subscription (Monthly)", amount: 99.0 },
      { desc: "Sales Tax / GST (8%)", amount: 7.92 },
    ],
  },
  {
    id: "INV-2026-007",
    date: "2026-07-01",
    period: "Jul 01, 2026 - Jul 31, 2026",
    planName: "Business Scale",
    amount: 99.0,
    tax: 7.92,
    total: 106.92,
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    items: [
      { desc: "Business Scale Subscription (Monthly)", amount: 99.0 },
      { desc: "Sales Tax / GST (8%)", amount: 7.92 },
    ],
  },
  {
    id: "INV-2026-006",
    date: "2026-06-01",
    period: "Jun 01, 2026 - Jun 30, 2026",
    planName: "Business Scale",
    amount: 99.0,
    tax: 7.92,
    total: 106.92,
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    items: [
      { desc: "Business Scale Subscription (Monthly)", amount: 99.0 },
      { desc: "Sales Tax / GST (8%)", amount: 7.92 },
    ],
  },
  {
    id: "INV-2026-005",
    date: "2026-05-01",
    period: "May 01, 2026 - May 31, 2026",
    planName: "Growth Plan",
    amount: 59.0,
    tax: 4.72,
    total: 63.72,
    status: "paid",
    paymentMethod: "Mastercard •••• 8819",
    items: [
      { desc: "Growth Plan Subscription (Monthly)", amount: 59.0 },
      { desc: "Sales Tax / GST (8%)", amount: 4.72 },
    ],
  },
];

// Available Modular Add-ons
const ADDON_OPTIONS = [
  {
    id: "addon_channels",
    name: "Extra Social Channels (+5)",
    desc: "Add 5 additional social accounts across Twitter, LinkedIn, Instagram, and Facebook.",
    price: 15,
    icon: "🔗",
  },
  {
    id: "addon_ai",
    name: "AI Caption Booster (+1,000 Credits)",
    desc: "Generate 1,000 high-converting captions, hooks, and hashtags with AI Studio.",
    price: 20,
    icon: "✨",
  },
  {
    id: "addon_support",
    name: "24/7 Dedicated Slack Channel",
    desc: "Direct access to senior engineering & technical operations team via Slack/Teams.",
    price: 49,
    icon: "💬",
  },
];

export default function BusinessBillingPage() {
  const router = useRouter();

  // Auth & Role State
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isBusinessRole, setIsBusinessRole] = useState(false);

  // Live Metric Sync State
  const [liveChannelsCount, setLiveChannelsCount] = useState(4);
  const [livePostsCount, setLivePostsCount] = useState(148);
  const [teamSeatsCount] = useState(3);
  const [aiCreditsUsed, setAiCreditsUsed] = useState(480);
  const [storageUsedGb] = useState(14.8);

  // Billing & Subscription Config
  const [currentPlanId, setCurrentPlanId] = useState("business");
  const [billingCycle, setBillingCycle] = useState("month"); // 'month' | 'annual'
  const [autoRenew, setAutoRenew] = useState(true);
  const [activeAddons, setActiveAddons] = useState(["addon_channels"]);

  // Wallet & Profile State
  const [paymentMethods, setPaymentMethods] = useState(INITIAL_PAYMENT_METHODS);
  const [billingDetails, setBillingDetails] = useState(INITIAL_BILLING_DETAILS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);

  // Filter States
  const [invoiceFilterYear, setInvoiceFilterYear] = useState("all");
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState("all");

  // Modals State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState("business");
  const [addCardModalOpen, setAddCardModalOpen] = useState(false);
  const [editBillingModalOpen, setEditBillingModalOpen] = useState(false);
  const [invoiceModalData, setInvoiceModalData] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // New Card Form State
  const [newCard, setNewCard] = useState({
    holder: "",
    number: "",
    expMonth: "12",
    expYear: "2028",
    cvc: "",
    postalCode: "",
    isDefault: false,
  });

  // Edit Billing Form State
  const [billingForm, setBillingForm] = useState(INITIAL_BILLING_DETAILS);

  // Toast Notification System
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }

  // Check Authentication and Strict Business Role Enforcement
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    checkAccessAndLoadData();
  }, []);

  async function checkAccessAndLoadData() {
    try {
      const response = await api.get("/api/v1/auth/me");
      const user = response.data;
      setCurrentUser(user);

      if (user.role !== "business") {
        setIsBusinessRole(false);
        setCheckingAccess(false);
        return;
      }

      setIsBusinessRole(true);

      // Load saved preferences if any
      const savedBilling = localStorage.getItem(`sp_billing_${user.id || user.email}`);
      if (savedBilling) {
        try {
          const parsed = JSON.parse(savedBilling);
          if (parsed.billingDetails) setBillingDetails(parsed.billingDetails);
          if (parsed.currentPlanId) setCurrentPlanId(parsed.currentPlanId);
          if (parsed.billingCycle) setBillingCycle(parsed.billingCycle);
          if (parsed.paymentMethods) setPaymentMethods(parsed.paymentMethods);
          if (parsed.activeAddons) setActiveAddons(parsed.activeAddons);
        } catch (e) {
          console.warn("Could not parse saved billing state", e);
        }
      }

      // Fetch Real Connected Channels & Posts for Live Quota Measurement
      try {
        const [accRes, postRes] = await Promise.allSettled([
          api.get("/api/v1/social-accounts"),
          api.get("/api/v1/posts"),
        ]);
        if (accRes.status === "fulfilled" && Array.isArray(accRes.value?.data)) {
          setLiveChannelsCount(accRes.value.data.length || 0);
        }
        if (postRes.status === "fulfilled" && Array.isArray(postRes.value?.data)) {
          setLivePostsCount(postRes.value.data.length || 0);
        }
      } catch (err) {
        console.warn("Failed fetching live quotas", err);
      }

      setCheckingAccess(false);
    } catch (err) {
      console.error("Auth check failed in Billing Page", err);
      router.push("/login");
    }
  }

  // Save changes to localStorage for persistence
  function persistBillingState(overrides = {}) {
    if (!currentUser) return;
    const stateToSave = {
      billingDetails,
      currentPlanId,
      billingCycle,
      paymentMethods,
      activeAddons,
      ...overrides,
    };
    localStorage.setItem(
      `sp_billing_${currentUser.id || currentUser.email}`,
      JSON.stringify(stateToSave)
    );
  }

  // Current Plan Details
  const activePlan = useMemo(() => {
    return PLANS.find((p) => p.id === currentPlanId) || PLANS[2];
  }, [currentPlanId]);

  // Pricing calculations
  const basePrice =
    billingCycle === "annual" ? activePlan.annualPrice : activePlan.monthlyPrice;
  const addonsTotal = useMemo(() => {
    return activeAddons.reduce((acc, addId) => {
      const item = ADDON_OPTIONS.find((a) => a.id === addId);
      return acc + (item ? item.price : 0);
    }, 0);
  }, [activeAddons]);

  const estimatedMonthlyBill =
    (billingCycle === "annual"
      ? Math.round(activePlan.annualPrice / 12)
      : activePlan.monthlyPrice) + addonsTotal;

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchYear =
        invoiceFilterYear === "all" || inv.date.startsWith(invoiceFilterYear);
      const matchStatus =
        invoiceFilterStatus === "all" || inv.status === invoiceFilterStatus;
      return matchYear && matchStatus;
    });
  }, [invoices, invoiceFilterYear, invoiceFilterStatus]);

  // Handle Plan Upgrade / Downgrade
  function handleConfirmPlanChange() {
    const newPlan = PLANS.find((p) => p.id === selectedUpgradePlan);
    if (!newPlan) return;

    setCurrentPlanId(newPlan.id);
    persistBillingState({ currentPlanId: newPlan.id });
    setUpgradeModalOpen(false);

    // Create a new simulated invoice
    const newInv = {
      id: `INV-2026-${String(invoices.length + 9).padStart(3, "0")}`,
      date: new Date().toISOString().slice(0, 10),
      period: "Immediate Plan Adjustment",
      planName: newPlan.name,
      amount: billingCycle === "annual" ? newPlan.annualPrice : newPlan.monthlyPrice,
      tax: Number(
        (
          (billingCycle === "annual" ? newPlan.annualPrice : newPlan.monthlyPrice) *
          0.08
        ).toFixed(2)
      ),
      total: Number(
        (
          (billingCycle === "annual" ? newPlan.annualPrice : newPlan.monthlyPrice) *
          1.08
        ).toFixed(2)
      ),
      status: "paid",
      paymentMethod:
        paymentMethods.find((p) => p.isDefault)?.brand?.toUpperCase() +
        ` •••• ` +
        paymentMethods.find((p) => p.isDefault)?.last4,
      items: [
        {
          desc: `${newPlan.name} Subscription (${billingCycle === "annual" ? "Annual" : "Monthly"})`,
          amount:
            billingCycle === "annual" ? newPlan.annualPrice : newPlan.monthlyPrice,
        },
        {
          desc: "Tax (8%)",
          amount: Number(
            (
              (billingCycle === "annual" ? newPlan.annualPrice : newPlan.monthlyPrice) *
              0.08
            ).toFixed(2)
          ),
        },
      ],
    };
    setInvoices([newInv, ...invoices]);
    showToast(`Successfully upgraded subscription to ${newPlan.name} plan!`);
  }

  // Handle Addon Toggle
  function toggleAddon(addonId) {
    let next;
    if (activeAddons.includes(addonId)) {
      next = activeAddons.filter((id) => id !== addonId);
      showToast("Add-on removed from subscription.");
    } else {
      next = [...activeAddons, addonId];
      showToast("Add-on activated successfully!");
    }
    setActiveAddons(next);
    persistBillingState({ activeAddons: next });
  }

  // Handle Add New Payment Card
  function handleAddCard(e) {
    e.preventDefault();
    if (!newCard.number || newCard.number.replace(/\s/g, "").length < 15) {
      showToast("Please enter a valid card number.", "error");
      return;
    }
    if (!newCard.holder) {
      showToast("Please specify the cardholder name.", "error");
      return;
    }

    const cleanNum = newCard.number.replace(/\s/g, "");
    let detectedBrand = "visa";
    if (cleanNum.startsWith("5") || cleanNum.startsWith("2")) detectedBrand = "mastercard";
    else if (cleanNum.startsWith("3")) detectedBrand = "amex";

    const last4 = cleanNum.slice(-4);
    const newEntry = {
      id: `pm_${Date.now()}`,
      brand: detectedBrand,
      last4,
      expMonth: parseInt(newCard.expMonth, 10),
      expYear: parseInt(newCard.expYear, 10),
      holder: newCard.holder,
      isDefault: newCard.isDefault || paymentMethods.length === 0,
    };

    let updatedMethods = [...paymentMethods];
    if (newEntry.isDefault) {
      updatedMethods = updatedMethods.map((m) => ({ ...m, isDefault: false }));
    }
    updatedMethods.push(newEntry);

    setPaymentMethods(updatedMethods);
    persistBillingState({ paymentMethods: updatedMethods });
    setAddCardModalOpen(false);
    setNewCard({
      holder: "",
      number: "",
      expMonth: "12",
      expYear: "2028",
      cvc: "",
      postalCode: "",
      isDefault: false,
    });
    showToast("New payment method added & securely stored.");
  }

  // Set Default Payment Card
  function handleSetDefaultCard(cardId) {
    const updated = paymentMethods.map((m) => ({
      ...m,
      isDefault: m.id === cardId,
    }));
    setPaymentMethods(updated);
    persistBillingState({ paymentMethods: updated });
    showToast("Default payment method updated.");
  }

  // Remove Payment Card
  function handleRemoveCard(cardId) {
    if (paymentMethods.length <= 1) {
      showToast("You must maintain at least one active payment method.", "error");
      return;
    }
    const target = paymentMethods.find((m) => m.id === cardId);
    let updated = paymentMethods.filter((m) => m.id !== cardId);
    if (target?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setPaymentMethods(updated);
    persistBillingState({ paymentMethods: updated });
    showToast("Payment method removed.");
  }

  // Save Billing Information
  function handleSaveBillingDetails(e) {
    e.preventDefault();
    setBillingDetails(billingForm);
    persistBillingState({ billingDetails: billingForm });
    setEditBillingModalOpen(false);
    showToast("Company billing profile updated successfully.");
  }

  // Download Invoice as CSV
  function handleDownloadInvoiceCsv(inv) {
    const rows = [
      ["Invoice Number", inv.id],
      ["Date", inv.date],
      ["Period", inv.period],
      ["Plan", inv.planName],
      ["Payment Method", inv.paymentMethod],
      ["Subtotal", `$${inv.amount.toFixed(2)}`],
      ["Tax", `$${inv.tax.toFixed(2)}`],
      ["Total", `$${inv.total.toFixed(2)}`],
      ["Status", inv.status],
      [],
      ["Item Description", "Amount"],
      ...inv.items.map((i) => [i.desc, `$${i.amount.toFixed(2)}`]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${inv.id}_SocialPilot_Receipt.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Invoice ${inv.id} downloaded successfully.`);
  }

  // Trigger Persona Switcher Modal from Restricted Screen
  function openPersonaSwitcher() {
    window.dispatchEvent(new CustomEvent("open_persona_switcher"));
  }

  // 1. Loading State
  if (checkingAccess) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-28 text-center animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4 text-brand-500 animate-pulse">
            <svg className="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="text-base font-bold text-foreground">Verifying Organization Authorization...</h2>
          <p className="text-xs text-foreground-muted mt-1 max-w-sm">
            Loading tenant billing records, quota allocations, and payment gateways.
          </p>
        </div>
      </DashboardShell>
    );
  }

  // 2. Strict Access Control Screen for Non-Business Roles
  if (!isBusinessRole) {
    return (
      <DashboardShell>
        <div className="max-w-2xl mx-auto py-16 px-4">
          <div className="card-surface p-8 sm:p-10 rounded-3xl border border-rose-500/20 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-3xl mx-auto mb-5 border border-rose-500/20 shadow-inner">
              🛡️
            </div>
            <span className="text-xxs font-extrabold uppercase tracking-widest text-rose-600 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
              Access Restricted
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-3 tracking-tight">
              Business Role Required
            </h1>
            <p className="text-xs sm:text-sm text-foreground-muted mt-2.5 leading-relaxed max-w-lg mx-auto">
              The <strong>Billing & Subscription Management Hub</strong> is restricted exclusively to
              authorized <strong>Business Users / Organization Owners</strong>. Your active account role
              is currently <RoleBadge role={currentUser?.role || "user"} />.
            </p>

            <div className="mt-8 p-4 rounded-2xl bg-foreground/[0.03] border border-surface-border text-left">
              <div className="flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Need to manage subscriptions or invoices?</h4>
                  <p className="text-xxs text-foreground-muted mt-0.5 leading-normal">
                    Switch to the <strong>David Business Owner</strong> persona to access corporate billing, upgrade tiers, manage payment cards, and inspect legal invoice records.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={openPersonaSwitcher}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-brand text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🎭</span> Switch to Business Role
              </button>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-surface-border hover:bg-foreground/[0.04] text-foreground text-xs sm:text-sm font-bold transition-all text-center"
              >
                Return to Workspace
              </Link>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // 3. Full Business Billing Dashboard
  return (
    <DashboardShell>
      {/* Toast Notice */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-[9999] px-5 py-3 rounded-2xl shadow-2xl border text-xs font-bold animate-in slide-in-from-top-4 duration-200 flex items-center gap-3 backdrop-blur-xl ${
            toast.type === "error"
              ? "bg-rose-500/90 text-white border-rose-600"
              : "bg-emerald-600/90 text-white border-emerald-700"
          }`}
        >
          <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Billing & Subscription
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xxs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Business Organization
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foreground-muted mt-1">
              Manage your corporate subscription tier, resource quotas, payment methods, and legal invoice records.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Billing Cycle Switcher */}
            <div className="flex items-center bg-foreground/[0.04] p-1 rounded-2xl border border-surface-border">
              <button
                onClick={() => {
                  setBillingCycle("month");
                  persistBillingState({ billingCycle: "month" });
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "month"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => {
                  setBillingCycle("annual");
                  persistBillingState({ billingCycle: "annual" });
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  -20%
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedUpgradePlan(currentPlanId);
                setUpgradeModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg shadow-brand-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>⚡</span> Change Plan
            </button>
          </div>
        </div>

        {/* Top Grid: Plan Summary Card + Payment Method Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Active Plan Card */}
          <div className="lg:col-span-8 card-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xxs font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                      Active Subscription
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In Good Standing
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3 mt-1.5">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {activePlan.name}
                    </h2>
                    <span className="text-foreground-muted text-sm font-semibold">
                      ${basePrice}/{billingCycle === "annual" ? "year" : "month"}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-muted mt-1 max-w-md">
                    {activePlan.description}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-surface-border text-right sm:min-w-[170px]">
                  <p className="text-xxs uppercase font-bold text-foreground-muted tracking-wider">
                    Next Renewal Date
                  </p>
                  <p className="text-sm font-extrabold text-foreground mt-0.5">
                    October 1, 2026
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-2">
                    <label className="text-[11px] font-medium text-foreground-muted cursor-pointer select-none">
                      Auto-renew:
                    </label>
                    <button
                      onClick={() => {
                        setAutoRenew(!autoRenew);
                        showToast(`Auto-renewal ${!autoRenew ? "enabled" : "disabled"}.`);
                      }}
                      className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                        autoRenew ? "bg-emerald-500" : "bg-foreground/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                          autoRenew ? "left-4" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Resource Quota Meters Grid */}
              <div className="pt-6 border-t border-surface-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                    Allocated Resource Usage
                  </h3>
                  <span className="text-xxs text-foreground-muted font-medium">
                    Resets in 30 days
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Channels Bar */}
                  <QuotaProgressBar
                    label="Connected Social Channels"
                    used={liveChannelsCount}
                    limit={activePlan.limits.channels}
                    unit="channels"
                    icon="🔗"
                    actionHref="/social-accounts"
                    actionLabel="Connect More"
                  />

                  {/* Monthly Posts Bar */}
                  <QuotaProgressBar
                    label="Scheduled Posts this Cycle"
                    used={livePostsCount}
                    limit={activePlan.limits.postsPerMonth}
                    unit="posts"
                    icon="📝"
                    actionHref="/posts/create"
                    actionLabel="Schedule Post"
                  />

                  {/* Team Seats Bar */}
                  <QuotaProgressBar
                    label="Team Member Seats"
                    used={teamSeatsCount}
                    limit={activePlan.limits.teamSeats}
                    unit="seats"
                    icon="👥"
                    actionHref="/settings"
                    actionLabel="Manage Team"
                  />

                  {/* AI Credits Bar */}
                  <QuotaProgressBar
                    label="AI Caption Generation Credits"
                    used={aiCreditsUsed}
                    limit={activePlan.limits.aiCredits}
                    unit="credits"
                    icon="✨"
                    actionHref="/posts/create"
                    actionLabel="Studio AI"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-6 pt-4 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-foreground-muted">
                Need customized terms or SSO?{" "}
                <button
                  onClick={() => showToast("Our enterprise specialist will contact your email within 2 business hours.")}
                  className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                >
                  Contact Enterprise Sales &rarr;
                </button>
              </span>
              <button
                onClick={() => setCancelModalOpen(true)}
                className="text-rose-600 hover:text-rose-700 text-xs font-semibold hover:underline cursor-pointer"
              >
                Pause or Cancel Subscription
              </button>
            </div>
          </div>

          {/* Primary Payment Card & Billing Summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* Payment Method Card */}
            <div className="card-surface p-6 rounded-3xl border border-surface-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                  Default Payment Card
                </h3>
                <button
                  onClick={() => setAddCardModalOpen(true)}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>+</span> Add New
                </button>
              </div>

              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className={`p-4 rounded-2xl border transition-all mb-3 ${
                    pm.isDefault
                      ? "bg-brand-500/5 border-brand-500/40 shadow-sm"
                      : "bg-foreground/[0.02] border-surface-border opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 rounded-lg bg-foreground text-background flex items-center justify-center text-[10px] font-black tracking-wider uppercase">
                        {pm.brand}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          •••• •••• •••• {pm.last4}
                        </p>
                        <p className="text-xxs text-foreground-muted">
                          Expires {String(pm.expMonth).padStart(2, "0")}/{pm.expYear} • {pm.holder}
                        </p>
                      </div>
                    </div>
                    {pm.isDefault && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-500 text-white">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  {!pm.isDefault && (
                    <div className="mt-3 pt-2.5 border-t border-surface-border flex items-center justify-between text-xxs">
                      <button
                        onClick={() => handleSetDefaultCard(pm.id)}
                        className="text-brand-600 font-bold hover:underline cursor-pointer"
                      >
                        Make Default
                      </button>
                      <button
                        onClick={() => handleRemoveCard(pm.id)}
                        className="text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <div className="p-3 rounded-xl bg-foreground/[0.02] border border-surface-border flex items-center gap-2.5 text-xxs text-foreground-muted mt-4">
                <span className="text-sm">🔒</span>
                <span>All transactions are 256-bit encrypted & PCI-DSS Level 1 compliant.</span>
              </div>
            </div>

            {/* Estimated Next Month Bill Breakdown */}
            <div className="card-surface p-6 rounded-3xl border border-surface-border shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground mb-3">
                Estimated Monthly Total
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-foreground-muted">
                  <span>{activePlan.name} Tier</span>
                  <span className="font-semibold text-foreground">
                    ${billingCycle === "annual" ? Math.round(activePlan.annualPrice / 12) : activePlan.monthlyPrice}/mo
                  </span>
                </div>
                {activeAddons.map((addId) => {
                  const item = ADDON_OPTIONS.find((a) => a.id === addId);
                  if (!item) return null;
                  return (
                    <div key={addId} className="flex items-center justify-between text-foreground-muted">
                      <span>{item.name}</span>
                      <span className="font-semibold text-foreground">+${item.price}/mo</span>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-surface-border flex items-center justify-between text-sm font-extrabold text-foreground">
                  <span>Estimated Total</span>
                  <span className="text-brand-600 dark:text-brand-400">
                    ${estimatedMonthlyBill}/month
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Modular Subscription Add-Ons */}
        <div className="card-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                Capacity Boosters & Modular Add-Ons
              </h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                Scale your accounts, AI generative capacity, or support without changing your core tier.
              </p>
            </div>
            <span className="text-xxs font-bold px-2.5 py-1 rounded-full bg-foreground/[0.04] text-foreground-muted">
              {activeAddons.length} Active Add-on{activeAddons.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ADDON_OPTIONS.map((addon) => {
              const isActive = activeAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? "bg-brand-500/5 border-brand-500 shadow-sm"
                      : "bg-foreground/[0.02] border-surface-border hover:border-brand-500/30"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{addon.icon}</span>
                      <span className="text-xs font-extrabold text-foreground">
                        +${addon.price}/mo
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-foreground">{addon.name}</h3>
                    <p className="text-xxs text-foreground-muted mt-1 leading-relaxed">
                      {addon.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleAddon(addon.id)}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20"
                        : "bg-gradient-brand text-white shadow-md active:scale-95"
                    }`}
                  >
                    {isActive ? "Remove Add-On" : "Add to Subscription"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company Billing Profile & Legal Info */}
        <div className="card-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                Company Legal & Invoicing Details
              </h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                These credentials appear on all generated invoices, tax reports, and payment receipts.
              </p>
            </div>
            <button
              onClick={() => {
                setBillingForm(billingDetails);
                setEditBillingModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl border border-surface-border hover:bg-foreground/[0.04] text-xs font-bold text-foreground transition-colors self-start sm:self-auto cursor-pointer"
            >
              ✏️ Edit Billing Info
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-foreground/[0.02] border border-surface-border text-xs">
            <div>
              <p className="text-xxs uppercase font-bold text-foreground-muted">Legal Entity</p>
              <p className="font-bold text-foreground mt-0.5">{billingDetails.companyName}</p>
            </div>
            <div>
              <p className="text-xxs uppercase font-bold text-foreground-muted">Tax ID / VAT / GSTIN</p>
              <p className="font-bold text-foreground mt-0.5">{billingDetails.taxId}</p>
            </div>
            <div>
              <p className="text-xxs uppercase font-bold text-foreground-muted">Invoice Dispatch Email</p>
              <p className="font-bold text-foreground mt-0.5 truncate">{billingDetails.billingEmail}</p>
            </div>
            <div>
              <p className="text-xxs uppercase font-bold text-foreground-muted">Billing Address</p>
              <p className="font-bold text-foreground mt-0.5">
                {billingDetails.addressLine1}, {billingDetails.city}, {billingDetails.state} {billingDetails.postalCode}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice & Billing History Table */}
        <div className="card-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                Invoices & Payment History
              </h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                Download legal audit PDF receipts or inspect itemized tax line items.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={invoiceFilterYear}
                onChange={(e) => setInvoiceFilterYear(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-surface-border bg-surface text-xs font-semibold text-foreground focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="all">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>

              <select
                value={invoiceFilterStatus}
                onChange={(e) => setInvoiceFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-surface-border bg-surface text-xs font-semibold text-foreground focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full text-xs text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-surface-border text-xxs font-extrabold uppercase tracking-wider text-foreground-muted">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Billing Date</th>
                  <th className="py-3.5 px-4">Coverage Period</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-foreground-muted font-medium">
                      No invoices found matching selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-foreground font-mono">
                        {inv.id}
                      </td>
                      <td className="py-4 px-4 text-foreground font-medium">
                        {new Date(inv.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-4 text-foreground-muted">{inv.period}</td>
                      <td className="py-4 px-4 font-extrabold text-foreground">
                        ${inv.total.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-foreground-muted">{inv.paymentMethod}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xxs font-extrabold capitalize bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => setInvoiceModalData(inv)}
                          className="px-2.5 py-1 rounded-lg border border-surface-border hover:bg-foreground/[0.04] text-xxs font-bold text-foreground transition-colors cursor-pointer"
                        >
                          View Receipt
                        </button>
                        <button
                          onClick={() => handleDownloadInvoiceCsv(inv)}
                          className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xxs font-bold transition-colors cursor-pointer"
                        >
                          Download CSV
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: PLAN UPGRADE & TIER COMPARISON */}
      {upgradeModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setUpgradeModalOpen(false)}
        >
          <div
            className="modal-surface w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
              <div>
                <span className="text-xxs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Subscription Plans
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                  Upgrade or Adjust Subscription Tier
                </h2>
              </div>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-foreground/[0.06] text-foreground-muted flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {PLANS.map((plan) => {
                const isSelected = selectedUpgradePlan === plan.id;
                const isCurrent = currentPlanId === plan.id;
                const price =
                  billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedUpgradePlan(plan.id)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                      isSelected
                        ? "border-brand-500 bg-brand-500/5 shadow-md scale-[1.02]"
                        : "border-surface-border hover:border-foreground/20 bg-surface"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-brand text-white shadow-sm">
                        MOST POPULAR
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-extrabold text-foreground">{plan.name}</h3>
                        {isCurrent && (
                          <span className="text-xxs font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 my-2">
                        <span className="text-2xl font-black text-foreground">${price}</span>
                        <span className="text-xxs text-foreground-muted">
                          /{billingCycle === "annual" ? "year" : "mo"}
                        </span>
                      </div>
                      <p className="text-xxs text-foreground-muted mb-4">{plan.description}</p>

                      <ul className="space-y-1.5 text-xxs text-foreground">
                        {plan.features.map((feat, fidx) => (
                          <li key={fidx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUpgradePlan(plan.id);
                      }}
                      className={`mt-5 w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-brand-500 text-white shadow-sm"
                          : "bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08]"
                      }`}
                    >
                      {isCurrent ? "Active Tier" : isSelected ? "Selected Tier" : "Select Tier"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs">
                <p className="font-bold text-foreground">
                  Selected: {PLANS.find((p) => p.id === selectedUpgradePlan)?.name} Tier
                </p>
                <p className="text-xxs text-foreground-muted">
                  Prorated difference will be calculated against your default payment method immediately.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setUpgradeModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-surface-border text-xs font-bold text-foreground hover:bg-foreground/[0.04]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPlanChange}
                  className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  Confirm & Update Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW PAYMENT CARD */}
      {addCardModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setAddCardModalOpen(false)}
        >
          <div
            className="modal-surface w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
              <div>
                <span className="text-xxs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Payment Gateway
                </span>
                <h2 className="text-xl font-extrabold text-foreground">Add New Payment Card</h2>
              </div>
              <button
                onClick={() => setAddCardModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-foreground/[0.06] text-foreground-muted flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Business Owner"
                  value={newCard.holder}
                  onChange={(e) => setNewCard({ ...newCard, holder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="•••• •••• •••• 4242"
                  value={newCard.number}
                  onChange={(e) => {
                    const v = e.target.value
                      .replace(/\s+/g, "")
                      .replace(/[^0-9]/gi, "");
                    const parts = v.match(/.{1,4}/g) || [];
                    setNewCard({ ...newCard, number: parts.join(" ") });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-mono font-medium text-foreground focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                    Exp Month
                  </label>
                  <select
                    value={newCard.expMonth}
                    onChange={(e) => setNewCard({ ...newCard, expMonth: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                    Exp Year
                  </label>
                  <select
                    value={newCard.expYear}
                    onChange={(e) => setNewCard({ ...newCard, expYear: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {[2026, 2027, 2028, 2029, 2030, 2031, 2032].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                    CVC / CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={newCard.cvc}
                    onChange={(e) =>
                      setNewCard({ ...newCard, cvc: e.target.value.replace(/[^0-9]/g, "") })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-mono font-medium text-foreground focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                  Billing ZIP / Postal Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="94105"
                  value={newCard.postalCode}
                  onChange={(e) => setNewCard({ ...newCard, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="makeDefaultCheckbox"
                  checked={newCard.isDefault}
                  onChange={(e) => setNewCard({ ...newCard, isDefault: e.target.checked })}
                  className="rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                />
                <label
                  htmlFor="makeDefaultCheckbox"
                  className="text-xs font-medium text-foreground cursor-pointer"
                >
                  Set as primary default payment method
                </label>
              </div>

              <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddCardModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-foreground hover:bg-foreground/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  Save & Secure Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT BILLING & LEGAL PROFILE */}
      {editBillingModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setEditBillingModalOpen(false)}
        >
          <div
            className="modal-surface w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
              <div>
                <span className="text-xxs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Tax & Corporate Entity
                </span>
                <h2 className="text-xl font-extrabold text-foreground">Edit Invoicing Details</h2>
              </div>
              <button
                onClick={() => setEditBillingModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-foreground/[0.06] text-foreground-muted flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBillingDetails} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                  Legal Company Name
                </label>
                <input
                  type="text"
                  required
                  value={billingForm.companyName}
                  onChange={(e) => setBillingForm({ ...billingForm, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                    Tax / VAT / GSTIN
                  </label>
                  <input
                    type="text"
                    required
                    value={billingForm.taxId}
                    onChange={(e) => setBillingForm({ ...billingForm, taxId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                    Invoice Email
                  </label>
                  <input
                    type="email"
                    required
                    value={billingForm.billingEmail}
                    onChange={(e) => setBillingForm({ ...billingForm, billingEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={billingForm.addressLine1}
                  onChange={(e) => setBillingForm({ ...billingForm, addressLine1: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={billingForm.city}
                    onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                    State / Prov
                  </label>
                  <input
                    type="text"
                    required
                    value={billingForm.state}
                    onChange={(e) => setBillingForm({ ...billingForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={billingForm.postalCode}
                    onChange={(e) => setBillingForm({ ...billingForm, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface text-xs font-medium text-foreground focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditBillingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-foreground hover:bg-foreground/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: INVOICE / RECEIPT VIEWER & PRINT MODAL */}
      {invoiceModalData && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setInvoiceModalData(null)}
        >
          <div
            className="modal-surface w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Printable Receipt Paper Container */}
            <div className="border border-surface-border p-6 sm:p-8 rounded-2xl bg-surface mb-6">
              <div className="flex items-start justify-between pb-6 border-b border-surface-border">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-brand text-white flex items-center justify-center text-xs font-black">
                      SP
                    </div>
                    <span className="font-extrabold text-base tracking-tight text-foreground">
                      Social<span className="text-brand-500">Pilot</span> Inc.
                    </span>
                  </div>
                  <p className="text-xxs text-foreground-muted mt-1">
                    548 Market St, Suite 300, San Francisco, CA 94104
                  </p>
                  <p className="text-xxs text-foreground-muted">support@socialpilot.io</p>
                </div>

                <div className="text-right">
                  <span className="text-xxs font-extrabold uppercase tracking-wider text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    PAID RECEIPT
                  </span>
                  <h3 className="text-base font-extrabold font-mono text-foreground mt-2">
                    {invoiceModalData.id}
                  </h3>
                  <p className="text-xxs text-foreground-muted">
                    Issued on {invoiceModalData.date}
                  </p>
                </div>
              </div>

              {/* Billed To vs Payment Details */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-surface-border text-xs">
                <div>
                  <p className="text-xxs font-bold uppercase text-foreground-muted mb-0.5">
                    Billed To:
                  </p>
                  <p className="font-bold text-foreground">{billingDetails.companyName}</p>
                  <p className="text-xxs text-foreground-muted">
                    {billingDetails.addressLine1}, {billingDetails.city}, {billingDetails.state}
                  </p>
                  <p className="text-xxs text-foreground-muted">Tax ID: {billingDetails.taxId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xxs font-bold uppercase text-foreground-muted mb-0.5">
                    Payment Method:
                  </p>
                  <p className="font-bold text-foreground">{invoiceModalData.paymentMethod}</p>
                  <p className="text-xxs text-foreground-muted">
                    Coverage: {invoiceModalData.period}
                  </p>
                  <p className="text-xxs text-emerald-600 font-bold">Status: Completed & Settled</p>
                </div>
              </div>

              {/* Itemized Line Items */}
              <div className="py-4 border-b border-surface-border">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-xxs font-bold uppercase text-foreground-muted border-b border-surface-border">
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {invoiceModalData.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2.5 text-foreground">{item.desc}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-foreground">
                          ${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="pt-4 flex flex-col items-end text-xs space-y-1">
                <div className="flex justify-between w-48 text-foreground-muted">
                  <span>Subtotal:</span>
                  <span className="font-mono text-foreground font-bold">
                    ${invoiceModalData.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between w-48 text-foreground-muted">
                  <span>Tax / VAT (8%):</span>
                  <span className="font-mono text-foreground font-bold">
                    ${invoiceModalData.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between w-48 pt-2 border-t border-surface-border text-sm font-extrabold text-foreground">
                  <span>Total Paid:</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">
                    ${invoiceModalData.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-surface-border hover:bg-foreground/[0.04] text-xs font-bold text-foreground flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🖨️</span> Print Receipt
              </button>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleDownloadInvoiceCsv(invoiceModalData)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => setInvoiceModalData(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CANCEL OR PAUSE SUBSCRIPTION */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setCancelModalOpen(false)}
        >
          <div
            className="modal-surface w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mx-auto mb-4">
              ⚠️
            </div>
            <h2 className="text-lg font-extrabold text-foreground text-center">
              Pause or Cancel Subscription?
            </h2>
            <p className="text-xs text-foreground-muted text-center mt-1">
              Before cancelling, you can pause your subscription for up to 3 months without losing your scheduled campaigns or connected channels.
            </p>

            <div className="my-5 space-y-2">
              <button
                onClick={() => {
                  setCancelModalOpen(false);
                  showToast("Your subscription has been paused for 60 days. No charges will occur.");
                }}
                className="w-full p-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/15 text-left text-xs text-brand-600 dark:text-brand-400 font-bold transition-all cursor-pointer flex items-center justify-between"
              >
                <span>⏸️ Pause Subscription for 60 Days</span>
                <span>Recommended &rarr;</span>
              </button>

              <div className="pt-2">
                <label className="block text-xxs font-bold uppercase text-foreground-muted mb-1">
                  Reason for cancelling (optional)
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border bg-surface text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="">Select a reason...</option>
                  <option value="expensive">Too expensive for current volume</option>
                  <option value="missing_features">Missing required integration</option>
                  <option value="switching">Switching to another tool</option>
                  <option value="temporary">Temporary pause in marketing campaigns</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-surface-border text-xs font-bold text-foreground hover:bg-foreground/[0.04]"
              >
                Keep Active
              </button>
              <button
                onClick={() => {
                  setCancelModalOpen(false);
                  showToast("Cancellation scheduled at end of current billing period.", "error");
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

// Subcomponent: Live Visual Quota Progress Bar
function QuotaProgressBar({ label, used, limit, unit, icon, actionHref, actionLabel }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const isHigh = pct >= 85;
  const isCritical = pct >= 95;

  return (
    <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-surface-border hover:border-surface-border/80 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className="text-xs font-bold text-foreground">{label}</span>
          </div>
          <span
            className={`text-xxs font-extrabold px-2 py-0.5 rounded-full ${
              isCritical
                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                : isHigh
                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            }`}
          >
            {pct}% Used
          </span>
        </div>

        <div className="h-2 rounded-full bg-background-secondary overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCritical
                ? "bg-rose-500"
                : isHigh
                ? "bg-amber-500"
                : "bg-gradient-brand"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xxs text-foreground-muted pt-1">
        <span>
          <strong className="text-foreground">{used}</strong> of {limit} {unit}
        </span>
        {actionHref && (
          <Link
            href={actionHref}
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
          >
            {actionLabel} &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}