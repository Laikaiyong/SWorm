'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { marked } from 'marked'
import { useCurrentAccount } from '@mysten/dapp-kit'
import useStaking from '~~/hooks/useStaking'

// Magic SVG icon for AI section
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

export default function TokenDetailsPage() {
  const [gunModeAnalysis, setGunModeAnalysis] = useState(null)
  const [isLoadingGunMode, setIsLoadingGunMode] = useState(false)

  const [supplyAmount, setSupplyAmount] = useState('')
  const [suilendBalance, setSuilendBalance] = useState('0')
  const [suilendApy, setSuilendApy] = useState('3.21') // Default APY
  const [isSupplying, setIsSupplying] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [showSuilendSuccess, setShowSuilendSuccess] = useState(false)
  const [suilendSuccessMessage, setSuilendSuccessMessage] = useState('')

  const { id } = useParams()
  const [tokenData, setTokenData] = useState(null)
  const [poolData, setPoolData] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedNetwork, setSelectedNetwork] = useState('sui-network')
  const [championLP, setChampionLP] = useState(null)
  const [stakingAmount, setStakingAmount] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [tokenAddress, setTokenAddress] = useState(null)

  // Wallet connection check
  const currentAccount = useCurrentAccount()

  // Use staking hook
  const {
    stakeInfo,
    poolInfo,
    isLoading: stakingLoading,
    error: stakingError,
    stake,
    unstake,
    claimRewards,
  } = useStaking()

  // Handle staking
  const handleStake = async () => {
    if (!stakingAmount || parseFloat(stakingAmount) <= 0) return

    try {
      await stake(stakingAmount)
      // Reset input after successful stake
      setStakingAmount('')
    } catch (error) {
      console.error('Staking error:', error)
    }
  }

  // Handle unstaking
  const handleUnstake = async () => {
    try {
      await unstake()
    } catch (error) {
      console.error('Unstaking error:', error)
    }
  }

  // Handle claiming rewards
  const handleClaimRewards = async () => {
    try {
      await claimRewards()
    } catch (error) {
      console.error('Claiming rewards error:', error)
    }
  }

  // Calculate APY (example calculation)
  const calculateAPY = () => {
    if (!poolInfo) return '0'
    // Example: rewardRate * (365 * 24 * 60 * 60) / stakedBalance * 100
    const annualRewards = poolInfo.rewardRate * (365 * 24 * 60 * 60)
    if (poolInfo.stakedBalance === 0) return '0'
    const apy = (annualRewards / poolInfo.stakedBalance) * 100
    return apy.toFixed(2)
  }

  const handleSuilendSupply = async () => {
    if (!supplyAmount || parseFloat(supplyAmount) <= 0) return

    try {
      setIsSupplying(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update the supplied balance
      const currentBalance = parseFloat(suilendBalance || '0')
      const newBalance = currentBalance + parseFloat(supplyAmount)
      setSuilendBalance(newBalance.toString())

      // Generate a random APY change to simulate market conditions
      const newApy = (
        parseFloat(suilendApy) +
        (Math.random() * 0.4 - 0.2)
      ).toFixed(2)
      setSuilendApy(newApy)

      // Show success message
      setSuilendSuccessMessage(
        `Successfully supplied ${supplyAmount} ${tokenData?.symbol.toUpperCase()} to SuiLend`
      )
      setShowSuilendSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setShowSuilendSuccess(false)
      }, 3000)

      // Clear input
      setSupplyAmount('')
    } catch (error) {
      console.error('Error supplying to SuiLend:', error)
    } finally {
      setIsSupplying(false)
    }
  }

  const handleSuilendWithdraw = async () => {
    if (
      !supplyAmount ||
      parseFloat(supplyAmount) <= 0 ||
      parseFloat(supplyAmount) > parseFloat(suilendBalance)
    )
      return

    try {
      setIsWithdrawing(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update the supplied balance
      const currentBalance = parseFloat(suilendBalance || '0')
      const newBalance = currentBalance - parseFloat(supplyAmount)
      setSuilendBalance(newBalance.toString())

      // Show success message
      setSuilendSuccessMessage(
        `Successfully withdrew ${supplyAmount} ${tokenData?.symbol.toUpperCase()} from SuiLend`
      )
      setShowSuilendSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setShowSuilendSuccess(false)
      }, 3000)

      // Clear input
      setSupplyAmount('')
    } catch (error) {
      console.error('Error withdrawing from SuiLend:', error)
    } finally {
      setIsWithdrawing(false)
    }
  }

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        // Fetch token data from CoinGecko
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true&sparkline=true`
        )
        const data = await response.json()
        setTokenData(data)

        // Get token address from platforms data
        const platforms = data.platforms || {}
        const tokenAddress =
          platforms['sui-network'] || Object.values(platforms)[0] || id
        console.log(tokenAddress)
        setTokenAddress(tokenAddress)

        // Get pool data from GeckoTerminal API
        const geckoTerminalUrl = `https://api.geckoterminal.com/api/v2/networks/${selectedNetwork}/tokens/${tokenAddress}/pools?page=1`
        const poolsResponse = await fetch(geckoTerminalUrl, {
          headers: {
            accept: 'application/json',
          },
        })

        const poolsData = await poolsResponse.json()
        console.log(poolsData)
        setPoolData(poolsData)

        // Find the champion LP (highest liquidity)
        if (poolsData?.data && poolsData.data.length > 0) {
          const sortedPools = [...poolsData.data].sort(
            (a, b) =>
              parseFloat(b.attributes.reserve_in_usd) -
              parseFloat(a.attributes.reserve_in_usd)
          )
          setChampionLP(sortedPools[0])
        }

        // Generate AI analysis using text generation inference
        const aiResponse = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_GROQ_API,
            },
            body: JSON.stringify({
              model: 'llama3-70b-8192',
              messages: [
                {
                  role: 'system',
                  content:
                    'You are a cryptocurrency expert who provides clear, concise analysis of tokens.',
                },
                {
                  role: 'user',
                  content: `Analyze this cryptocurrency token and provide insights:
                  Name: ${data.name}
                  Symbol: ${data.symbol.toUpperCase()}
                  Current price: $${data.market_data.current_price.usd}
                  Market cap: $${data.market_data.market_cap.usd}
                  24h change: ${data.market_data.price_change_percentage_24h}%
                  7d change: ${data.market_data.price_change_percentage_7d}%
                  30d change: ${data.market_data.price_change_percentage_30d}%
                  All-time high: $${data.market_data.ath.usd}
                  All-time low: $${data.market_data.atl.usd}
                  Trading volume: $${data.market_data.total_volume.usd}
                  Circulating supply: ${data.market_data.circulating_supply}
                  Max supply: ${data.market_data.max_supply || 'Unlimited'}
                  
                  Provide a concise analysis of the token's performance in layman understandable story paragraph, potential risks and opportunities, and a rating from 1-10. Make it layman understandable and add newline if needed with emojis`,
                },
              ],
              temperature: 0.7,
              max_tokens: 500,
            }),
          }
        )

        const aiData = await aiResponse.json()
        setAiAnalysis(aiData.choices[0]?.message.content)

        setLoading(false)
      } catch (error) {
        console.error('Error fetching token data:', error)
        setLoading(false)
      }
    }

    if (id) {
      fetchTokenData()
    }
  }, [id, selectedNetwork])

  const triggerGunModeAnalysis = async () => {
    try {
      const aiResponse = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_GROQ_API,
          },
          body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [
              {
                role: 'system',
                content:
                  'You are a daring crypto trader who provides stable earning strategies.',
              },
              {
                role: 'user',
                content: `Generate an aggressive investment strategy for ${tokenData?.name} (${tokenData?.symbol.toUpperCase()}) with the following data:
                Current price: $${tokenData?.market_data.current_price.usd}
                24h change: ${tokenData?.market_data.price_change_percentage_24h}%
                7d change: ${tokenData?.market_data.price_change_percentage_7d}%
                Trading volume: $${tokenData?.market_data.total_volume.usd}
                Volatility indicators: ${tokenData?.market_data.price_change_percentage_30d}%
                
                Create a high-risk, high-reward strategy including:
                1. Optimal entry points
                2. Leverage recommendations (if applicable)
                3. Risk assessment (with honest warning)
                4. Target price projections
                5. Stop-loss recommendations
                
                Label this as "GUN MODE: EXPERT RISK LEVEL"`,
              },
            ],
            temperature: 0.9,
            max_tokens: 800,
          }),
        }
      )

      const gunModeData = await aiResponse.json()
      return gunModeData.choices[0]?.message.content
    } catch (error) {
      console.error('Error generating Gun Mode analysis:', error)
      return 'Failed to generate Gun Mode analysis. Please try again later.'
    }
  }

  return (
    <div className="min-h-screen w-screen bg-gray-900 px-6 text-gray-100">
      <div className="mx-auto space-y-8 p-4">
        {loading ? (
          <div className="space-y-4">
            <div className="h-12 w-1/3 animate-pulse rounded-md bg-gray-700"></div>
            <div className="h-72 w-full animate-pulse rounded-md bg-gray-700"></div>
            <div className="h-48 w-full animate-pulse rounded-md bg-gray-700"></div>
          </div>
        ) : (
          <>
            {/* Token Header */}
            <div className="flex items-center space-x-4">
              {tokenData?.image?.large && (
                <Image
                  src={tokenData.image.large}
                  alt={tokenData.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold">{tokenData?.name}</h1>
                <div className="flex items-center space-x-2">
                  <span className="rounded-full border border-gray-700 bg-gray-800 px-2 py-1 text-lg font-semibold">
                    {tokenData?.symbol.toUpperCase()}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-white ${
                      tokenData?.market_data.price_change_percentage_24h >= 0
                        ? 'bg-green-600'
                        : 'bg-red-600'
                    }`}
                  >
                    {tokenData?.market_data.price_change_percentage_24h.toFixed(
                      2
                    )}
                    %
                  </span>
                </div>
              </div>
              <div className="ml-auto">
                <h2 className="text-3xl font-bold">
                  ${tokenData?.market_data.current_price.usd.toLocaleString()}
                </h2>
                <p className="text-sm text-gray-400">
                  Market Cap: $
                  {tokenData?.market_data.market_cap.usd.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Main Content Tabs */}
            <div className="space-y-4">
              <div className="border-b border-gray-700">
                <div className="grid w-full grid-cols-5">
                  {[
                    'overview',
                    'chart',
                    'liquidity',
                    'staking',
                    'strategies',
                  ].map((tab) => (
                    <button
                      key={tab}
                      className={`py-2 font-medium capitalize ${
                        activeTab === tab
                          ? 'border-b-2 border-blue-500 text-blue-400'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Key metrics */}
                    <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
                      <div className="border-b border-gray-700 p-4">
                        <h2 className="text-lg font-semibold">Key Metrics</h2>
                      </div>
                      <div className="p-4">
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt>Rank</dt>
                            <dd>#{tokenData?.market_cap_rank}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Market Cap</dt>
                            <dd>
                              $
                              {tokenData?.market_data.market_cap.usd.toLocaleString()}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Volume (24h)</dt>
                            <dd>
                              $
                              {tokenData?.market_data.total_volume.usd.toLocaleString()}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Circulating Supply</dt>
                            <dd>
                              {tokenData?.market_data.circulating_supply.toLocaleString()}{' '}
                              {tokenData?.symbol.toUpperCase()}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Max Supply</dt>
                            <dd>
                              {tokenData?.market_data.max_supply
                                ? tokenData.market_data.max_supply.toLocaleString()
                                : '∞'}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>All-time High</dt>
                            <dd>
                              ${tokenData?.market_data.ath.usd.toLocaleString()}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    {/* Price Changes */}
                    <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
                      <div className="border-b border-gray-700 p-4">
                        <h2 className="text-lg font-semibold">Price Changes</h2>
                      </div>
                      <div className="p-4">
                        <dl className="space-y-2">
                          <div className="flex items-center justify-between">
                            <dt>24h</dt>
                            <dd
                              className={
                                tokenData?.market_data
                                  .price_change_percentage_24h >= 0
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }
                            >
                              {tokenData?.market_data.price_change_percentage_24h.toFixed(
                                2
                              )}
                              %
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt>7d</dt>
                            <dd
                              className={
                                tokenData?.market_data
                                  .price_change_percentage_7d >= 0
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }
                            >
                              {tokenData?.market_data.price_change_percentage_7d.toFixed(
                                2
                              )}
                              %
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt>14d</dt>
                            <dd
                              className={
                                tokenData?.market_data
                                  .price_change_percentage_14d >= 0
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }
                            >
                              {tokenData?.market_data.price_change_percentage_14d.toFixed(
                                2
                              )}
                              %
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt>30d</dt>
                            <dd
                              className={
                                tokenData?.market_data
                                  .price_change_percentage_30d >= 0
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }
                            >
                              {tokenData?.market_data.price_change_percentage_30d.toFixed(
                                2
                              )}
                              %
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt>60d</dt>
                            <dd
                              className={
                                tokenData?.market_data
                                  .price_change_percentage_60d >= 0
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }
                            >
                              {tokenData?.market_data.price_change_percentage_60d.toFixed(
                                2
                              )}
                              %
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt>1y</dt>
                            <dd
                              className={
                                tokenData?.market_data
                                  .price_change_percentage_1y >= 0
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }
                            >
                              {tokenData?.market_data.price_change_percentage_1y?.toFixed(
                                2
                              ) || 'N/A'}
                              %
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    {/* Links & Resources */}
                    <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
                      <div className="border-b border-gray-700 p-4">
                        <h2 className="text-lg font-semibold">
                          Links & Resources
                        </h2>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          {tokenData?.links?.homepage?.filter((link) => link)
                            .length > 0 && (
                            <a
                              href={tokenData.links.homepage[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-blue-400"
                            >
                              <span>Website</span>
                              <ArrowUpRight className="ml-1 h-4 w-4" />
                            </a>
                          )}
                          {tokenData?.links?.blockchain_site?.filter(
                            (link) => link
                          ).length > 0 && (
                            <a
                              href={tokenData.links.blockchain_site[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-blue-400"
                            >
                              <span>Explorer</span>
                              <ArrowUpRight className="ml-1 h-4 w-4" />
                            </a>
                          )}
                          {tokenData?.links?.official_forum_url?.filter(
                            (link) => link
                          ).length > 0 && (
                            <a
                              href={tokenData.links.official_forum_url[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-blue-400"
                            >
                              <span>Forum</span>
                              <ArrowUpRight className="ml-1 h-4 w-4" />
                            </a>
                          )}
                          {tokenData?.links?.subreddit_url && (
                            <a
                              href={tokenData.links.subreddit_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-blue-400"
                            >
                              <span>Reddit</span>
                              <ArrowUpRight className="ml-1 h-4 w-4" />
                            </a>
                          )}
                          {tokenData?.links?.twitter_screen_name && (
                            <a
                              href={`https://twitter.com/${tokenData.links.twitter_screen_name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-blue-400"
                            >
                              <span>Twitter</span>
                              <ArrowUpRight className="ml-1 h-4 w-4" />
                            </a>
                          )}
                          {tokenData?.links?.telegram_channel_identifier && (
                            <a
                              href={`https://t.me/${tokenData.links.telegram_channel_identifier}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-blue-400"
                            >
                              <span>Telegram</span>
                              <ArrowUpRight className="ml-1 h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="rounded-lg border border-blue-700/30 bg-gradient-to-br from-blue-900/30 to-purple-900/30 shadow-sm">
                    <div className="flex flex-row items-center gap-2 space-y-0 border-b border-blue-700/30 p-4">
                      <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                        <MagicIcon />
                      </div>
                      <div>
                        <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-lg font-semibold text-transparent">
                          AI Analysis
                        </h2>
                        <p className="text-sm text-gray-400">
                          Powered by LLAMA AI
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="prose prose-sm prose-invert max-w-none">
                        {aiAnalysis ? (
                          <div
                            className="whitespace-pre-line"
                            dangerouslySetInnerHTML={{
                              __html: marked.parse(aiAnalysis),
                            }}
                          />
                        ) : (
                          <div className="h-24 w-full animate-pulse rounded bg-gray-700"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart Tab */}
              {activeTab === 'chart' && (
                <div className="space-y-4">
                  <div className="h-[600px] rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
                    <div className="border-b border-gray-700 p-4">
                      <h2 className="text-lg font-semibold">Price Chart</h2>
                    </div>
                    <div className="h-[500px] p-4">
                      <iframe
                        src={`https://birdeye.so/tv-widget/${tokenAddress}?chain=sui`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allowTransparency={true}
                        title="Token Price Chart"
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Liquidity Pools Tab */}
              {activeTab === 'liquidity' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Champion LP */}
                    {championLP && (
                      <div className="col-span-full rounded-lg border border-amber-700/30 bg-gradient-to-br from-amber-900/20 to-amber-800/30 shadow-sm">
                        <div className="border-b border-amber-700/30 p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl text-amber-400">👑</span>
                            <h2 className="text-lg font-semibold">
                              Champion Liquidity Pool
                            </h2>
                          </div>
                          <p className="text-sm text-gray-400">
                            Highest liquidity pool for {tokenData?.name}
                          </p>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                              <p className="text-sm text-gray-400">Pair</p>
                              <p className="font-semibold">
                                {championLP.attributes.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Liquidity</p>
                              <p className="font-semibold">
                                $
                                {parseFloat(
                                  championLP.attributes.reserve_in_usd
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">
                                Volume (24h)
                              </p>
                              <p className="font-semibold">
                                $
                                {parseFloat(
                                  championLP.attributes.volume_usd?.h24 || 0
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Created</p>
                              <p className="font-semibold">
                                {new Date(
                                  championLP.attributes.pool_created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pool Distribution Chart */}
                    <div className="col-span-full rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
                      <div className="border-b border-gray-700 p-4">
                        <h2 className="text-lg font-semibold">
                          Liquidity Distribution
                        </h2>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {poolData?.data?.slice(0, 5).map((pool, index) => (
                            <div
                              key={pool.id}
                              className="relative h-24 overflow-hidden"
                              style={{
                                width: `${Math.max(10, 100 * (parseFloat(pool.attributes.reserve_in_usd) / parseFloat(poolData.data[0].attributes.reserve_in_usd)))}px`,
                                minWidth: '80px',
                              }}
                            >
                              <div
                                className={`absolute inset-0 bg-gradient-to-t ${
                                  index === 0
                                    ? 'from-amber-700 to-amber-500'
                                    : index === 1
                                      ? 'from-blue-700 to-blue-500'
                                      : index === 2
                                        ? 'from-green-700 to-green-500'
                                        : index === 3
                                          ? 'from-purple-700 to-purple-500'
                                          : 'from-gray-700 to-gray-500'
                                } rounded-md opacity-80`}
                              ></div>
                              <div className="absolute inset-0 flex flex-col justify-between p-2 text-white">
                                <span className="text-xs font-bold">
                                  {pool.attributes.name}
                                </span>
                                <span className="text-xs">
                                  $
                                  {parseFloat(
                                    pool.attributes.reserve_in_usd
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Embedded GeckoTerminal */}
                    <div className="col-span-full h-[600px] rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
                      <div className="border-b border-gray-700 p-4">
                        <h2 className="text-lg font-semibold">Pool Details</h2>
                      </div>
                      <div className="h-[500px] p-4">
                        {championLP ? (
                          <iframe
                            src={`https://www.geckoterminal.com/${selectedNetwork}/pools/${championLP.attributes.address}?embed=1&info=0&swaps=0&theme=dark`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title="Token Price Chart"
                            className="h-full w-full"
                            allow="clipboard-write"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <p>No liquidity pool data available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pool List */}
                    <div className="col-span-full rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
                      <div className="border-b border-gray-700 p-4">
                        <h2 className="text-lg font-semibold">
                          All Liquidity Pools
                        </h2>
                      </div>
                      <div className="p-4">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-gray-400">
                                <th className="p-2 text-left">Pool</th>
                                <th className="p-2 text-right">Liquidity</th>
                                <th className="p-2 text-right">Volume (24h)</th>
                                <th className="p-2 text-right">Created</th>
                                <th className="p-2 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {poolData?.data?.map((pool, index) => (
                                <tr
                                  key={pool.id}
                                  className="border-t border-gray-700"
                                >
                                  <td className="flex items-center p-2">
                                    {index === 0 && (
                                      <span className="mr-2 text-amber-400">
                                        👑
                                      </span>
                                    )}
                                    {pool.attributes.name}
                                  </td>
                                  <td className="p-2 text-right">
                                    $
                                    {parseFloat(
                                      pool.attributes.reserve_in_usd
                                    ).toLocaleString()}
                                  </td>
                                  <td className="p-2 text-right">
                                    $
                                    {parseFloat(
                                      pool.attributes.volume_usd?.h24 || 0
                                    ).toLocaleString()}
                                  </td>
                                  <td className="p-2 text-right">
                                    {new Date(
                                      pool.attributes.pool_created_at
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="p-2 text-right">
                                    <a
                                      href={`https://www.geckoterminal.com/${selectedNetwork}/pools/${pool.attributes.address}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block rounded border border-gray-600 px-3 py-1 text-sm hover:bg-gray-700"
                                    >
                                      View
                                    </a>
                                  </td>
                                </tr>
                              ))}
                              {(!poolData?.data ||
                                poolData.data.length === 0) && (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className="p-4 text-center text-gray-400"
                                  >
                                    No liquidity pools found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Staking Tab */}
              {activeTab === 'staking' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* SuiLend Integration - Improved UI */}
                    <div className="rounded-lg border border-blue-700/30 bg-gradient-to-br from-blue-900/10 to-blue-800/20 shadow-sm transition-transform hover:scale-[1.01]">
                      <div className="border-b border-blue-700/30 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 36 36"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36Z"
                                fill="#6F9BF9"
                                fillOpacity="0.2"
                              />
                              <path
                                d="M27.15 14.4C27.15 17.4 21.9 18 21.9 18C21.9 18 22.5 14.1 20.1 12.9C17.7 11.7 13.5 13.5 13.5 13.5C13.5 13.5 14.85 9.3 19.35 9.3C23.85 9.3 27.15 11.4 27.15 14.4Z"
                                fill="#70A1FF"
                              />
                              <path
                                d="M8.85 21.6C8.85 18.6 14.1 18 14.1 18C14.1 18 13.5 21.9 15.9 23.1C18.3 24.3 22.5 22.5 22.5 22.5C22.5 22.5 21.15 26.7 16.65 26.7C12.15 26.7 8.85 24.6 8.85 21.6Z"
                                fill="#70A1FF"
                              />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold">SuiLend</h2>
                            <p className="text-sm text-gray-300">
                              Supply and earn interest on your{' '}
                              {tokenData?.symbol.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="space-y-4">
                          {/* Current Position Card */}
                          <div className="rounded-lg bg-gradient-to-r from-blue-900/30 to-blue-800/20 p-4">
                            <h3 className="mb-3 text-sm font-medium text-blue-300">
                              Your Position
                            </h3>
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">
                                  Supplied
                                </span>
                                <span className="font-medium text-white">
                                  {parseFloat(suilendBalance).toLocaleString()}{' '}
                                  {tokenData?.symbol.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">
                                  Supply APY
                                </span>
                                <span className="font-medium text-green-400">
                                  {suilendApy}%
                                </span>
                              </div>
                              {parseFloat(suilendBalance) > 0 && (
                                <>
                                  <div className="border-t border-blue-800/40 pt-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-300">
                                        Daily Yield
                                      </span>
                                      <span className="font-medium text-green-400">
                                        +
                                        {(
                                          (parseFloat(suilendBalance) *
                                            parseFloat(suilendApy)) /
                                          100 /
                                          365
                                        ).toFixed(6)}{' '}
                                        {tokenData?.symbol.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-300">
                                        Annual Yield
                                      </span>
                                      <span className="font-medium text-green-400">
                                        +
                                        {(
                                          (parseFloat(suilendBalance) *
                                            parseFloat(suilendApy)) /
                                          100
                                        ).toFixed(4)}{' '}
                                        {tokenData?.symbol.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Amount Input */}
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-200">
                              Amount
                            </label>
                            <div className="flex items-center">
                              <input
                                type="text"
                                value={supplyAmount}
                                onChange={(e) =>
                                  setSupplyAmount(e.target.value)
                                }
                                className="flex-1 rounded-l-md border border-blue-800/40 bg-blue-900/20 p-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0.0"
                              />
                              <button
                                className="rounded-r-md bg-blue-700 px-3 py-2 text-sm font-medium hover:bg-blue-600"
                                onClick={() =>
                                  setSupplyAmount(
                                    tokenData?.market_data?.balance || '0'
                                  )
                                }
                              >
                                MAX
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              className={`rounded-md px-4 py-2 text-white ${
                                isSupplying
                                  ? 'cursor-not-allowed bg-blue-800'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                              onClick={handleSuilendSupply}
                              disabled={isSupplying || !supplyAmount}
                            >
                              {isSupplying ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                                  <span>Supplying</span>
                                </div>
                              ) : (
                                'Supply'
                              )}
                            </button>
                            <button
                              className={`rounded-md px-4 py-2 text-white ${
                                isWithdrawing ||
                                parseFloat(suilendBalance) === 0
                                  ? 'cursor-not-allowed bg-gray-800 text-gray-500'
                                  : 'bg-gray-700 hover:bg-gray-600'
                              }`}
                              onClick={handleSuilendWithdraw}
                              disabled={
                                isWithdrawing ||
                                parseFloat(suilendBalance) === 0 ||
                                !supplyAmount
                              }
                            >
                              {isWithdrawing ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                                  <span>Withdrawing</span>
                                </div>
                              ) : (
                                'Withdraw'
                              )}
                            </button>
                          </div>

                          {showSuilendSuccess && (
                            <div className="rounded-md border border-green-800 bg-green-900/30 p-2 text-sm text-green-400">
                              {suilendSuccessMessage}
                            </div>
                          )}

                          {/* Info Card */}
                          <div className="rounded-md border border-blue-800/40 bg-blue-900/20 p-3">
                            <h4 className="mb-2 text-sm font-medium text-blue-300">
                              SuiLend Benefits
                            </h4>
                            <div className="grid grid-cols-3 gap-2 text-xs text-gray-300">
                              <div className="flex flex-col items-center rounded-md bg-blue-800/20 p-2 text-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mb-1 text-blue-400"
                                >
                                  <path d="M12 2v6.5l5-3 1.5 2.5-4.5 2.5 4.5 2.5-1.5 2.5-5-3V17l-3 1-2-2 1-3-3-1v-2l3-1-1-3 2-2 3 1z" />
                                </svg>
                                <span>Earn Passive Income</span>
                              </div>
                              <div className="flex flex-col items-center rounded-md bg-blue-800/20 p-2 text-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mb-1 text-blue-400"
                                >
                                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                                </svg>
                                <span>Withdraw Anytime</span>
                              </div>
                              <div className="flex flex-col items-center rounded-md bg-blue-800/20 p-2 text-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mb-1 text-blue-400"
                                >
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                </svg>
                                <span>Smart Contract Security</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Smart Contract Staking - Improved UI */}
                    <div className="relative rounded-lg border border-green-700/30 bg-gradient-to-br from-green-900/10 to-green-800/20 shadow-sm transition-transform hover:scale-[1.01]">
                      {/* Testnet Badge */}
                      <div className="absolute -top-3 right-4 rounded-full bg-amber-600/90 px-3 py-1 text-xs font-bold text-white shadow-lg">
                        TESTNET ONLY
                      </div>

                      <div className="border-b border-green-700/30 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600/20">
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
                              className="text-green-400"
                            >
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold">
                              SWORM Staking
                            </h2>
                            <p className="text-sm text-gray-300">
                              Stake your SUI tokens to earn rewards
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        {!currentAccount ? (
                          <div className="rounded-lg bg-green-900/20 p-6 text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="36"
                              height="36"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mx-auto mb-3 text-green-400"
                            >
                              <rect
                                width="18"
                                height="11"
                                x="3"
                                y="11"
                                rx="2"
                                ry="2"
                              />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <p className="mb-4 text-gray-300">
                              Connect your wallet to start staking
                            </p>
                          </div>
                        ) : stakingLoading ? (
                          <div className="flex h-64 items-center justify-center py-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Testnet Callout */}
                            <div className="mb-4 rounded-lg border border-amber-600/40 bg-amber-900/20 p-3">
                              <div className="flex gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-amber-400"
                                >
                                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                  <line x1="12" x2="12" y1="9" y2="13" />
                                  <line x1="12" x2="12.01" y1="17" y2="17" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-amber-300">
                                    Testnet Contract
                                  </p>
                                  <p className="text-xs text-amber-200/70">
                                    This staking contract is deployed on Sui
                                    Testnet. Real SUI tokens are not affected.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Pool Information - Infographic Style */}
                            <div className="rounded-lg bg-gradient-to-r from-green-900/30 to-green-800/20 p-4">
                              <h3 className="mb-3 text-sm font-medium text-green-300">
                                Pool Statistics
                              </h3>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col rounded-md bg-green-800/20 p-3">
                                  <span className="text-xs text-gray-400">
                                    Total Staked
                                  </span>
                                  <span className="text-lg font-medium text-white">
                                    {poolInfo
                                      ? (poolInfo.stakedBalance / 1e9).toFixed(
                                          2
                                        )
                                      : '0'}{' '}
                                    SUI
                                  </span>
                                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                                    <div
                                      className="h-full rounded-full bg-green-500"
                                      style={{
                                        width: `${Math.min(100, (poolInfo?.stakedBalance || 0) / 1e11)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>

                                <div className="flex flex-col rounded-md bg-green-800/20 p-3">
                                  <span className="text-xs text-gray-400">
                                    APY
                                  </span>
                                  <span className="text-lg font-medium text-green-400">
                                    {calculateAPY()}%
                                  </span>
                                  <div className="mt-1 flex items-center text-xs text-gray-400">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="15 14 20 9 15 4" />
                                      <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                                    </svg>
                                    <span className="ml-1">Compound daily</span>
                                  </div>
                                </div>

                                <div className="flex flex-col rounded-md bg-green-800/20 p-3">
                                  <span className="text-xs text-gray-400">
                                    Min Duration
                                  </span>
                                  <span className="text-lg font-medium text-white">
                                    {poolInfo
                                      ? (
                                          poolInfo.minStakeDuration / 86400
                                        ).toFixed(0)
                                      : '0'}{' '}
                                    days
                                  </span>
                                  <div className="mt-1 flex items-center text-xs text-gray-400">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span className="ml-1">Lock period</span>
                                  </div>
                                </div>

                                <div className="flex flex-col rounded-md bg-green-800/20 p-3">
                                  <span className="text-xs text-gray-400">
                                    Rewards Pool
                                  </span>
                                  <span className="text-lg font-medium text-white">
                                    {poolInfo
                                      ? (poolInfo.rewardsBalance / 1e9).toFixed(
                                          2
                                        )
                                      : '0'}{' '}
                                    SUI
                                  </span>
                                  <div className="mt-1 flex items-center text-xs text-gray-400">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="8" cy="21" r="1" />
                                      <circle cx="19" cy="21" r="1" />
                                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                    </svg>
                                    <span className="ml-1">
                                      Available for distribution
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* User Stake Information */}
                            {stakeInfo ? (
                              <div className="rounded-lg bg-gradient-to-r from-blue-900/30 to-green-900/20 p-4">
                                <h3 className="mb-3 text-sm font-medium text-blue-300">
                                  Your Stake
                                </h3>

                                <div className="grid gap-4">
                                  <div className="flex flex-col items-center rounded-md bg-blue-800/20 p-4">
                                    <span className="text-sm text-gray-300">
                                      Staked Amount
                                    </span>
                                    <span className="mt-1 text-2xl font-medium text-white">
                                      {(stakeInfo.amount / 1e9).toFixed(4)} SUI
                                    </span>

                                    <div className="mt-3 flex w-full justify-between rounded-md bg-blue-900/40 p-2 text-xs">
                                      <div>
                                        <span className="text-gray-400">
                                          Since
                                        </span>
                                        <div className="font-medium">
                                          {new Date(
                                            stakeInfo.stakeTimestamp * 1000
                                          ).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-gray-400">
                                          Est. Rewards
                                        </span>
                                        <div className="font-medium text-green-400">
                                          {(stakeInfo.rewardDebt / 1e9).toFixed(
                                            6
                                          )}{' '}
                                          SUI
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-3">
                                    <button
                                      onClick={handleUnstake}
                                      className="flex-1 rounded-md bg-red-600/90 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                                    >
                                      <div className="flex items-center justify-center gap-1.5">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                                          <path d="M20 12v4H6a2 2 0 0 0-2 2c0 1.1.9 2 2 2h12v-4" />
                                        </svg>
                                        <span>Unstake</span>
                                      </div>
                                    </button>
                                    <button
                                      onClick={handleClaimRewards}
                                      className="flex-1 rounded-md bg-green-600/90 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                    >
                                      <div className="flex items-center justify-center gap-1.5">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M20 6H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
                                          <path d="M12 16v-6" />
                                          <path d="M8 13l4 3 4-3" />
                                        </svg>
                                        <span>Claim Rewards</span>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-lg bg-gradient-to-r from-blue-900/20 to-blue-800/10 p-4">
                                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-300">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 17v.5" />
                                    <path d="M12 14v-3" />
                                    <path d="M6.6 15.6A8 8 0 1 1 17.4 15.6" />
                                  </svg>
                                  <span>Start Staking</span>
                                </h3>
                                <p className="mb-3 text-sm text-gray-400">
                                  You have no active stakes. Start staking SUI
                                  to earn rewards.
                                </p>

                                <div className="rounded-md bg-blue-800/20 p-3 text-xs">
                                  <ul className="space-y-1.5 text-gray-300">
                                    <li className="flex items-center gap-1.5">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-green-400"
                                      >
                                        <polyline points="9 11 12 14 22 4" />
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                      </svg>
                                      <span>
                                        Stake SUI to earn passive rewards
                                      </span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-green-400"
                                      >
                                        <polyline points="9 11 12 14 22 4" />
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                      </svg>
                                      <span>
                                        Competitive APY of ~{calculateAPY()}%
                                      </span>
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-green-400"
                                      >
                                        <polyline points="9 11 12 14 22 4" />
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                      </svg>
                                      <span>
                                        Minimum staking period:{' '}
                                        {poolInfo
                                          ? (
                                              poolInfo.minStakeDuration / 86400
                                            ).toFixed(0)
                                          : '0'}{' '}
                                        days
                                      </span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            )}

                            {/* Staking Form */}
                            <div className="rounded-lg bg-gradient-to-r from-green-900/20 to-green-800/10 p-4">
                              <div className="mb-2">
                                <label
                                  htmlFor="stakeAmount"
                                  className="block text-sm font-medium text-gray-200"
                                >
                                  Stake Amount (SUI)
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                  <input
                                    type="number"
                                    name="stakeAmount"
                                    id="stakeAmount"
                                    className="block w-full rounded-md border border-green-800/40 bg-green-900/20 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                                    placeholder="0.0"
                                    value={stakingAmount}
                                    onChange={(e) =>
                                      setStakingAmount(e.target.value)
                                    }
                                  />
                                </div>
                              </div>

                              <button
                                onClick={handleStake}
                                disabled={
                                  !stakingAmount ||
                                  parseFloat(stakingAmount) <= 0
                                }
                                className="w-full rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-600"
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M5 9h14M5 15h14M12 19V5" />
                                  </svg>
                                  <span>Stake SUI</span>
                                </div>
                              </button>
                            </div>

                            {stakingError && (
                              <div className="mt-3 rounded-md border border-red-800 bg-red-900/30 p-2 text-sm text-red-400">
                                {stakingError}
                              </div>
                            )}

                            {/* Contract Address */}
                            <div className="mt-2 flex items-center gap-1.5 px-1 text-xs text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  width="20"
                                  height="14"
                                  x="2"
                                  y="5"
                                  rx="2"
                                />
                                <line x1="2" x2="22" y1="10" y2="10" />
                              </svg>
                              <span>Contract: 0x053cb94e...772e6</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="cursor-pointer text-blue-400 hover:text-blue-300"
                              >
                                <rect
                                  width="14"
                                  height="14"
                                  x="8"
                                  y="8"
                                  rx="2"
                                  ry="2"
                                />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Validator Staking */}
                    <div className="col-span-full rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
                      <div className="border-b border-gray-700 p-4">
                        <h2 className="text-lg font-semibold">
                          Validator Staking
                        </h2>
                        <p className="text-sm text-gray-400">
                          Stake with trusted validators to earn network rewards
                        </p>
                      </div>
                      <div className="p-4">
                        <div className="space-y-4">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="text-gray-400">
                                  <th className="p-2 text-left">Validator</th>
                                  <th className="p-2 text-right">Commission</th>
                                  <th className="p-2 text-right">APR</th>
                                  <th className="p-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t border-gray-700">
                                  <td className="p-2">SWORM Validator</td>
                                  <td className="p-2 text-right">5%</td>
                                  <td className="p-2 text-right">8.2%</td>
                                  <td className="p-2 text-right">
                                    <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                                      Stake
                                    </button>
                                  </td>
                                </tr>
                                <tr className="border-t border-gray-700">
                                  <td className="p-2">Coinbase</td>
                                  <td className="p-2 text-right">7%</td>
                                  <td className="p-2 text-right">7.9%</td>
                                  <td className="p-2 text-right">
                                    <button className="rounded border border-gray-600 px-3 py-1 text-sm hover:bg-gray-700">
                                      Stake
                                    </button>
                                  </td>
                                </tr>
                                <tr className="border-t border-gray-700">
                                  <td className="p-2">Binance</td>
                                  <td className="p-2 text-right">8%</td>
                                  <td className="p-2 text-right">7.7%</td>
                                  <td className="p-2 text-right">
                                    <button className="rounded border border-gray-600 px-3 py-1 text-sm hover:bg-gray-700">
                                      Stake
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Strategies Tab */}
              {activeTab === 'strategies' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
                    <div className="border-b border-gray-700 p-4">
                      <h2 className="text-lg font-semibold">
                        Smart Investment Strategies
                      </h2>
                      <p className="text-sm text-gray-400">
                        Choose the strategy that matches your risk tolerance
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Shield Strategy */}
                        <div className="rounded-lg border-2 border-blue-800 bg-gray-900 shadow-sm transition-colors hover:border-blue-600">
                          <div className="border-b border-gray-700 p-4 pb-2">
                            <div className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-blue-500"
                              >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                              </svg>
                              <h3 className="text-lg font-semibold">
                                Shield Strategy
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="mb-3 text-sm text-gray-300">
                              Low-risk, stable returns (stablecoin staking)
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Est. APY</span>
                                <span className="font-medium">3-5%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Risk Level</span>
                                <span className="font-medium text-blue-500">
                                  Low
                                </span>
                              </div>
                            </div>
                            <button className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                              Select
                            </button>
                          </div>
                        </div>

                        {/* Sword Strategy */}
                        <div className="rounded-lg border-2 border-red-800 bg-gray-900 shadow-sm transition-colors hover:border-red-600">
                          <div className="border-b border-gray-700 p-4 pb-2">
                            <div className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-red-500"
                              >
                                <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
                                <path d="M13 19l6-6" />
                                <path d="M16 16l4 4" />
                                <path d="M19 21l2-2" />
                              </svg>
                              <h3 className="text-lg font-semibold">
                                Sword Strategy
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="mb-3 text-sm text-gray-300">
                              High-risk, high-reward opportunities (memecoins +
                              leverage)
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Est. APY</span>
                                <span className="font-medium">15-30%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Risk Level</span>
                                <span className="font-medium text-red-500">
                                  High
                                </span>
                              </div>
                            </div>
                            <button className="mt-4 w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                              Select
                            </button>
                          </div>
                        </div>

                        {/* Balanced Strategy */}
                        <div className="rounded-lg border-2 border-purple-800 bg-gray-900 shadow-sm transition-colors hover:border-purple-600">
                          <div className="border-b border-gray-700 p-4 pb-2">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-purple-500"
                                >
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                </svg>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="absolute -right-1 -top-1 -rotate-45 transform text-purple-500"
                                >
                                  <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
                                  <path d="M13 19l6-6" />
                                  <path d="M16 16l4 4" />
                                  <path d="M19 21l2-2" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold">
                                Balanced Strategy
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="mb-3 text-sm text-gray-300">
                              Optimal mix of staking and stable pools
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Est. APY</span>
                                <span className="font-medium">8-12%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Risk Level</span>
                                <span className="font-medium text-purple-500">
                                  Medium
                                </span>
                              </div>
                            </div>
                            <button className="mt-4 w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                              Select
                            </button>
                          </div>
                        </div>

                        {/* Gun Mode */}
                        <div className="rounded-lg border-2 border-red-800 bg-black text-white shadow-sm transition-colors hover:border-red-600">
                          <div className="border-b border-gray-800 p-4 pb-2">
                            <div className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-red-500"
                              >
                                <path d="M14 5L4 15l5 5 10-10-5-5z" />
                                <path d="M13 6l1.5-1.5c.8-.8 2-.8 2.8 0l0 0c.8.8.8 2 0 2.8L16 8.5" />
                                <path d="M16 15.5l4.5-4.5" />
                                <path d="M17 19h3v3" />
                                <path d="M9 5H6V2" />
                              </svg>
                              <h3 className="text-lg font-semibold">
                                Gun Mode
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            {!gunModeAnalysis ? (
                              <>
                                <p className="mb-3 text-sm text-gray-400">
                                  AI-validated aggressive strategy for maximum
                                  yield
                                </p>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Est. APY</span>
                                    <span className="font-medium text-red-500">
                                      25-50%+
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Risk Level</span>
                                    <span className="font-medium text-red-500">
                                      Expert
                                    </span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="max-h-64 overflow-y-auto">
                                <div
                                  className="prose prose-sm prose-invert max-w-none text-xs"
                                  dangerouslySetInnerHTML={{
                                    __html: marked.parse(gunModeAnalysis),
                                  }}
                                />
                              </div>
                            )}
                            <button
                              className={`mt-4 w-full rounded-md ${
                                isLoadingGunMode
                                  ? 'cursor-not-allowed bg-gray-700'
                                  : gunModeAnalysis
                                    ? 'bg-red-900 hover:bg-red-800'
                                    : 'bg-red-700 hover:bg-red-800'
                              } px-4 py-2 text-white`}
                              onClick={async () => {
                                if (isLoadingGunMode) return

                                if (gunModeAnalysis) {
                                  setGunModeAnalysis(null)
                                  return
                                }

                                setIsLoadingGunMode(true)
                                const analysis = await triggerGunModeAnalysis()
                                setGunModeAnalysis(analysis)
                                setIsLoadingGunMode(false)
                              }}
                              disabled={isLoadingGunMode}
                            >
                              {isLoadingGunMode
                                ? 'Analyzing...'
                                : gunModeAnalysis
                                  ? 'Reset'
                                  : 'Activate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Coming Soon Section */}
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-gray-700 p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-400"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">
                  More Strategies Coming Soon
                </h3>
                <p className="max-w-md text-gray-400">
                  Our team is working on additional advanced trading strategies,
                  automated portfolio management, and AI-powered risk analysis
                  tools. Check back soon for updates!
                </p>
                <button className="mt-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                  Get Notified
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
