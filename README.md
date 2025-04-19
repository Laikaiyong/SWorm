# SWorm: Cross-Chain DeFi Yield Optimizer

SWorm is a smart DeFi platform that simplifies yield farming across multiple blockchains with an intuitive, gamified experience powered by AI.

## ❗ Problem Statement

- Yield farming in DeFi is **complex and fragmented**, often requiring multiple tools and platforms.
- Users must **manually bridge assets** across blockchains, increasing friction and gas costs.
- Choosing the right pools or strategies requires **deep research** and constant monitoring.
- New users face a **steep learning curve**, while even advanced users risk inefficient capital deployment.
- There is a lack of **personalized automation** and real-time optimization across chains.
- Existing platforms lack **gamification or guided experiences**, making DeFi feel overwhelming and inaccessible.

**SWorm** addresses these challenges by providing:

- A **cross-chain yield optimizer** that automates farming via Wormhole
- **AI-driven strategy recommendations** based on risk and performance
- A **gamified interface** that turns DeFi into an engaging, rewarding journey

## 🌟 Key Features

### Cross-Chain Integration

- Seamless onboarding from any blockchain through Wormhole
- Bridge assets effortlessly between supported networks

### Smart Yield Farming Strategies

Choose your investment style:

- 🛡️ **Shield Strategy** - Low-risk, stable returns (stablecoin staking)
- ⚔️ **Sword Strategy** - High-risk, high-reward opportunities (memecoin pools + leverage)
- ⚔️🛡️ **Balanced Strategy** - Optimal mix of staking and stable pools
- 🔫 **Gun Mode** - AI-validated aggressive strategy for maximum yield (expert-level risk)

### AI Adventure Buddy

- Real-time position monitoring with intelligent notifications
- Risk assessment based on APY, TVL, and market conditions
- Smart recommendations for yield optimization

### Gamified Experience

- Complete quests to earn rewards and NFT badges
- Temporary APY boosts for completing challenges
- Progress tracking and achievement system

### Advanced Analytics

- GraphQL-powered insights on pool volumes and performance
- Historical yield data visualization
- Risk-adjusted return comparisons

## 👷‍♀️ Solution Architecture

![SWorm Development Architecture](./docs/assets/architecture.png)

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Yarn or npm

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:3000

### Contract Setup

```bash
cd contract
# Setup instructions will be added soon
```

## 📊 Business Model

SWorm operates on a freemium model:

**Free Tier:**

- Basic yield farming strategies
- Limited cross-chain actions
- Core analytics

**Pro Subscription:**

- Sponsored transactions (gas covered)
- Advanced AI features and recommendations
- +0.3% APY boost on qualifying pools
- Priority support

All transactions include a small service fee to support platform development.

## 🔧 Tech Stack

- **Frontend:** Next.js, React, TailwindCSS
- **Smart Contracts:** Move
- **Cross-Chain:** Wormhole Protocol
- **Data & Analytics:** GraphQL, CoinGecko, GeckoTerminal
- **AI:** Deepseek AI

## 🛣️ Roadmap (Using Phases instead of Time)

- **Phase 1:** Beta launch with core features @ SUI HackerHouse
- **Phase 2:** Advanced analytics and AI recommendations ( Provide More insights for the Users )
- **Phase 3:** Mobile app and expanded chain support ( For Good UX and Further Reach )
- **Phase 4:** DAO governance ( Let the Community Decide the direction )
- **Phase 5:** Token launch ( TGE! )

![SWorm Development Roadmap](./docs/assets/roadmap.png)

*Our phased approach to building a comprehensive cross-chain DeFi yield optimizer*

## Deployed Contract

- **Contract Address:** 0x053cb94ecf6b1ef428ece53b82a3de900330b7fe11a96c6518b5f938a6c772e6
- **Explorer:** [Sui Explorer](https://suiscan.xyz/testnet/object/0x053cb94ecf6b1ef428ece53b82a3de900330b7fe11a96c6518b5f938a6c772e6/contracts)