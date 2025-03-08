export const SITE_CONFIG = {
  name: "Beatmaking Madness",
  description: "Premium Beats for Serious Artists",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.jpg",
  links: {
    twitter: "https://twitter.com/yourusername",
    github: "https://github.com/yourusername",
  },
} as const;

export const BEAT_LICENSES = {
  basic: {
    name: "Basic License",
    price: 29.99,
    features: [
      "MP3 File",
      "WAV File",
      "50,000 Streams",
      "Music Video Use",
      "Non-Profit Live Performance",
    ],
  },
  premium: {
    name: "Premium License",
    price: 99.99,
    features: [
      "MP3 File",
      "WAV File",
      "Trackout Files",
      "Unlimited Streams",
      "Music Video Use",
      "Commercial Live Performance",
      "Radio Broadcasting",
    ],
  },
  exclusive: {
    name: "Exclusive Rights",
    price: 499.99,
    features: [
      "Full Ownership",
      "All Audio Formats",
      "Unlimited Usage",
      "Remove from Store",
      "Contract Provided",
    ],
  },
} as const; 