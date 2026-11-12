const config = {
  appName: "UGCora Studio",
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    webhook_url: process.env.WEBHOOK_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    plans: {
      basic:        { id: "basic",        name: "Basic",        credits: 2000,  price: 2900  },
      standard:     { id: "standard",     name: "Standard",     credits: 6000,  price: 7900  },
      pro:          { id: "professional", name: "Professional", credits: 20000, price: 19900 },
      professional: { id: "professional", name: "Professional", credits: 20000, price: 19900 },
      business:     { id: "business",     name: "Business",     credits: 60000, price: 49900 },
    },
  },
  ai: {
    apiKey: process.env.UGC_API_KEY || process.env.MUAPIAPP_API_KEY,
    generationCost: 10,
    model: "gpt-4o",
  },
};

export default config;
