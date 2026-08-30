export interface CuratedCollection {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  iconName: string;
  heroImage: string;
  badge: string;
  actionText: string;
  avgPriceRange: string;
  avgYield: string;
  totalListingsText: string;
  overview: string;
  keyHighlights: {
    title: string;
    description: string;
  }[];
  filters: {
    isOwnerOnly?: boolean;
    isVerifiedOnly?: boolean;
    isReraApprovedOnly?: boolean;
    constructionStatus?: 'Ready to Move' | 'Under Construction' | 'New Launch';
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    listingType?: 'buy' | 'rent' | 'commercial' | 'plot' | 'pg';
    bhk?: number[];
  };
  recommendedCities: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const CURATED_COLLECTIONS: CuratedCollection[] = [
  {
    id: 'zero-brokerage',
    title: 'Zero Brokerage Direct Homes',
    subtitle: 'Verified listings posted directly by property owners. Save 100% on brokerage fees.',
    tag: '0% Brokerage',
    tagColor: 'bg-[#18A67D]',
    iconName: 'CheckCircle2',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
    badge: '100% Owner Direct',
    actionText: 'View Owner Properties',
    avgPriceRange: '₹35 Lac - ₹2.5 Cr',
    avgYield: '100% Brokerage Savings (Avg ₹50K - ₹2.5L)',
    totalListingsText: '12,400+ Direct Owner Properties',
    overview: 'Skip unnecessary broker fees and speak directly with genuine property owners across major Indian metros. Every listing in this collection has gone through owner identity verification, title document checks, and direct contact validation by our legal team.',
    keyHighlights: [
      {
        title: 'Zero Commission Fees',
        description: 'Connect directly with homeowners and landlords without paying 1 or 2 months of brokerage.'
      },
      {
        title: 'Direct Video & In-Person Walkthroughs',
        description: 'Schedule site visits directly with owners at times that suit your calendar.'
      },
      {
        title: 'Transparent Negotiation',
        description: 'Discuss pricing, deposit terms, and furnishing items transparently with no middlemen.'
      },
      {
        title: 'Complimentary Legal Agreement Drafts',
        description: 'Rabnix Estate provides standard stamp-paper and e-rental agreements for all direct deals.'
      }
    ],
    filters: {
      isOwnerOnly: true,
      isVerifiedOnly: false
    },
    recommendedCities: ['Bangalore', 'Mumbai', 'Delhi / NCR', 'Pune', 'Hyderabad'],
    faqs: [
      {
        question: 'Are all properties in this collection really 100% zero brokerage?',
        answer: 'Yes! Every property in this collection is listed directly by the individual owner or legal titleholder. Rabnix Estate does not charge any brokerage from buyers or tenants.'
      },
      {
        question: 'How do I contact the property owner?',
        answer: 'Simply click "Call Owner" or "Send Inquiry" on any listing. You will instantly receive the verified phone number and WhatsApp contact link.'
      }
    ]
  },
  {
    id: 'ready-to-move',
    title: 'Ready-to-Move Residences',
    subtitle: 'Immediate possession apartments with occupancy certificates (OC) and clear titles.',
    tag: 'Immediate Possession',
    tagColor: 'bg-[#0F2A43]',
    iconName: 'ShieldCheck',
    heroImage: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=80',
    badge: 'OC Received & Approved',
    actionText: 'Explore Ready Homes',
    avgPriceRange: '₹45 Lac - ₹6.5 Cr',
    avgYield: '0 Waiting Time • Instant Rental Income',
    totalListingsText: '8,950+ Ready Flats & Villas',
    overview: 'Eliminate construction delays and GST liabilities with fully completed, ready-to-move apartments and villas. All projects feature Occupancy Certificates (OC), physical power and water connections, and functional clubhouse amenities.',
    keyHighlights: [
      {
        title: 'Zero Construction Delay Risk',
        description: 'What you see is what you get. Inspect the exact flat, view, sunlight, and finishes before booking.'
      },
      {
        title: 'No 5% GST Applicable',
        description: 'Completed properties with Occupancy Certificates are exempt from GST, saving you lakhs.'
      },
      {
        title: 'Instant Rental Inflow or Self-Use',
        description: 'Move in immediately after registration or start earning monthly rental returns from day one.'
      },
      {
        title: 'Fully Operational Clubhouses',
        description: 'Enjoy pre-functioning gymnasiums, swimming pools, tennis courts, and security systems.'
      }
    ],
    filters: {
      constructionStatus: 'Ready to Move'
    },
    recommendedCities: ['Bangalore', 'Delhi / NCR', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune'],
    faqs: [
      {
        question: 'Do ready-to-move homes require GST payment?',
        answer: 'No. Properties that have received a valid Occupancy Certificate (OC) from the municipal corporation do not attract GST.'
      },
      {
        question: 'Can I get home loans approved quickly for ready homes?',
        answer: 'Yes, ready-to-move homes with OC are pre-approved by leading banks like SBI, HDFC, ICICI, and Axis Bank for fast loan disbursement within 5 to 7 working days.'
      }
    ]
  },
  {
    id: 'luxury-penthouses',
    title: 'Ultra Luxury & Penthouses',
    subtitle: 'Bespoke high-rises with private sky decks, infinity pools, and panoramic city vistas.',
    tag: 'Signature Living',
    tagColor: 'bg-amber-600',
    iconName: 'Crown',
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
    badge: 'Curated HNI Portfolios',
    actionText: 'View Luxury Portfolios',
    avgPriceRange: '₹2.5 Cr - ₹45 Cr+',
    avgYield: '14.8% YoY Capital Appreciation in Prime Belts',
    totalListingsText: '1,820+ Signature Estates',
    overview: 'Discover architectural masterworks designed for elite connoisseurs. From sea-facing duplex penthouses in South Mumbai to sprawling lakefront villas in Bangalore and golf course estates in Gurgaon.',
    keyHighlights: [
      {
        title: 'Private Sky Decks & Plunge Pools',
        description: 'Unobstructed 270-degree skyline and sea views with expansive outdoor entertainment terraces.'
      },
      {
        title: 'Private Elevators & Biometric Access',
        description: 'Direct keyless elevator access opening exclusively into your private entrance foyer.'
      },
      {
        title: 'Italian Marble & Smart Home Automation',
        description: 'Integrated VRV climate controls, Lutron mood lighting, and automated floor-to-ceiling glass facades.'
      },
      {
        title: '7-Star Concierge & Valet Service',
        description: 'Dedicated concierge, temperature-controlled wine cellars, cigar lounges, and private helipads.'
      }
    ],
    filters: {
      minPrice: 20000000
    },
    recommendedCities: ['Mumbai', 'Delhi / NCR', 'Bangalore', 'Hyderabad', 'Goa'],
    faqs: [
      {
        question: 'Does Rabnix Estate provide private confidential showings?',
        answer: 'Yes, our Luxury Portfolio Managers provide discreet, NDA-protected private viewing sessions and dedicated legal consultation.'
      }
    ]
  },
  {
    id: 'budget-homes',
    title: 'Budget Homes under ₹50 Lac',
    subtitle: 'Pocket-friendly 1 & 2 BHK flats in high-growth corridors with excellent connectivity.',
    tag: 'High Value',
    tagColor: 'bg-[#0E7C5D]',
    iconName: 'IndianRupee',
    heroImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
    badge: 'Affordable & High Growth',
    actionText: 'Browse Affordable Homes',
    avgPriceRange: '₹18 Lac - ₹50 Lac',
    avgYield: '8% - 10% High Rental Yield for First-time Buyers',
    totalListingsText: '15,600+ Value Homes',
    overview: 'High-quality, affordable urban homes strategically located near upcoming metro corridors, industrial hubs, and IT clusters. Perfect for first-time home buyers and smart rental yield investors.',
    keyHighlights: [
      {
        title: 'Low Down Payment & PMAY Benefits',
        description: 'Eligible for government interest subsidy schemes and flexible construction-linked payment plans.'
      },
      {
        title: 'Proximity to Metro & Public Transit',
        description: 'Reduced daily commute times with walking distance access to rapid transit stations.'
      },
      {
        title: 'Gated Township Amenities',
        description: 'Equipped with 24/7 security, power backup, landscaped jogging tracks, and community halls.'
      },
      {
        title: 'High Rental Demand',
        description: 'Always in high demand by working professionals, ensuring consistent monthly rental yields.'
      }
    ],
    filters: {
      maxPrice: 5000000
    },
    recommendedCities: ['Pune', 'Bangalore', 'Ahmedabad', 'Chennai', 'Kolkata', 'Delhi / NCR'],
    faqs: [
      {
        question: 'What are the EMI options available for homes under ₹50 Lakhs?',
        answer: 'With standard 80% to 90% bank loan financing at 8.4% interest, EMIs typically range between ₹28,000 and ₹38,000 per month for a 20-year tenure.'
      }
    ]
  },
  {
    id: 'gated-villas',
    title: 'Gated Villa Communities & Enclaves',
    subtitle: 'Private duplex residences with personal gardens, clubhouses, and serene leafy environs.',
    tag: 'Private Estates',
    tagColor: 'bg-emerald-700',
    iconName: 'Home',
    heroImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=80',
    badge: 'Independent Living',
    actionText: 'Explore Luxury Villas',
    avgPriceRange: '₹1.8 Cr - ₹12 Cr',
    avgYield: '12% - 16% Land Appreciation',
    totalListingsText: '2,400+ Independent Villas',
    overview: 'Enjoy the perfect blend of independent land ownership and secure 5-star gated community lifestyle. Sprawling layouts with private backyards, terrace sit-outs, and dedicated servant quarters.',
    keyHighlights: [
      {
        title: '100% Undivided Land Share',
        description: 'Complete ownership of your plot and independent terrace space with future vertical expansion rights.'
      },
      {
        title: 'Private Garden & Car Porch',
        description: 'Dedicated parking for 2 to 4 vehicles and private landscaped green lawns.'
      },
      {
        title: 'Multi-Acre Resort Clubhouses',
        description: 'Access to Olympic swimming pools, indoor squash, badminton courts, and dining cafes.'
      },
      {
        title: 'Multi-Tier Security & Surveillance',
        description: 'Boom barriers, perimeter infrared sensors, and 24/7 patrolling guards.'
      }
    ],
    filters: {
      category: 'Villa'
    },
    recommendedCities: ['Bangalore', 'Hyderabad', 'Chennai', 'Delhi / NCR', 'Lucknow'],
    faqs: [
      {
        question: 'Do these villas come with freehold land titles?',
        answer: 'Yes, all verified villas in this collection have clear, encumbrance-free titles with complete land rights.'
      }
    ]
  },
  {
    id: 'commercial-tech-hubs',
    title: 'Grade-A Commercial & Tech Parks',
    subtitle: 'High-yield office spaces, retail showrooms, and corporate campuses in prime business districts.',
    tag: 'High Rental Yield',
    tagColor: 'bg-blue-700',
    iconName: 'Briefcase',
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
    badge: 'Pre-Leased & Bare Shell',
    actionText: 'Explore Commercial Spaces',
    avgPriceRange: '₹85 Lac - ₹35 Cr',
    avgYield: '8.5% - 11% Annual Rental Yield',
    totalListingsText: '4,150+ Commercial Properties',
    overview: 'Generate superior passive rental income with Grade-A commercial office floors, tech-park spaces, and high-street retail showrooms pre-leased to Fortune 500 companies and leading Indian banks.',
    keyHighlights: [
      {
        title: 'Attractive 8.5% - 10.5% Cap Rates',
        description: 'Significantly higher recurring cash flow yields compared to standard residential real estate.'
      },
      {
        title: 'Long-term 9-Year Leases',
        description: 'Secure lock-ins with institutional corporate tenants and 15% escalation clauses every 3 years.'
      },
      {
        title: 'LEED Gold & Platinum Certified',
        description: 'Modern glass facades with central chiller air-conditioning, 100% power backup, and EV charging.'
      },
      {
        title: 'Prime CBD & SEZ Locations',
        description: 'Situated in Cyber City Gurgaon, BKC Mumbai, Whitefield Bangalore, and Hitec City Hyderabad.'
      }
    ],
    filters: {
      category: 'Commercial Office',
      listingType: 'commercial'
    },
    recommendedCities: ['Mumbai', 'Bangalore', 'Delhi / NCR', 'Hyderabad', 'Pune'],
    faqs: [
      {
        question: 'What is the minimum investment for Grade-A commercial offices?',
        answer: 'Fractional and small bare-shell office units start from ₹85 Lakhs, while standalone floors and pre-leased assets range from ₹4 Cr to ₹30 Cr.'
      }
    ]
  }
];
