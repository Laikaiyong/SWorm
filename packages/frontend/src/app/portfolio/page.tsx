'use client'

import { useEffect, useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Moon, Sun } from 'lucide-react'
import { marked } from 'marked'

// Type definitions
interface TokenData {
  symbol: string
  amount: number
  valueUSD: number
  price: number
  priceChange24h: number
  logoUrl?: string
}

// Add these new interfaces to your type definitions section
interface CoinObject {
  coinType: string
  coinName: string
  coinDenom: string
  decimals: number
  coinSymbol: string
  objectType: string
  objectsCount: number
  totalBalance: number
  coinPrice: number
  imgUrl: string
  securityMessage?: string
  bridged: boolean
  verified: boolean
}

interface BaseObject {
  objectType: string
  objectsCount: number
  type: string
  id: string
  name: string
  imgUrl: string
  securityMessage?: string
  amount: number
}

interface NFTObject extends BaseObject {}
interface DomainObject extends BaseObject {}
interface UnknownObject extends BaseObject {}

interface KioskObject {
  objectType: string
  subType: string
  type: string
  name: string
  ownerAddress: string
  latestTx: string
  balance: number
  id: string
  version: number
  objectsCount: number
  imgUrl: string
}

interface BlockberryObjectsResponse {
  coins: CoinObject[]
  nfts: NFTObject[]
  domains: DomainObject[]
  unknowns: UnknownObject[]
  kiosks: KioskObject[]
}

interface HistoricalData {
  date: string
  value: number
}

interface PortfolioData {
  tokens: TokenData[]
  netWorth: number
  historicalData: HistoricalData[]
  allocationPercentages: { symbol: string; percentage: number }[]
}

interface RiskAssessment {
  level: 'Low' | 'Medium' | 'High'
  description: string
}

interface AIInsights {
  summary: string
  recommendations: string[]
  riskAssessment: RiskAssessment
  rebalancingStrategy?: string
}

// Add CoinBalance interface for API response type
interface CoinBalance {
  coinType: string
  coinName: string
  coinSymbol: string
  balance: number
  balanceUsd: number
  decimals: number
  coinPrice: number
}
// Type definitions
interface TokenData {
  symbol: string
  amount: number
  valueUSD: number
  price: number
  priceChange24h: number
  logoUrl?: string
}

interface HistoricalData {
  date: string
  value: number
}

interface PortfolioData {
  tokens: TokenData[]
  netWorth: number
  historicalData: HistoricalData[]
  allocationPercentages: { symbol: string; percentage: number }[]
}

interface RiskAssessment {
  level: 'Low' | 'Medium' | 'High'
  description: string
}

interface AIInsights {
  summary: string
  recommendations: string[]
  riskAssessment: RiskAssessment
}

interface Quest {
  id: string
  title: string
  description: string
  reward: string
  completed: boolean
  progress?: number
}

// Add these new interfaces after the existing interfaces
interface ObjectData {
  objectId: string
  type: string
  hasPublicTransfer: boolean
  owner: string
  content: any
  digest: string
}

interface ObjectsResponse {
  objects: ObjectData[]
  nextCursor?: string
}

const MagicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-wand"
  >
    <path d="M15 4V2" />
    <path d="M15 16v-2" />
    <path d="M8 9h2" />
    <path d="M20 9h2" />
    <path d="M17.8 11.8 19 13" />
    <path d="M15 9h0" />
    <path d="M17.8 6.2 19 5" />
    <path d="m3 21 9-9" />
    <path d="M12.2 6.2 11 5" />
  </svg>
)

export default function PortfolioPage() {
  const account = useCurrentAccount()
  const userAddress = account?.address

  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 3,
    currentXP: 230,
    requiredXP: 500,
    title: 'DeFi Apprentice',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<
    '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y'
  >('1W')
  const [apiAddress, setApiAddress] = useState<string>('default')
  const [customAddress, setCustomAddress] = useState<string>(
    '0x4cf712f1fed7152d5ebaa108fb39f16f5a0fd748cf0a28908ab96a11b8ca07a2'
  )

  // Add this new state variable inside the PortfolioPage component
  const [objects, setObjects] = useState<ObjectData[]>([])
  const [objectsData, setObjectsData] =
    useState<BlockberryObjectsResponse | null>(null)
  const [objectsLoading, setObjectsLoading] = useState(false)
  const [objectsError, setObjectsError] = useState<string | null>(null)
  const [showAllNFTs, setShowAllNFTs] = useState(false)
  const [showAllCoins, setShowAllCoins] = useState(false)

  // Sample quests data - In a real app, this would come from your backend
  useEffect(() => {
    // This would be fetched from your backend in a real app
    setQuests([
      {
        id: 'bridge-eth',
        title: '🌉 Bridge from Ethereum',
        description: 'Transfer any asset from Ethereum to Sui network',
        reward: '25 XP + 5% APY boost on sUSDC',
        completed: false,
        xp: 25,
        difficulty: 'Easy',
        category: 'DeFi',
      },
      {
        id: 'stake-susd',
        title: '💸 Stake sUSDC',
        description: 'Stake at least 100 sUSDC tokens',
        reward: '30 XP + 0.5% cashback on next swap',
        completed: true,
        xp: 30,
        difficulty: 'Easy',
        category: 'DeFi',
      },
      {
        id: 'lp-contribute',
        title: '🔁 Contribute to LP',
        description: 'Add liquidity to any trading pair',
        reward: '50 XP + DeFi Champion NFT',
        completed: false,
        progress: 0.4,
        xp: 50,
        difficulty: 'Medium',
        category: 'DeFi',
      },
      {
        id: 'nft-badge',
        title: '🏅 Get NFT Badge',
        description: 'Complete first 3 quests to earn the exclusive NFT',
        reward: '100 XP + Early access to new features',
        completed: false,
        xp: 100,
        difficulty: 'Medium',
        category: 'NFT',
      },
      {
        id: 'defi-quiz',
        title: '🧠 Complete DeFi Knowledge Quiz',
        description: 'Test your DeFi knowledge and learn more',
        reward: '20 XP + Risk protection feature',
        completed: false,
        xp: 20,
        difficulty: 'Easy',
        category: 'DeFi',
      },
      {
        id: 'risk-protection',
        title: '🛡️ Enable Portfolio Risk Protection',
        description: 'Set up automated safety protocols for your assets',
        reward: '30 XP + Insurance on up to $1000 of assets',
        completed: false,
        xp: 30,
        difficulty: 'Easy',
        category: 'DeFi',
      },
      {
        id: 'trade-volume',
        title: '💹 Trading Master',
        description: 'Achieve $1000 in trading volume on Sui DEXes',
        reward: '120 XP + Limited Trading Badge',
        completed: false,
        progress: 0.15,
        xp: 120,
        difficulty: 'Hard',
        category: 'Trading',
      },
      {
        id: 'governance-vote',
        title: '🗳️ Governance Participation',
        description: 'Cast your first vote in a Sui ecosystem proposal',
        reward: '75 XP + Governance Token Airdrop',
        completed: false,
        xp: 75,
        difficulty: 'Medium',
        category: 'Governance',
      },
    ])
  }, [])

  function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-900 text-green-200'
      case 'Medium':
        return 'bg-yellow-900 text-yellow-200'
      case 'Hard':
        return 'bg-orange-900 text-orange-200'
      case 'Epic':
        return 'bg-purple-900 text-purple-200'
      default:
        return 'bg-blue-900 text-blue-200'
    }
  }

  // Function to get category icon
  function getCategoryIcon(category: string): string {
    switch (category) {
      case 'DeFi':
        return '💰'
      case 'NFT':
        return '🖼️'
      case 'Social':
        return '👥'
      case 'Trading':
        return '📊'
      case 'Governance':
        return '🏛️'
      default:
        return '🔮'
    }
  }

  // Enhanced function to get AI insights with DeFi recommendations
  async function getAIInsights(
    tokenData: TokenData[],
    netWorth: number,
    timeRange: string,
    allocationPercentages: { symbol: string; percentage: number }[]
  ) {
    try {
      // Prepare the prompt for Groq with specific focus on DeFi opportunities
      const prompt = `
Analyze this cryptocurrency portfolio and provide detailed DeFi optimization insights:

Net Worth: $${netWorth.toFixed(2)}
Time Range: ${timeRange}

Tokens:
${tokenData.map((t) => `${t.symbol}: ${t.amount} tokens, $${t.valueUSD.toFixed(2)}, 24h change: ${t.priceChange24h.toFixed(2)}%`).join('\n')}

Allocation:
${allocationPercentages.map((a) => `${a.symbol}: ${a.percentage.toFixed(1)}%`).join('\n')}

Please provide:
1. A concise summary of the portfolio performance and diversification
2. 3-5 specific DeFi opportunities for these tokens, including:
   - Staking options with APY estimates
   - Liquidity pool opportunities with potential rewards
   - Lending platforms and potential yields
   - Any unique DeFi features available for these specific tokens
3. A risk assessment (Low, Medium, or High) with explanation

Format the response as JSON with the following structure:
{
  "summary": "...",
  "recommendations": ["...", "...", "..."],
  "riskAssessment": {
    "level": "Low|Medium|High",
    "description": "..."
  }
}
`

      // Call the Groq API
      const groqResponse = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API}`,
          },
          body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [
              {
                role: 'system',
                content:
                  'You are a DeFi specialist who provides expert analysis on cryptocurrency portfolios. Focus on actionable DeFi opportunities including staking, liquidity pools, and lending platforms. Be specific about platforms, potential yields, and risks.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.2,
            max_tokens: 1000,
          }),
        }
      )

      if (!groqResponse.ok) {
        throw new Error(`Groq API error: ${groqResponse.status}`)
      }

      const groqData = await groqResponse.json()
      const content = groqData.choices[0].message.content

      // Parse the JSON response from Groq
      try {
        const insights = JSON.parse(content)
        setAiInsights(insights)
      } catch (parseErr) {
        console.error('Error parsing Groq response:', parseErr)
        // Fallback to default insights if parsing fails
        setAiInsights({
          summary:
            'Your portfolio contains a mix of assets with varying risk profiles. Consider reviewing your allocation strategy for better diversification.',
          recommendations: [
            'Consider staking your SUI tokens on platforms like Validator.app for approximately 3-4% APY',
            'Explore liquidity pools on SuiSwap to earn trading fees, potential returns of 5-15% APY',
            'Look into lending your stablecoins on Scallop for steady yield',
            'Diversify your portfolio with more blue-chip assets to reduce risk',
          ],
          riskAssessment: {
            level: 'Medium',
            description:
              'Your portfolio has a moderate risk profile based on current allocations and market conditions.',
          },
        })
      }
    } catch (aiErr) {
      console.error('Error fetching AI insights:', aiErr)
      // Set default AI insights if the API fails
      setAiInsights({
        summary: 'Unable to generate portfolio insights at this time.',
        recommendations: [
          'Check back later for personalized DeFi recommendations.',
        ],
        riskAssessment: {
          level: 'Medium',
          description: 'Risk assessment unavailable',
        },
      })
    }
  }

  async function fetchPortfolio() {
    setLoading(true)
    setError(null)
    try {
      const addressToUse = apiAddress === 'custom' ? customAddress : userAddress

      // Get account stats
      let blockberryData = null
      try {
        const statsUrl = `/api/blockberry/stats?address=${addressToUse}`
        const blockberryRes = await fetch(statsUrl)

        if (blockberryRes.ok) {
          blockberryData = await blockberryRes.json()
        } else {
          console.error(`API error: ${blockberryRes.status}`)
          setError(
            'Failed to load account stats. Other data will still be displayed.'
          )
        }
      } catch (statsErr) {
        console.error('Error fetching stats:', statsErr)
        setError(
          'Failed to load account stats. Other data will still be displayed.'
        )
      }

      // Get balance data - this contains more detailed token information
      let tokenData: TokenData[] = []
      let netWorth = 0

      try {
        const balanceUrl = `/api/blockberry/balance?address=${addressToUse}`
        const balanceRes = await fetch(balanceUrl)

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json()

          // Process token data with price information already included in Blockberry response
          tokenData = balanceData.map((token: CoinBalance) => ({
            symbol: token.coinSymbol,
            amount: token.balance,
            valueUSD: token.balanceUsd,
            price: token.coinPrice,
            priceChange24h: 0, // We'll need to fetch this separately or add to the API
            logoUrl: `/coins/${token.coinSymbol.toLowerCase()}.png`,
          }))

          // Calculate net worth directly from Blockberry data or token sums
          netWorth =
            blockberryData?.balance ||
            tokenData.reduce((sum, token) => sum + token.valueUSD, 0)
        } else {
          console.error(`API error for balance: ${balanceRes.status}`)
          setError((prev) =>
            prev
              ? `${prev}\nFailed to load token data.`
              : 'Failed to load token data. Other data will still be displayed.'
          )

          // Create dummy data if we couldn't get real data
          tokenData = [
            {
              symbol: 'SUI',
              amount: 0,
              valueUSD: 0,
              price: 0,
              priceChange24h: 0,
              logoUrl: '/coins/sui.png',
            },
          ]
        }
      } catch (balanceErr) {
        console.error('Error fetching balance:', balanceErr)
        setError((prev) =>
          prev
            ? `${prev}\nFailed to load token data.`
            : 'Failed to load token data. Other data will still be displayed.'
        )

        // Create dummy data if we couldn't get real data
        tokenData = [
          {
            symbol: 'SUI',
            amount: 0,
            valueUSD: 0,
            price: 0,
            priceChange24h: 0,
            logoUrl: '/coins/sui.png',
          },
        ]
      }

      // Calculate allocation percentages
      const allocationPercentages = tokenData.map((token) => ({
        symbol: token.symbol,
        percentage: netWorth > 0 ? (token.valueUSD / netWorth) * 100 : 0,
      }))

      // Generate historical data - either fetch from API or use mock data
      let historicalData = [] as HistoricalData[]
      try {
        // You would implement this API endpoint to get historical data
        const historyUrl = `/api/portfolio/history?address=${addressToUse}&timeRange=${timeRange}`
        const historyRes = await fetch(historyUrl)
        if (historyRes.ok) {
          historicalData = await historyRes.json()
        } else {
          console.log('History API returned an error, using mock data')
          historicalData = generateMockHistoricalData(timeRange, netWorth)
        }
      } catch (err) {
        console.error('Error fetching historical data:', err)
        historicalData = generateMockHistoricalData(timeRange, netWorth)
      }

      setPortfolio({
        tokens: tokenData,
        netWorth,
        historicalData,
        allocationPercentages,
      })

      // Only call AI insights if we have some basic data
      if (tokenData.length > 0) {
        try {
          await getEnhancedAIInsights(
            tokenData,
            netWorth,
            timeRange,
            allocationPercentages,
            blockberryData
          )
        } catch (aiErr) {
          console.error('Error generating AI insights:', aiErr)
        }
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err)
      setError('Failed to load portfolio data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Update the fetchObjects function to handle failures more gracefully
  async function fetchObjects() {
    setObjectsLoading(true)
    setObjectsError(null)
    try {
      const addressToUse = apiAddress === 'custom' ? customAddress : userAddress
      const objectsUrl = `/api/blockberry/objects?address=${addressToUse}`

      const objectsRes = await fetch(objectsUrl)

      if (!objectsRes.ok) {
        throw new Error(`API error: ${objectsRes.status}`)
      }

      const data: BlockberryObjectsResponse = await objectsRes.json()
      setObjectsData(data)
    } catch (err) {
      console.error('Error fetching objects:', err)
      setObjectsError(
        'Failed to load objects data. Some content may be unavailable.'
      )

      // Set empty data structure so UI doesn't break
      setObjectsData({
        coins: [],
        nfts: [],
        domains: [],
        unknowns: [],
        kiosks: [],
      })
    } finally {
      setObjectsLoading(false)
    }
  }

  // Enhanced AI analysis function
  async function getEnhancedAIInsights(
    tokenData: TokenData[],
    netWorth: number,
    timeRange: string,
    allocationPercentages: { symbol: string; percentage: number }[],
    blockberryData: any
  ) {
    try {
      // Get more comprehensive blockchain data for better AI analysis
      const addressToUse = apiAddress === 'custom' ? customAddress : userAddress

      // Calculate additional metrics
      const diversificationScore = calculateDiversificationScore(
        allocationPercentages
      )
      const portfolioTurnover =
        objects.length > 0 ? objects.length / tokenData.length : 0
      const uniqueAssetTypes = new Set(
        objects.map((obj) => getObjectTypeName(obj.type))
      ).size

      // Prepare the prompt with much more detailed information
      const prompt = `
  Analyze this Sui blockchain portfolio and provide detailed DeFi optimization insights:
  
  Net Worth: $${netWorth.toFixed(2)}
  Time Range: ${timeRange}
  Asset Diversification Score: ${diversificationScore.toFixed(2)}/10
  Tokens Count: ${tokenData.length}
  NFTs Count: ${blockberryData.nftsCount || 0}
  On-chain Objects: ${objects.length}
  Unique Asset Types: ${uniqueAssetTypes}
  Kiosks Count: ${blockberryData.kiosksCount || 0}
  
  Token Holdings:
  ${tokenData.map((t) => `${t.symbol}: ${t.amount} tokens, $${t.valueUSD.toFixed(2)}, ${t.priceChange24h ? t.priceChange24h.toFixed(2) + '%' : 'N/A'}`).join('\n')}
  
  Allocation:
  ${allocationPercentages.map((a) => `${a.symbol}: ${a.percentage.toFixed(1)}%`).join('\n')}
  
  Based on this Sui wallet profile, please provide:
  1. A detailed assessment of the portfolio's composition, strengths, and vulnerabilities
  2. 3-5 specific DeFi opportunities on Sui network, considering:
     - Staking options with expected APY values
     - Liquidity pools on SuiSwap or other Sui DEXes with potential rewards
     - Lending opportunities on Scallop or other Sui lending protocols
     - NFT opportunities if the wallet holds significant NFTs
     - Smart contract interaction strategies based on the wallet's on-chain object types
  3. Risk assessment (Low, Medium, or High) with detailed justification
  4. A recommended portfolio rebalancing strategy to optimize returns while minimizing risk
  
  Format the response as JSON with the following structure:
  {
    "summary": "...",
    "recommendations": ["...", "...", "..."],
    "riskAssessment": {
      "level": "Low|Medium|High",
      "description": "..."
    },
    "rebalancingStrategy": "..."
  }
  `

      // Call the Groq API with the enhanced prompt
      const groqResponse = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API}`,
          },
          body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [
              {
                role: 'system',
                content:
                  'You are a Sui blockchain DeFi specialist who provides expert analysis on cryptocurrency portfolios. Focus on actionable DeFi opportunities specific to the Sui ecosystem including staking, liquidity pools on SuiSwap, lending on Scallop, NFT strategies, and custom object interactions. Include numerical APY estimates and risk ratings.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.2,
            max_tokens: 1500,
          }),
        }
      )

      if (!groqResponse.ok) {
        throw new Error(`Groq API error: ${groqResponse.status}`)
      }

      const groqData = await groqResponse.json()
      const content = groqData.choices[0].message.content

      // Parse the JSON response from Groq
      try {
        const insights = JSON.parse(content)
        setAiInsights({
          ...insights,
          // Ensure we have the correct structure even if some fields are missing
          summary: insights.summary || 'Portfolio analysis unavailable',
          recommendations: insights.recommendations || [],
          riskAssessment: insights.riskAssessment || {
            level: 'Medium',
            description: 'Risk assessment unavailable',
          },
        })
      } catch (parseErr) {
        console.error('Error parsing Groq response:', parseErr)
        // Fallback to default insights
        setDefaultAiInsights()
      }
    } catch (aiErr) {
      console.error('Error fetching AI insights:', aiErr)
      setDefaultAiInsights()
    }
  }

  // Helper function to set default AI insights
  function setDefaultAiInsights() {
    setAiInsights({
      summary:
        'Your portfolio contains a mix of Sui ecosystem assets. Further analysis is currently unavailable.',
      recommendations: [
        'Consider staking your SUI tokens on platforms like Validator.app for approximately 3-4% APY',
        'Explore liquidity pools on SuiSwap to earn trading fees',
        'Look into lending your stablecoins on Scallop for steady yield',
      ],
      riskAssessment: {
        level: 'Medium',
        description:
          'Your portfolio has a moderate risk profile based on current allocations.',
      },
      rebalancingStrategy:
        'Focus on increasing SUI ecosystem bluechip assets for stability.',
    })
  }

  // Add this function to calculate overall asset type allocation
  function calculateAssetTypeAllocation() {
    if (!objectsData) return []

    const totalNFTValue = estimateNFTValue() // You would implement this
    const totalCoinsValue = portfolio?.netWorth || 0
    const totalDomainValue = estimateDomainValue() // You would implement this
    const totalKioskValue = objectsData.kiosks.reduce(
      (sum, kiosk) => sum + kiosk.balance,
      0
    )

    const total =
      totalNFTValue + totalCoinsValue + totalDomainValue + totalKioskValue

    return [
      {
        type: 'Tokens',
        value: totalCoinsValue,
        percentage: (totalCoinsValue / total) * 100,
      },
      {
        type: 'NFTs',
        value: totalNFTValue,
        percentage: (totalNFTValue / total) * 100,
      },
      {
        type: 'Domains',
        value: totalDomainValue,
        percentage: (totalDomainValue / total) * 100,
      },
      {
        type: 'Kiosks',
        value: totalKioskValue,
        percentage: (totalKioskValue / total) * 100,
      },
    ].filter((item) => item.value > 0)
  }

  // Simple function to estimate NFT value (this would be improved with real data)
  function estimateNFTValue() {
    return (
      objectsData?.nfts.reduce((sum, nft) => sum + (nft.amount || 0), 0) || 0
    )
  }

  // Simple function to estimate domain value (this would be improved with real data)
  function estimateDomainValue() {
    return objectsData?.domains.length * 5 || 0 // Rough estimate of $5 per domain
  }

  // Add this pie chart to your component to visualize asset type allocation
  function renderAssetTypePieChart() {
    const assetAllocation = calculateAssetTypeAllocation()
    if (assetAllocation.length === 0) return null

    const totalPercentage = assetAllocation.reduce(
      (sum, asset) => sum + asset.percentage,
      0
    )
    let startAngle = 0

    // Colors for different asset types
    const colors = {
      Tokens: '#3b82f6', // blue
      NFTs: '#8b5cf6', // purple
      Domains: '#ec4899', // pink
      Kiosks: '#f59e0b', // amber
    }

    return (
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-medium text-gray-300">
          Asset Type Allocation
        </h3>
        <div className="flex items-center">
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 100 100">
              {assetAllocation.map((asset, index) => {
                const percentage = asset.percentage
                const angle = (percentage / 100) * 360
                const endAngle = startAngle + angle

                // Calculate the SVG arc path
                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
                const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)

                // Determine if the arc should be drawn as a large arc
                const largeArcFlag = angle > 180 ? 1 : 0

                // Create the path
                const path = `
                  M 50 50
                  L ${x1} ${y1}
                  A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
                  Z
                `

                // Update start angle for next segment
                startAngle += angle

                return (
                  <path
                    key={asset.type}
                    d={path}
                    fill={
                      colors[asset.type as keyof typeof colors] || '#6b7280'
                    }
                  />
                )
              })}
            </svg>
          </div>

          <div className="ml-4 flex-1">
            {assetAllocation.map((asset) => (
              <div
                key={asset.type}
                className="mb-1 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div
                    className="mr-2 h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor:
                        colors[asset.type as keyof typeof colors] || '#6b7280',
                    }}
                  ></div>
                  <span className="text-sm">{asset.type}</span>
                </div>
                <span className="text-sm font-medium">
                  {asset.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Update the useEffect to also call fetchObjects
  useEffect(() => {
    if (!userAddress) return
    fetchPortfolio()
    fetchObjects()
  }, [userAddress, timeRange, apiAddress, customAddress])

  // Generate mock historical data for demo purposes
  function generateMockHistoricalData(
    range: string,
    currentValue: number
  ): HistoricalData[] {
    const data: HistoricalData[] = []
    let days: number

    switch (range) {
      case '1D':
        days = 1
        break
      case '1W':
        days = 7
        break
      case '1M':
        days = 30
        break
      case '3M':
        days = 90
        break
      case '1Y':
        days = 365
        break
      case 'YTD':
        days = Math.floor(
          (new Date().getTime() -
            new Date(new Date().getFullYear(), 0, 1).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        break
      default:
        days = 7
    }

    const volatility = 0.03 // 3% daily volatility for mock data
    let value = currentValue

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Random walk with mean reversion to create somewhat realistic price action
      if (i < days) {
        const randomChange = (Math.random() - 0.5) * volatility * value
        // Mean reversion - pull back toward currentValue
        const meanReversion = (currentValue - value) * 0.05
        value = value + randomChange + meanReversion
      }

      data.push({
        date: date.toISOString().split('T')[0],
        value: Number.parseFloat(value.toFixed(2)),
      })
    }

    return data
  }

  function getRiskColor(level: string): string {
    switch (level) {
      case 'Low':
        return 'text-green-400'
      case 'Medium':
        return 'text-yellow-300'
      case 'High':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  // Calculate portfolio performance metrics
  const portfolioMetrics = portfolio
    ? {
        dayChange: (
          ((portfolio.historicalData[portfolio.historicalData.length - 1]
            .value -
            portfolio.historicalData[portfolio.historicalData.length - 2]
              .value) /
            portfolio.historicalData[portfolio.historicalData.length - 2]
              .value) *
          100
        ).toFixed(2),
        totalReturn: (
          ((portfolio.historicalData[portfolio.historicalData.length - 1]
            .value -
            portfolio.historicalData[0].value) /
            portfolio.historicalData[0].value) *
          100
        ).toFixed(2),
      }
    : { dayChange: '0.00', totalReturn: '0.00' }

  // Simple SVG chart renderer using the historical data
  function renderSimpleChart() {
    if (!portfolio?.historicalData || portfolio.historicalData.length < 2)
      return null

    const data = portfolio.historicalData
    const width = 800
    const height = 200
    const padding = 40

    // Find min and max values for scaling
    const values = data.map((d) => d.value)
    const minValue = Math.min(...values) * 0.95 // Add some padding
    const maxValue = Math.max(...values) * 1.05
    const valueRange = maxValue - minValue

    // Create path for the line
    let path = ''
    data.forEach((point, i) => {
      // Scale X to fit width with padding
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding)

      // Scale Y to fit height (inverted, since SVG Y grows downward)
      const y =
        height -
        padding -
        ((point.value - minValue) / valueRange) * (height - 2 * padding)

      if (i === 0) {
        path += `M ${x} ${y}`
      } else {
        path += ` L ${x} ${y}`
      }
    })

    // Generate X axis labels (dates)
    const xLabels = []
    if (data.length > 0) {
      // Just show a few labels to avoid overcrowding
      const step = Math.max(1, Math.floor(data.length / 5))
      for (let i = 0; i < data.length; i += step) {
        const x = padding + (i / (data.length - 1)) * (width - 2 * padding)
        let label = data[i].date

        // Format label based on time range
        if (timeRange === '1D') {
          label = label.split(' ')[1] // Show only time for 1D
        } else {
          // Just show month and day
          const parts = label.split('-')
          if (parts.length >= 3) {
            label = `${parts[1]}/${parts[2]}`
          }
        }

        xLabels.push({ x, label })
      }
    }

    // Generate Y axis labels (values)
    const yLabels = []
    const yLabelCount = 5
    for (let i = 0; i < yLabelCount; i++) {
      const value = minValue + (i / (yLabelCount - 1)) * valueRange
      const y =
        height - padding - (i / (yLabelCount - 1)) * (height - 2 * padding)
      yLabels.push({
        y,
        label: `${value.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
      })
    }

    // Set dark theme colors
    const axisColor = '#4b5563'
    const gridColor = '#374151'
    const textColor = '#9ca3af'
    const lineColor = '#60a5fa'

    return (
      <svg
        width="100%"
        height="250"
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4"
      >
        {/* X and Y axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke={axisColor}
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke={axisColor}
          strokeWidth="1"
        />

        {/* Grid lines */}
        {yLabels.map((label, i) => (
          <line
            key={`grid-${i}`}
            x1={padding}
            y1={label.y}
            x2={width - padding}
            y2={label.y}
            stroke={gridColor}
            strokeWidth="1"
          />
        ))}

        {/* Data line */}
        <path d={path} fill="none" stroke={lineColor} strokeWidth="2" />

        {/* X axis labels */}
        {xLabels.map((label, i) => (
          <text
            key={`x-${i}`}
            x={label.x}
            y={height - padding / 2}
            textAnchor="middle"
            fontSize="10"
            fill={textColor}
          >
            {label.label}
          </text>
        ))}

        {/* Y axis labels */}
        {yLabels.map((label, i) => (
          <text
            key={`y-${i}`}
            x={padding - 5}
            y={label.y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="10"
            fill={textColor}
          >
            {label.label}
          </text>
        ))}
      </svg>
    )
  }

  // Add this function to get a shortened version of the object ID
  function shortenObjectId(id: string): string {
    if (!id) return ''
    return id.length > 12
      ? `${id.substring(0, 6)}...${id.substring(id.length - 6)}`
      : id
  }

  // Add this function to determine the object type display name
  function getObjectTypeName(type: string): string {
    // Extract the last part of the type path
    const parts = type.split('::')
    if (parts.length >= 3) {
      return parts[2] // Return just the type name
    }
    return type
  }

  return (
    <div className="mx-auto min-h-screen w-screen space-y-8 bg-gray-900 p-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📊 Your DeFi Portfolio</h1>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium">API Address:</div>
          <div className="flex items-center">
            <button
              onClick={() => setApiAddress('default')}
              className={`mr-2 rounded-md px-3 py-1 text-sm ${
                apiAddress === 'default'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              My Address
            </button>
            <button
              onClick={() => setApiAddress('custom')}
              className={`rounded-md px-3 py-1 text-sm ${
                apiAddress === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              Custom Address
            </button>
          </div>
        </div>
        {apiAddress === 'custom' && (
          <div className="flex max-w-md items-center space-x-2">
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
              placeholder="Enter custom address"
            />
            <button
              onClick={() => {
                fetchPortfolio()
                fetchObjects()
              }}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            >
              Load
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-900 p-4 text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-400"></div>
        </div>
      ) : (
        <>
          {portfolio && objectsData && (
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">
                📊 Portfolio Composition
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-300">
                    Token Allocation
                  </h3>
                  {portfolio.allocationPercentages.map((allocation) => (
                    <div key={allocation.symbol} className="mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{allocation.symbol}</span>
                        <span>{allocation.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-700">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${allocation.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>{renderAssetTypePieChart()}</div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <div className="text-sm text-gray-400">Token Types</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {objectsData.coins.length}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <div className="text-sm text-gray-400">NFT Collections</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {objectsData.nfts.length}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <div className="text-sm text-gray-400">Domains</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {objectsData.domains.length}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <div className="text-sm text-gray-400">Kiosks</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {objectsData.kiosks.length}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Objects Section */}
          {objects.length > 0 && (
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">On-chain Objects</h2>
                <span className="rounded bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-200">
                  {objects.length} Objects
                </span>
              </div>

              {objectsError && (
                <div className="mb-4 rounded-xl border border-red-800 bg-red-900 p-4 text-red-200">
                  {objectsError}
                </div>
              )}

              {objectsLoading ? (
                <div className="flex h-20 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-400"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                            Object ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                            Type
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-400">
                            Transferable
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {(showAllObjects ? objects : objects.slice(0, 5)).map(
                          (object) => (
                            <tr key={object.objectId}>
                              <td className="whitespace-nowrap px-4 py-4">
                                <div className="flex items-center">
                                  <span className="font-mono text-sm">
                                    {shortenObjectId(object.objectId)}
                                  </span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4 py-4">
                                <span className="text-sm">
                                  {getObjectTypeName(object.type)}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-center">
                                {object.hasPublicTransfer ? (
                                  <span className="inline-flex items-center rounded-full bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-200">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                                    No
                                  </span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-right">
                                <a
                                  href={`https://explorer.sui.io/object/${object.objectId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                  View
                                </a>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {objects.length > 5 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setShowAllObjects(!showAllObjects)}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300"
                      >
                        {showAllObjects
                          ? 'Show Less'
                          : `Show All (${objects.length})`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {objectsData && (
            <>
              {/* NFTs Section */}
              {objectsData.nfts && objectsData.nfts.length > 0 && (
                <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800 p-6 shadow">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      🖼️ NFT Collections
                    </h2>
                    <span className="rounded bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-200">
                      {objectsData.nfts.reduce(
                        (sum, nft) => sum + nft.objectsCount,
                        0
                      )}{' '}
                      NFTs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {(showAllNFTs
                      ? objectsData.nfts
                      : objectsData.nfts.slice(0, 8)
                    ).map((nft) => (
                      <div
                        key={nft.id}
                        className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900"
                      >
                        {nft.imgUrl ? (
                          <img
                            src={nft.imgUrl}
                            alt={nft.name}
                            className="h-40 w-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src =
                                '/placeholder-nft.png'
                            }}
                          />
                        ) : (
                          <div className="flex h-40 w-full items-center justify-center bg-gray-800">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}
                        <div className="p-3">
                          <h3 className="truncate text-sm font-medium">
                            {nft.name || 'Unnamed NFT'}
                          </h3>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {nft.objectsCount} items
                            </span>
                            {nft.verified && (
                              <span className="inline-flex items-center rounded-full bg-green-900 px-2 py-0.5 text-xs font-medium text-green-200">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {objectsData.nfts.length > 8 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setShowAllNFTs(!showAllNFTs)}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300"
                      >
                        {showAllNFTs
                          ? 'Show Less'
                          : `Show All (${objectsData.nfts.length})`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Coins Section */}
              {objectsData.coins && objectsData.coins.length > 0 && (
                <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800 p-6 shadow">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">💰 Token Objects</h2>
                    <span className="rounded bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-200">
                      {objectsData.coins.reduce(
                        (sum, coin) => sum + coin.objectsCount,
                        0
                      )}{' '}
                      Objects
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                            Token
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                            Objects
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                            Balance
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                            Price
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {(showAllCoins
                          ? objectsData.coins
                          : objectsData.coins.slice(0, 5)
                        ).map((coin) => (
                          <tr key={coin.coinType}>
                            <td className="whitespace-nowrap px-4 py-4">
                              <div className="flex items-center">
                                {coin.imgUrl && (
                                  <img
                                    src={coin.imgUrl}
                                    alt={coin.coinSymbol}
                                    className="mr-2 h-6 w-6 rounded-full"
                                    onError={(e) => {
                                      ;(e.target as HTMLImageElement).src = ''
                                    }}
                                  />
                                )}
                                <div>
                                  <div className="font-medium">
                                    {coin.coinSymbol}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {coin.coinName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-right">
                              {coin.objectsCount}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-right">
                              {coin.totalBalance.toLocaleString('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 6,
                              })}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-right">
                              $
                              {coin.coinPrice.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 6,
                              })}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-center">
                              <div className="flex justify-center space-x-1">
                                {coin.verified && (
                                  <span className="inline-flex items-center rounded-full bg-green-900 px-2 py-0.5 text-xs font-medium text-green-200">
                                    Verified
                                  </span>
                                )}
                                {coin.bridged && (
                                  <span className="inline-flex items-center rounded-full bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-200">
                                    Bridged
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {objectsData.coins.length > 5 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setShowAllCoins(!showAllCoins)}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300"
                      >
                        {showAllCoins
                          ? 'Show Less'
                          : `Show All (${objectsData.coins.length})`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Domains Section */}
              {objectsData.domains && objectsData.domains.length > 0 && (
                <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800 p-6 shadow">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">🌐 Domain Names</h2>
                    <span className="rounded bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-200">
                      {objectsData.domains.length} Domains
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {objectsData.domains.map((domain) => (
                      <div
                        key={domain.id}
                        className="flex items-center rounded-lg border border-gray-700 bg-gray-900 p-3"
                      >
                        <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-800">
                          <span className="text-lg">🌐</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{domain.name}</p>
                          <p className="truncate text-xs text-gray-400">
                            {domain.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kiosks Section */}
              {objectsData.kiosks && objectsData.kiosks.length > 0 && (
                <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800 p-6 shadow">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">🏪 Kiosks</h2>
                    <span className="rounded bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-200">
                      {objectsData.kiosks.length} Kiosks
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {objectsData.kiosks.map((kiosk) => (
                      <div
                        key={kiosk.id}
                        className="rounded-lg border border-gray-700 bg-gray-900 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-medium">
                            {kiosk.name || `Kiosk ${shortenObjectId(kiosk.id)}`}
                          </h3>
                          <span className="rounded bg-purple-900 px-2 py-0.5 text-xs font-medium text-purple-200">
                            {kiosk.objectsCount} Items
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Type:</span>{' '}
                            {kiosk.type}
                          </div>
                          <div>
                            <span className="text-gray-400">Balance:</span>{' '}
                            {kiosk.balance.toLocaleString()} SUI
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-400">ID:</span>{' '}
                            <span className="font-mono text-xs">
                              {shortenObjectId(kiosk.id)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <a
                            href={`https://explorer.sui.io/object/${kiosk.id}?network=mainnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            View in Explorer →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {/* AI DeFi Optimization Section */}
          {aiInsights && (
            <div className="rounded-lg border border-blue-700/30 bg-gradient-to-br from-blue-900/30 to-purple-900/30 shadow-sm">
              <div className="flex flex-row items-center gap-2 space-y-0 border-b border-blue-700/30 p-4">
                <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                  <MagicIcon />
                </div>
                <div>
                  <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-lg font-semibold text-transparent">
                    AI Analysis
                  </h2>
                  <p className="text-sm text-gray-400">Powered by LLAMA AI</p>
                </div>
              </div>
              <div className="p-4">
                <div className="prose prose-sm prose-invert max-w-none">
                  {aiInsights ? (
                    <div
                      className="whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(
                          `## Portfolio Analysis
          ${aiInsights.summary}
          
          ## DeFi Opportunities
          ${aiInsights.recommendations.map((rec: string) => `- ${rec}`).join('\n')}
          
          ## Risk Assessment
          **Level: ${aiInsights.riskAssessment.level}**
          
          ${aiInsights.riskAssessment.description}
          ${aiInsights.rebalancingStrategy ? `\n## Rebalancing Strategy\n${aiInsights.rebalancingStrategy}` : ''}`
                        ) as string,
                      }}
                    />
                  ) : (
                    <div className="h-24 w-full animate-pulse rounded bg-gray-700"></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {aiInsights && aiInsights.rebalancingStrategy && (
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">
                🔄 Portfolio Rebalancing Strategy
              </h2>
              <div className="mb-4">
                <p className="text-gray-300">
                  {aiInsights.rebalancingStrategy}
                </p>
              </div>

              {/* Visualization of current vs recommended allocation */}
              <div className="mt-6">
                <h3 className="mb-3 font-medium">
                  Current vs Recommended Allocation
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-300">
                      Current
                    </h4>
                    {portfolio.allocationPercentages.map((allocation) => (
                      <div
                        key={`current-${allocation.symbol}`}
                        className="mb-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span>{allocation.symbol}</span>
                          <span>{allocation.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-700">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${allocation.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-300">
                      Recommended
                    </h4>
                    {/* This is a placeholder - you would calculate recommended allocations based on AI advice */}
                    {portfolio.allocationPercentages.map(
                      (allocation, index) => {
                        // This is just a simple mock calculation - replace with actual AI recommendations
                        const recommendedPercentage =
                          index === 0
                            ? allocation.percentage * 1.2
                            : index === 1
                              ? allocation.percentage * 0.8
                              : allocation.percentage

                        return (
                          <div
                            key={`recommended-${allocation.symbol}`}
                            className="mb-2"
                          >
                            <div className="flex items-center justify-between text-sm">
                              <span>{allocation.symbol}</span>
                              <span>{recommendedPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-700">
                              <div
                                className="h-full rounded-full bg-green-600"
                                style={{ width: `${recommendedPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Milestone Quests */}
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white shadow-lg">
                    {userLevel.level}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Adventure Journal</h2>
                    <div className="text-sm text-gray-400">
                      {userLevel.title}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-1 text-xs text-gray-400">
                    XP: {userLevel.currentXP}/{userLevel.requiredXP}
                  </div>
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{
                        width: `${(userLevel.currentXP / userLevel.requiredXP) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-4 text-center">
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-2">
                  <div className="font-medium">Completed</div>
                  <div className="text-xl font-bold text-green-400">
                    {quests.filter((q) => q.completed).length}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-2">
                  <div className="font-medium">In Progress</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {
                      quests.filter(
                        (q) => !q.completed && q.progress !== undefined
                      ).length
                    }
                  </div>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-2">
                  <div className="font-medium">Available</div>
                  <div className="text-xl font-bold text-blue-400">
                    {
                      quests.filter(
                        (q) => !q.completed && q.progress === undefined
                      ).length
                    }
                  </div>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-2">
                  <div className="font-medium">Total XP</div>
                  <div className="text-xl font-bold text-purple-400">
                    {quests
                      .filter((q) => q.completed)
                      .reduce((total, q) => total + q.xp, 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between border-b border-gray-700 pb-2">
              <h3 className="text-lg font-medium">Active Quests</h3>
              <div className="flex space-x-2">
                <button className="rounded-md bg-gray-700 px-3 py-1 text-xs hover:bg-gray-600">
                  All
                </button>
                <button className="rounded-md bg-gray-900 px-3 py-1 text-xs hover:bg-gray-700">
                  DeFi
                </button>
                <button className="rounded-md bg-gray-900 px-3 py-1 text-xs hover:bg-gray-700">
                  NFT
                </button>
                <button className="rounded-md bg-gray-900 px-3 py-1 text-xs hover:bg-gray-700">
                  Trading
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className={`group relative overflow-hidden rounded-xl border ${
                    quest.completed
                      ? 'border-green-700 bg-gradient-to-br from-green-900/50 to-green-800/30'
                      : quest.progress !== undefined
                        ? 'border-yellow-700/50 bg-gradient-to-br from-yellow-900/30 to-gray-800/30'
                        : 'border-gray-600 bg-gray-700/50'
                  } p-5 shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="absolute -right-5 -top-5 rotate-12 opacity-10">
                    <div className="text-7xl">
                      {getCategoryIcon(quest.category)}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          quest.completed ? 'bg-green-700' : 'bg-gray-600'
                        }`}
                      >
                        {quest.completed ? (
                          <span className="text-green-200">✓</span>
                        ) : (
                          <span>{getCategoryIcon(quest.category)}</span>
                        )}
                      </span>
                      <h3 className="font-medium">{quest.title}</h3>
                    </div>

                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}
                    >
                      {quest.difficulty}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-300">
                    {quest.description}
                  </p>

                  {quest.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-medium">
                          {Math.round(quest.progress * 100)}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-600">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${quest.progress * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm font-medium text-indigo-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="mr-1"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      {quest.xp} XP
                    </div>

                    <button
                      className={`rounded-md px-3 py-1 text-xs font-medium ${
                        quest.completed
                          ? 'bg-green-700 text-green-100 opacity-50'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {quest.completed ? 'Completed' : 'Start Quest'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
                View Past Quests
              </button>

              <button className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-blue-500 hover:to-purple-500">
                Find New Adventures
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
