'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import TVLWaterAnimation from './components/tvlWaterAnimation'
import { marked } from 'marked'

// Define token interface
interface Token {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  market_cap_rank: number
  platforms: { [key: string]: string }
}

interface Pool {
  id: string
  type: string
  attributes: {
    name: string
    address: string
    base_token_price_usd: string
    quote_token_price_usd: string
    pool_created_at: string
    reserve_in_usd: string
    fdv_usd: string
    market_cap_usd: string
    volume_usd: {
      h24?: string
      h6?: string
      h1?: string
    }
    price_change_percentage: {
      h24?: string
      h6?: string
      h1?: string
    }
  }
}

// Define bridge route interface
interface BridgeRoute {
  name: string
  image: string
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

export default function Home(): JSX.Element {
  const [showIntro, setShowIntro] = useState<boolean>(true)
  const [tokens, setTokens] = useState<Token[]>([])
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([])
  const [activeTab, setActiveTab] = useState<string>('yield')
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(5)
  const [wormholeModalOpen, setWormholeModalOpen] = useState<boolean>(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const tvlRef = useRef<HTMLDivElement | null>(null)

  const [trendingPools, setTrendingPools] = useState<Pool[]>([])
  const [newPools, setNewPools] = useState<Pool[]>([])
  const [loadingPools, setLoadingPools] = useState<boolean>(true)

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false)

  const generateAIAnalysis = async () => {
    if (tokens.length === 0 || trendingPools.length === 0) return

    setIsLoadingAnalysis(true)
    try {
      // Format token data for the AI
      const tokenData = tokens.slice(0, 10).map((token) => ({
        name: token.name,
        symbol: token.symbol,
        price: token.current_price,
        price_change_24h: token.price_change_percentage_24h,
        market_cap: token.market_cap,
      }))

      // Format pool data
      const poolData = trendingPools.slice(0, 5).map((pool) => ({
        name: pool.attributes.name,
        liquidity: parseFloat(pool.attributes.reserve_in_usd || '0'),
        volume_24h: parseFloat(pool.attributes.volume_usd?.h24 || '0'),
        price_change_24h: parseFloat(
          pool.attributes.price_change_percentage?.h24 || '0'
        ),
      }))

      // Calculate total liquidity and volume
      const totalLiquidity = poolData.reduce(
        (sum, pool) => sum + pool.liquidity,
        0
      )
      const totalVolume = poolData.reduce(
        (sum, pool) => sum + pool.volume_24h,
        0
      )

      // Count positive and negative price movements
      const positiveTokens = tokenData.filter(
        (t) => t.price_change_24h > 0
      ).length
      const marketSentiment =
        positiveTokens > tokenData.length / 2 ? 'bullish' : 'bearish'

      // Prepare the prompt for Groq
      const prompt = `
  Analyze this Sui blockchain ecosystem data and provide detailed market insights:
  
  Tokens Data:
  ${tokenData.map((t) => `${t.symbol}: $${t.price.toFixed(4)}, 24h change: ${t.price_change_24h.toFixed(2)}%, Market Cap: $${(t.market_cap / 1000000).toFixed(2)}M`).join('\n')}
  
  Top Liquidity Pools:
  ${poolData.map((p) => `${p.name}: $${p.liquidity.toLocaleString()} liquidity, $${p.volume_24h.toLocaleString()} 24h volume, ${p.price_change_24h.toFixed(2)}% price change`).join('\n')}
  
  Ecosystem Stats:
  - Total Liquidity: $${totalLiquidity.toLocaleString()}
  - Total 24h Volume: $${totalVolume.toLocaleString()}
  - Market Sentiment: ${marketSentiment} (${positiveTokens}/${tokenData.length} tokens positive)
  
  Please provide a comprehensive market analysis for the Sui blockchain ecosystem including:
  1. Overall market summary and key trends
  2. Token performance analysis 
  3. Liquidity pool dynamics and opportunities
  4. Trading recommendations and potential strategies
  
  Format your analysis in markdown with clear sections and bullet points. Focus on actionable insights.
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
                  'You are a cryptocurrency market analyst specializing in the Sui blockchain ecosystem. Provide expert analysis on market trends, token performance, and liquidity pools. Focus on actionable insights and avoid generic advice.',
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

      // Set the AI analysis content directly
      setAiAnalysis(content)
    } catch (error) {
      console.error('Error generating AI analysis:', error)

      // Fallback analysis if API fails
      setAiAnalysis(`
  ## Sui Ecosystem Market Analysis
  
  ### Market Overview
  * The Sui ecosystem is showing ${tokens.filter((t) => (t.price_change_percentage_24h || 0) > 0).length > tokens.length / 2 ? 'positive' : 'negative'} momentum over the past 24 hours
  * Market sentiment appears ${tokens.filter((t) => (t.price_change_percentage_24h || 0) > 0).length > tokens.length / 2 ? 'bullish' : 'bearish'} based on price action
  * Total liquidity across top pools: $${trendingPools.reduce((sum, pool) => sum + parseFloat(pool.attributes.reserve_in_usd || '0'), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
  
  ### Token Highlights
  * ${tokens[0]?.name} (${tokens[0]?.symbol?.toUpperCase() || 'N/A'}) has shown notable movement at ${tokens[0]?.price_change_percentage_24h?.toFixed(2) || 'N/A'}% in 24h
  * Most tokens are showing ${tokens.filter((t) => (t.price_change_percentage_24h || 0) > 0).length > tokens.length / 2 ? 'gains' : 'losses'} in the current market cycle
  * Consider monitoring high market cap tokens for stability in volatile conditions
  
  ### Liquidity Pool Analysis
  * Most active pool: ${trendingPools[0]?.attributes.name || 'N/A'} with $${parseFloat(trendingPools[0]?.attributes.volume_usd?.h24 || '0').toLocaleString(undefined, { maximumFractionDigits: 0 })} 24h volume
  * Newly created pools may offer early liquidity provision opportunities
  * Current pool activity suggests ${parseFloat(trendingPools[0]?.attributes.volume_usd?.h24 || '0') > 100000 ? 'strong' : 'moderate'} trader interest
  
  ### Trading Recommendations
  * ${tokens.filter((t) => (t.price_change_percentage_24h || 0) > 0).length > tokens.length / 2 ? 'Consider buying on dips as the market shows overall strength' : 'Exercise caution with new positions due to negative market sentiment'}
  * Look for tokens with strong fundamentals and consistent pool activity
  * Monitor new pool creation for potential early entry opportunities
  `)
    } finally {
      setIsLoadingAnalysis(false)
    }
  }

  // Call this in useEffect after data is loaded
  useEffect(() => {
    if (
      !loading &&
      !loadingPools &&
      tokens.length > 0 &&
      trendingPools.length > 0
    ) {
      generateAIAnalysis()
    }
  }, [loading, loadingPools, tokens, trendingPools])

  // Add this to your useEffect or create a new one
  useEffect(() => {
    const fetchLiquidityPools = async () => {
      try {
        setLoadingPools(true)

        // Fetch trending pools
        const trendingResponse = await fetch(
          'https://api.geckoterminal.com/api/v2/networks/sui-network/pools?page=1',
          {
            headers: {
              accept: 'application/json',
            },
          }
        )
        const trendingData = await trendingResponse.json()
        setTrendingPools(trendingData.data || [])

        // Fetch new pools
        const newResponse = await fetch(
          'https://api.geckoterminal.com/api/v2/networks/sui-network/new_pools?page=1',
          {
            headers: {
              accept: 'application/json',
            },
          }
        )
        const newData = await newResponse.json()
        setNewPools(newData.data || [])

        setLoadingPools(false)
      } catch (error) {
        console.error('Error fetching liquidity pools:', error)
        setLoadingPools(false)
      }
    }

    fetchLiquidityPools()
  }, [])

  useEffect(() => {
    // Show intro animation for 6 seconds
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 6000)

    // Fetch tokens from CoinGecko API
    const fetchTokens = async () => {
      try {
        // In a real implementation, you'd use the actual CoinGecko API
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=sui-ecosystem&include_platform=true'
        )
        const data = await response.json()
        setTokens(data || [])
        setFilteredTokens(data || [])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching tokens:', error)
        setLoading(false)
      }
    }

    // Get wallet address from localStorage if available
    const storedAddress = localStorage.getItem('sui_address')
    if (storedAddress) {
      setWalletAddress(storedAddress)
    }

    fetchTokens()
    return () => clearTimeout(timer)
  }, [])

  // Filter tokens based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTokens(tokens)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = tokens.filter(
        (token) =>
          token.name?.toLowerCase().includes(query) ||
          token.symbol?.toLowerCase().includes(query)
      )
      setFilteredTokens(filtered)
    }
    setCurrentPage(1) // Reset to first page on search
  }, [searchQuery, tokens])

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTokens.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTokens.length / itemsPerPage)

  const paginate = (pageNumber: number): void => setCurrentPage(pageNumber)

  // Scroll to TVL section
  const scrollToTVL = (): void => {
    if (tvlRef.current) {
      tvlRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleOpenWormhole = (): void => {
    // Redirect to swap page
    window.location.href = '/swap'
  }

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white">
      {/* Intro Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-hidden bg-gray-900"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* First Animation (Drake "Nah") */}
            <motion.div
              className="absolute inset-0 flex h-screen w-screen items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="mx-auto w-[98%] max-w-5xl rounded-xl bg-yellow-400/90 p-8 shadow-lg backdrop-blur-sm sm:w-[90%] sm:p-12"
                initial={{ opacity: 0, y: 100, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                  delay: 0.3,
                  duration: 1.2,
                }}
              >
                <div className="flex flex-col items-center justify-center md:flex-row">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="mb-6 md:mb-0 md:mr-6"
                  >
                    <Image
                      src="/drake-nah.png"
                      alt="Drake saying no"
                      width={280}
                      height={280}
                      className="rounded-lg"
                    />
                  </motion.div>
                  <div className="flex w-full flex-col">
                    <motion.div
                      className="mb-6 flex w-full flex-wrap items-center justify-between gap-4 md:flex-nowrap"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      <motion.div
                        className="rounded-lg border-2 border-gray-800 p-3"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Image
                          src="https://assets.crypto.ro/logos/sui-sui-logo.png"
                          alt="Sui Logo"
                          width={170}
                          height={70}
                        />
                      </motion.div>
                      <motion.div
                        className="rounded-lg border-2 border-gray-800 p-3"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Image
                          src="https://wormhole.com/token.png"
                          alt="Wormhole Logo"
                          width={170}
                          height={70}
                        />
                      </motion.div>
                    </motion.div>
                    <motion.div
                      className="mt-2 text-center text-xl font-bold text-black md:text-2xl"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                    >
                      Isolated from each other
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Second Animation (Drake "Yeah") */}
            <motion.div
              className="absolute inset-0 flex h-screen w-screen items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8, duration: 0.8 }}
            >
              <motion.div
                className="mx-auto w-[98%] max-w-5xl rounded-xl bg-yellow-400 p-8 sm:w-[90%] sm:p-12"
                initial={{ opacity: 0, y: 150, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                  delay: 3.0,
                  duration: 1.2,
                }}
              >
                <div className="flex flex-col items-center justify-center md:flex-row">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 3.4 }}
                    className="mb-6 md:mb-0 md:mr-6"
                  >
                    <Image
                      src="/drake-yas.png"
                      alt="Drake approving"
                      width={280}
                      height={280}
                      className="rounded-lg"
                    />
                  </motion.div>
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.7, delay: 3.8 }}
                    >
                      <Image
                        src="/logo.png"
                        alt="SWorm Logo"
                        width={320}
                        height={120}
                        className="mx-auto"
                      />
                    </motion.div>
                    <motion.p
                      className="mt-4 text-center text-xl font-bold text-black md:text-2xl"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 4.2 }}
                    >
                      {process.env.NEXT_PUBLIC_APP_NAME}
                    </motion.p>
                    <motion.p
                      className="mt-2 max-w-md text-center text-lg text-black"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 4.5 }}
                    >
                      {process.env.NEXT_PUBLIC_APP_DESCRIPTION}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App */}
      <div className="mx-auto max-w-7xl p-4">
        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left Column - Bridge CTA */}
          <motion.div
            className="rounded-lg border border-blue-900/40 bg-gray-800 p-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: showIntro ? 3.2 : 0 }}
          >
            <h2 className="mb-4 text-xl font-bold text-blue-400">
              Bridge Assets
            </h2>

            <div className="rounded-lg border border-blue-800/30 bg-gray-800 p-4">
              <p className="mb-4 text-blue-200">
                Ready to bridge your assets to Sui? Get the best cross-chain
                experience with Wormhole Connect!
              </p>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <Image
                    src="https://wormhole.com/token.png"
                    alt="Wormhole"
                    width={80}
                    height={80}
                    className="shadow-glow rounded-lg"
                  />
                </div>

                <button
                  onClick={handleOpenWormhole}
                  className="w-full transform rounded-md bg-gradient-to-r from-blue-600 to-blue-500 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-purple-500"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Open Wormhole Bridge
                  </span>
                </button>
              </div>

              <div className="mt-6 border-t border-blue-900/30 pt-6">
                <div className="mb-4 text-center">
                  <span className="text-sm font-medium text-blue-300">
                    From Networks
                  </span>
                </div>
                <div className="flex justify-around">
                  {['ethereum', 'solana', 'polygon'].map((chain) => (
                    <div
                      key={chain}
                      className="group flex cursor-pointer flex-col items-center"
                      onClick={handleOpenWormhole}
                    >
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-600 bg-gray-700 p-1 transition-all duration-300 group-hover:border-blue-400">
                        <Image
                          src={`/${chain}.png`}
                          alt={chain}
                          width={32}
                          height={32}
                          className="rounded-full transition-all duration-300 group-hover:scale-110"
                        />
                      </div>
                      <span className="mt-1 text-xs text-gray-400 transition-colors group-hover:text-blue-400">
                        {chain.charAt(0).toUpperCase() + chain.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                onClick={scrollToTVL}
                className="group relative w-full overflow-hidden rounded-md py-3 text-center font-semibold"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 opacity-80 transition-opacity group-hover:opacity-100"></span>
                <span className="relative flex items-center justify-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pump SUI TVL 🚀
                </span>
                <span className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-green-400 to-blue-400"></span>
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column - Tokens List with Search */}
          <motion.div
            className="rounded-lg border border-blue-900/40 bg-gray-800 p-4 md:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: showIntro ? 3.5 : 0 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-400">
                Sui Ecosystem Tokens
              </h2>
              <div className="text-sm text-gray-400">
                {!loading && `${filteredTokens.length} tokens`}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full rounded-md border border-gray-600 bg-gray-700 py-2 pl-10 pr-3 text-white transition-colors focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                placeholder="Search tokens by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <svg
                  className="h-8 w-8 animate-spin text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-2 border-b border-blue-900/30 p-3 font-semibold text-blue-200">
                  <div>Token</div>
                  <div>Price</div>
                  <div>Market Cap</div>
                </div>
                {currentItems.length > 0 ? (
                  currentItems.map((token, index) => (
                    <Link
                      key={index}
                      href={`/token/${token?.platforms && token.platforms['sui-network'] ? token.platforms['sui-network'] : token.id}`}
                      className="block"
                    >
                      <motion.div
                        className="grid cursor-pointer grid-cols-3 gap-2 border-b border-blue-900/20 p-3 hover:bg-blue-900/10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          scale: 1.01,
                        }}
                      >
                        <div className="flex items-center">
                          <div className="relative mr-3 h-8 w-8 flex-shrink-0">
                            <Image
                              src={token.image || '/placeholder-coin.png'}
                              alt={token.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                            {token.market_cap_rank &&
                              token.market_cap_rank <= 100 && (
                                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                                  {token.market_cap_rank}
                                </div>
                              )}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {token.symbol?.toUpperCase()}
                            </div>
                            <div className="max-w-[150px] truncate text-xs text-gray-400">
                              {token.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">
                            ${token.current_price?.toFixed(2) || 'N/A'}
                          </span>
                          <span
                            className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
                              token.price_change_percentage_24h > 0
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-red-900/30 text-red-400'
                            }`}
                          >
                            {token.price_change_percentage_24h > 0 ? '+' : ''}
                            {token.price_change_percentage_24h?.toFixed(2) ||
                              '0.00'}
                            %
                          </span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          $
                          {token.market_cap
                            ? (token.market_cap / 1000000).toFixed(2) + 'M'
                            : 'N/A'}
                        </div>
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    No matching tokens found
                  </div>
                )}

                {/* Enhanced Pagination with Dropdown */}
                {filteredTokens.length > itemsPerPage && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Showing {indexOfFirstItem + 1}-
                      {Math.min(indexOfLastItem, filteredTokens.length)} of{' '}
                      {filteredTokens.length}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`rounded-md border px-3 py-1 ${
                          currentPage === 1
                            ? 'cursor-not-allowed border-gray-600 bg-gray-700 text-gray-400'
                            : 'border-blue-900/30 bg-gray-800 text-white hover:bg-blue-900/20'
                        }`}
                      >
                        &laquo;
                      </button>

                      <div className="relative inline-block text-left">
                        <select
                          value={currentPage}
                          onChange={(e) => paginate(Number(e.target.value))}
                          className="block w-16 rounded-md border border-blue-900/30 bg-gray-800 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {Array.from({ length: totalPages }, (_, i) => (
                            <option key={i} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>

                      <span className="text-gray-400">of {totalPages}</span>

                      <button
                        onClick={() =>
                          paginate(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={`rounded-md border px-3 py-1 ${
                          currentPage === totalPages
                            ? 'cursor-not-allowed border-gray-600 bg-gray-700 text-gray-400'
                            : 'border-blue-900/30 bg-gray-800 text-white hover:bg-blue-900/20'
                        }`}
                      >
                        &raquo;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Liquidity Pools Section */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: showIntro ? 4.5 : 0.5 }}
        >
          <div className="rounded-lg border border-blue-900/40 bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6">
            <h2 className="mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
              Sui Liquidity Pools
            </h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Trending Pools */}
              <div className="rounded-lg border border-blue-900/30 bg-gray-800/70 p-4">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 rounded-lg bg-blue-900/50 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-blue-300">
                    Trending Pools
                  </h3>
                </div>

                {loadingPools ? (
                  <div className="flex h-64 items-center justify-center">
                    <svg
                      className="h-8 w-8 animate-spin text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-5 gap-2 border-b border-blue-900/30 p-3 text-sm font-medium text-blue-200">
                      <div className="col-span-2">Pool</div>
                      <div className="text-right">Liquidity</div>
                      <div className="text-right">Volume (24h)</div>
                      <div className="text-right">Change (24h)</div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {trendingPools.length > 0 ? (
                        trendingPools.slice(0, 6).map((pool, index) => (
                          <Link
                            key={pool.id}
                            href={`https://www.geckoterminal.com/sui-network/pools/${pool.attributes.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="grid cursor-pointer grid-cols-5 gap-2 border-b border-blue-900/20 p-3 hover:bg-blue-900/10">
                              <div className="col-span-2 flex items-center overflow-hidden">
                                <div className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs text-gray-300">
                                  {index + 1}
                                </div>
                                <div className="truncate">
                                  {pool.attributes.name}
                                </div>
                              </div>
                              <div className="text-right text-gray-300">
                                $
                                {parseFloat(
                                  pool.attributes.reserve_in_usd
                                ).toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </div>
                              <div className="text-right text-gray-300">
                                $
                                {pool.attributes.volume_usd?.h24
                                  ? parseFloat(
                                      pool.attributes.volume_usd.h24
                                    ).toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                    })
                                  : 'N/A'}
                              </div>
                              <div
                                className={`text-right ${
                                  pool.attributes.price_change_percentage
                                    ?.h24 &&
                                  parseFloat(
                                    pool.attributes.price_change_percentage.h24
                                  ) >= 0
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {pool.attributes.price_change_percentage?.h24
                                  ? `${parseFloat(pool.attributes.price_change_percentage.h24) >= 0 ? '+' : ''}${parseFloat(pool.attributes.price_change_percentage.h24).toFixed(2)}%`
                                  : 'N/A'}
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="py-8 text-center text-gray-400">
                          No trending pools available
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-center">
                      <Link
                        href="https://www.geckoterminal.com/sui-network/pools"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-md bg-blue-600/30 px-4 py-2 text-sm font-medium text-blue-300 transition-colors duration-300 hover:bg-blue-600/50"
                      >
                        View All Pools
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="ml-1 h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* New Pools */}
              <div className="rounded-lg border border-blue-900/30 bg-gray-800/70 p-4">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 rounded-lg bg-green-900/50 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-green-300">
                    New Pools
                  </h3>
                </div>

                {loadingPools ? (
                  <div className="flex h-64 items-center justify-center">
                    <svg
                      className="h-8 w-8 animate-spin text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-5 gap-2 border-b border-blue-900/30 p-3 text-sm font-medium text-blue-200">
                      <div className="col-span-2">Pool</div>
                      <div className="text-right">Liquidity</div>
                      <div className="text-right">Created</div>
                      <div className="text-right"></div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {newPools.length > 0 ? (
                        newPools.slice(0, 6).map((pool) => (
                          <Link
                            key={pool.id}
                            href={`https://www.geckoterminal.com/sui-network/pools/${pool.attributes.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="grid cursor-pointer grid-cols-5 gap-2 border-b border-blue-900/20 p-3 hover:bg-blue-900/10">
                              <div className="col-span-2 flex items-center">
                                <div className="mr-2 flex-shrink-0">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-900/50 text-green-400">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                </div>
                                <div className="truncate">
                                  {pool.attributes.name}
                                </div>
                              </div>
                              <div className="text-right text-gray-300">
                                $
                                {parseFloat(
                                  pool.attributes.reserve_in_usd
                                ).toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </div>
                              <div className="text-right text-gray-300">
                                {new Date(
                                  pool.attributes.pool_created_at
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-right">
                                <span className="inline-block rounded-full bg-green-900/30 px-2 py-1 text-xs text-green-400">
                                  New
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="py-8 text-center text-gray-400">
                          No new pools available
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-center">
                      <Link
                        href="/liquidity"
                        className="inline-flex items-center rounded-md bg-green-600/30 px-4 py-2 text-sm font-medium text-green-300 transition-colors duration-300 hover:bg-green-600/50"
                      >
                        Explore Pools
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="ml-1 h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Pool Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center rounded-lg border border-blue-900/30 bg-gray-800/70 p-4">
                <div className="text-sm text-gray-400">Total Liquidity</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {loadingPools ? (
                    <div className="h-8 w-28 animate-pulse rounded bg-gray-700"></div>
                  ) : (
                    `$${trendingPools
                      .reduce(
                        (sum, pool) =>
                          sum +
                          parseFloat(pool.attributes.reserve_in_usd || '0'),
                        0
                      )
                      .toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center rounded-lg border border-blue-900/30 bg-gray-800/70 p-4">
                <div className="text-sm text-gray-400">24h Volume</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {loadingPools ? (
                    <div className="h-8 w-24 animate-pulse rounded bg-gray-700"></div>
                  ) : (
                    `$${trendingPools
                      .reduce(
                        (sum, pool) =>
                          sum +
                          parseFloat(pool.attributes.volume_usd?.h24 || '0'),
                        0
                      )
                      .toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Market Analysis Section */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: showIntro ? 4.8 : 0.8 }}
        >
          <div className="rounded-lg border border-purple-900/40 bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
                AI Market Analysis
              </h2>
              <button
                onClick={generateAIAnalysis}
                className="flex items-center space-x-1 rounded-md bg-purple-600/50 px-3 py-1.5 text-sm text-white transition-colors hover:bg-purple-600/70"
                disabled={isLoadingAnalysis}
              >
                <MagicIcon />
                <span>Refresh</span>
              </button>
            </div>

            <div className="rounded-lg border border-purple-900/30 bg-gray-800/70 p-6">
              {isLoadingAnalysis ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <svg
                    className="mb-4 h-8 w-8 animate-spin text-purple-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-purple-300">Analyzing market data...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(aiAnalysis),
                    }}
                  />
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  No analysis available. Click refresh to generate insights.
                </div>
              )}
            </div>

            {/* Key Stats Cards */}
            {!isLoadingAnalysis && aiAnalysis && (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex h-full flex-col justify-between rounded-lg border border-purple-900/30 bg-gray-800/70 p-4">
                  <div className="mb-2 text-sm text-purple-300">
                    Top Performer
                  </div>
                  <div className="text-lg font-medium">
                    {tokens.length > 0 &&
                      tokens
                        .sort(
                          (a, b) =>
                            (b.price_change_percentage_24h || 0) -
                            (a.price_change_percentage_24h || 0)
                        )[0]
                        ?.symbol?.toUpperCase()}
                  </div>
                  <div className="font-bold text-green-400">
                    {tokens.length > 0 &&
                      `+${tokens
                        .sort(
                          (a, b) =>
                            (b.price_change_percentage_24h || 0) -
                            (a.price_change_percentage_24h || 0)
                        )[0]
                        ?.price_change_percentage_24h?.toFixed(2)}%`}
                  </div>
                </div>

                <div className="flex h-full flex-col justify-between rounded-lg border border-purple-900/30 bg-gray-800/70 p-4">
                  <div className="mb-2 text-sm text-purple-300">
                    Highest Volume Pool
                  </div>
                  <div className="truncate text-lg font-medium">
                    {trendingPools.length > 0 &&
                      trendingPools.sort(
                        (a, b) =>
                          parseFloat(b.attributes.volume_usd?.h24 || '0') -
                          parseFloat(a.attributes.volume_usd?.h24 || '0')
                      )[0]?.attributes.name}
                  </div>
                  <div className="font-bold text-white">
                    {trendingPools.length > 0 &&
                      `$${parseFloat(
                        trendingPools.sort(
                          (a, b) =>
                            parseFloat(b.attributes.volume_usd?.h24 || '0') -
                            parseFloat(a.attributes.volume_usd?.h24 || '0')
                        )[0]?.attributes.volume_usd?.h24 || '0'
                      ).toLocaleString()}`}
                  </div>
                </div>

                <div className="flex h-full flex-col justify-between rounded-lg border border-purple-900/30 bg-gray-800/70 p-4">
                  <div className="mb-2 text-sm text-purple-300">
                    Market Sentiment
                  </div>
                  <div className="text-lg font-medium">
                    {tokens.filter(
                      (t) => (t.price_change_percentage_24h || 0) > 0
                    ).length >
                    tokens.length / 2
                      ? 'Bullish'
                      : 'Bearish'}
                  </div>
                  <div
                    className={`font-bold ${
                      tokens.filter(
                        (t) => (t.price_change_percentage_24h || 0) > 0
                      ).length >
                      tokens.length / 2
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {`${Math.round((tokens.filter((t) => (t.price_change_percentage_24h || 0) > 0).length / tokens.length) * 100)}% positive`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* TVL Water Animation Section */}
        <div ref={tvlRef} className="mt-12 py-10">
          <TVLWaterAnimation />
        </div>
      </div>
    </div>
  )
}
