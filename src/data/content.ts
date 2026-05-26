export const LENDRA_CONTENT = {
  hero: {
    headline: "AI allocation layer for personalized onchain yield",
    subtext:
      "LENDRA1 turns stablecoin deposits into personalized yield portfolios, composed around your risk, liquidity, and wallet profile.",
    primaryCTA: "Explore Vault",
    secondaryCTA: "How It Works",
  },
  positioning: {
    kicker: "Solution",
    title: "Personalized portfolios for stablecoin depositors.",
    body:
      "Your risk tolerance, liquidity needs, and tax profile shape how your stablecoins are allocated. LENDRA1 composes a personalized yield portfolio from those inputs, with ongoing monitoring as markets, yields, and risk signals change.",
    line: "No two wallets need to hold the same allocation.",
  },
  whatWeDo: {
    kicker: "Problem",
    title: "Most vaults still treat every depositor the same",
    content:
      "You deposit stablecoins, enter the pool, and receive the same allocation as everyone else. But every wallet has different needs. Every wallet comes with its own priorities, from risk appetite and liquidity needs to how long the capital can stay deployed. LENDRA1 is built for those differences.",
    flow: [
      { label: "Generic vault", value: "One shared allocation" },
      { label: "Wallet profile", value: "Different priorities" },
      { label: "LENDRA1", value: "Allocation around needs" },
    ],
  },
  howItWorks: {
    title: "How LENDRA1 works",
    steps: [
      {
        label: "Deposit stablecoins",
        description: "Start with supported stablecoins and enter the vault.",
        mediaLabel: "Capital bridge provided",
      },
      {
        label: "Set your profile",
        description:
          "Choose your risk tolerance, liquidity preference, and tax profile.",
        mediaLabel: "Settlement completed",
      },
      {
        label: "Receive a personalized allocation",
        description:
          "LENDRA1 composes and monitors a yield portfolio built around your wallet.",
        mediaLabel: "Capital redeployed",
      },
    ],
  },
  singleTransfer: {
    kicker: "Personalization",
    title: "Your profile shapes your yield exposure.",
    paragraphs: [
      "Every wallet enters yield with different needs. Some users want a more conservative allocation, some care more about liquidity, and others can stay allocated for longer.",
      "LENDRA1 uses those preferences to shape how your stablecoins move across opportunities, creating a portfolio that reflects the wallet behind the deposit.",
      "A single vault experience, with portfolios that adapt to each wallet's needs.",
    ],
  },
  intelligence: {
    kicker: "Intelligence Layer",
    title: "The intelligence layer behind each portfolio",
    body:
      "A personalized portfolio needs more than a one-time allocation. It needs ongoing review as yields change, liquidity shifts, borrower conditions evolve, and market signals move. LENDRA1 uses AI to monitor those changes across the opportunity set and support allocation decisions for each wallet profile over time.",
  },
  trustArchitecture: {
    kicker: "AI Committee",
    title: "A structured review process for every allocation",
    body:
      "LENDRA1 is built with a multi-agent review process that evaluates allocation changes across risk, credit, and market conditions.",
    bodyTwo:
      "Each portfolio update is assessed through separate analytical roles, helping the system avoid single-model dependence and maintain a clear decision trail.",
    closing:
      "Allocation decisions are reviewed, compared, and recorded before portfolios move.",
    agents: [
      {
        label: "Conservative Quant",
        description:
          "Reviews downside risk, volatility, concentration, and duration.",
      },
      {
        label: "Credit Analyst",
        description:
          "Reviews borrower quality, collateral strength, documents, and repayment context.",
      },
      {
        label: "Momentum Tracker",
        description:
          "Tracks liquidity shifts, market movement, secondary pricing, and emerging signals.",
      },
    ],
    sections: [
      {
        kicker: "Opportunity Universe",
        label: "Opportunity Universe",
        title: "A wider universe of yield, organized into one allocation layer.",
        description:
          "Onchain yield is expanding across tokenized credit, RWA products, treasury-linked strategies, and institutional issuers. The challenge is no longer just finding opportunities; it is understanding which exposure fits each wallet.",
        descriptionTwo:
          "LENDRA1 brings this opportunity set into a single allocation layer, where stablecoins can be routed based on profile, risk, liquidity, and market conditions.",
        closing: "A larger yield market needs more intelligent allocation.",
      },
      {
        kicker: "Risk Intelligence",
        label: "Risk Intelligence",
        title: "Risk intelligence beneath every allocation",
        description:
          "Every yield opportunity carries more than a return figure. It carries credit quality, duration, collateral exposure, liquidity conditions, repayment behavior, and changing market risk.",
        descriptionTwo:
          "LENDRA1 is designed to review these variables continuously, so portfolios are not shaped by headline APR alone.",
        closing: "Yield becomes more useful when the risk behind it is visible.",
      },
      {
        kicker: "Exit Signals",
        label: "Exit Signals",
        title: "Monitoring risk before it becomes obvious",
        description:
          "In credit and yield markets, exits matter as much as entries. LENDRA1 monitors signals across borrower behavior, market activity, governance updates, pricing movement, and onchain data to identify when an opportunity may no longer fit a portfolio's risk profile.",
        descriptionTwo:
          "The goal is to support earlier, better-informed allocation decisions as conditions change.",
      },
      {
        kicker: "Counterfactual Reporting",
        label: "Counterfactual Reporting",
        title: "Transparent performance attribution",
        description:
          "Every portfolio update should create a record. LENDRA1 is designed to compare new allocations against prior ones, helping users understand how changes affected performance across each reporting cycle.",
        descriptionTwo:
          "This turns portfolio management into a visible process, where decisions can be reviewed through outcomes rather than trust alone.",
      },
      {
        kicker: "Economics",
        label: "Economics",
        title: "A performance-linked fee model.",
        description:
          "LENDRA1 does not charge deposit or withdrawal fees.",
        descriptionTwo:
          "The protocol earns through a performance fee above benchmark, aligning the system with better allocation outcomes.",
        closing: "10% performance fee above benchmark.",
      },
    ],
  },
  faq: {
    title: "FAQ",
    items: [
      {
        question: "What is LENDRA1?",
        answer:
          "LENDRA1 is the AI allocation layer for personalized onchain yield. It turns stablecoin deposits into yield portfolios shaped around each wallet's risk, liquidity, and profile.",
      },
      {
        question: "How is LENDRA1 different from a normal vault?",
        answer:
          "A normal vault usually gives every depositor the same allocation. LENDRA1 creates portfolio allocations around each wallet's profile, so users can access yield through a more personalized structure.",
      },
      {
        question: "What shapes my portfolio?",
        answer:
          "Your portfolio is shaped by your risk tolerance, liquidity preference, tax profile, and allocation constraints. These inputs help LENDRA1 decide how your stablecoins should move across available opportunities.",
      },
      {
        question: "Where does the yield come from?",
        answer:
          "LENDRA1 allocates across curated tokenized yield opportunities, including tokenized credit, RWA products, treasury-linked strategies, and institutional-grade onchain issuers.",
      },
      {
        question: "Is LENDRA1 custodial?",
        answer:
          "LENDRA1 is designed as non-custodial vault infrastructure. Users keep control through smart contracts, with no lockups and withdrawal at NAV.",
      },
      {
        question: "How does AI support allocation?",
        answer:
          "LENDRA1 uses AI to monitor opportunities, review risk signals, compare market conditions, and support portfolio adjustments over time. The goal is disciplined allocation, not blind automation.",
      },
      {
        question: "What is the AI committee?",
        answer:
          "The AI committee is a structured review system made up of specialized agents focused on risk, credit quality, and market behavior. Each one reviews a different part of the allocation process.",
      },
      {
        question: "Can I withdraw anytime?",
        answer:
          "LENDRA1 is designed with no lockups and withdrawal at NAV, with an expected exit window within 24 hours.",
      },
      {
        question: "Does every user get the same portfolio?",
        answer:
          "No. LENDRA1 is built so different wallet profiles can receive different allocation paths based on risk, liquidity, and portfolio needs.",
      },
      {
        question: "How does LENDRA1 measure whether allocation decisions worked?",
        answer:
          "LENDRA1 is designed to compare updated allocations against the allocations they replaced, helping users see whether portfolio changes improved outcomes over time.",
      },
    ],
  },
  finalCTA: {
    title: "Ready to allocate beyond the generic vault?",
    subtext:
      "Explore a vault experience built around profile-based allocation, continuous monitoring, and transparent portfolio review.",
    primaryCTA: "Explore Vault",
    secondaryCTA: "Read Methodology",
  },
  footer: {
    text:
      "LENDRA1 allocates capital into short-term credit facilities supporting global remittance activity. Participation involves exposure to real transaction flow and variable outcomes.",
    links: ["Documentation", "Risk Disclosure", "Terms"],
  },
};
