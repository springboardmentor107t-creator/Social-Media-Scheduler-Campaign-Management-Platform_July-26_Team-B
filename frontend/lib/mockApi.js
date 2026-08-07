export const mockCampaigns = [
  {
    id: "c1",
    name: "Summer Sale 2026",
    status: "active",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    budget: 5000,
    spent: 3200,
    engagement: 45000,
    conversions: 1200,
    roi: 240,
    platforms: ["facebook", "instagram"],
    goal: "Increase Sales",
  },
  {
    id: "c2",
    name: "New Product Launch",
    status: "scheduled",
    startDate: "2026-09-15",
    endDate: "2026-10-15",
    budget: 10000,
    spent: 0,
    engagement: 0,
    conversions: 0,
    roi: 0,
    platforms: ["twitter", "linkedin", "facebook"],
    goal: "Brand Awareness",
  },
  {
    id: "c3",
    name: "Spring Cleaning Promo",
    status: "completed",
    startDate: "2026-03-01",
    endDate: "2026-04-30",
    budget: 3000,
    spent: 3000,
    engagement: 25000,
    conversions: 850,
    roi: 150,
    platforms: ["instagram", "tiktok"],
    goal: "Lead Generation",
  },
];

export const mockAnalytics = {
  engagement: [
    { date: "2026-08-01", likes: 400, comments: 240, shares: 2400 },
    { date: "2026-08-02", likes: 300, comments: 139, shares: 2210 },
    { date: "2026-08-03", likes: 200, comments: 980, shares: 2290 },
    { date: "2026-08-04", likes: 278, comments: 390, shares: 2000 },
    { date: "2026-08-05", likes: 189, comments: 480, shares: 2181 },
    { date: "2026-08-06", likes: 239, comments: 380, shares: 2500 },
    { date: "2026-08-07", likes: 349, comments: 430, shares: 2100 },
  ],
  audienceGrowth: [
    { month: "Jan", followers: 4000 },
    { month: "Feb", followers: 4500 },
    { month: "Mar", followers: 5200 },
    { month: "Apr", followers: 5800 },
    { month: "May", followers: 6500 },
    { month: "Jun", followers: 7100 },
    { month: "Jul", followers: 8000 },
    { month: "Aug", followers: 9500 },
  ],
  roi: [
    { name: "Summer Sale 2026", roi: 240, spend: 3200 },
    { name: "Spring Promo", roi: 150, spend: 3000 },
    { name: "Winter Deals", roi: 180, spend: 4000 },
  ],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getCampaigns = async () => {
  await delay(800);
  return mockCampaigns;
};

export const getCampaignById = async (id) => {
  await delay(800);
  return mockCampaigns.find((c) => c.id === id);
};

export const createCampaign = async (campaignData) => {
  await delay(1000);
  const newCampaign = {
    id: `c${Date.now()}`,
    ...campaignData,
    status: "scheduled",
    spent: 0,
    engagement: 0,
    conversions: 0,
    roi: 0,
  };
  mockCampaigns.push(newCampaign);
  return newCampaign;
};

export const getAnalytics = async () => {
  await delay(800);
  return mockAnalytics;
};
