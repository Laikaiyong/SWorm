import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { provider, STAKING_PACKAGE_ID, STAKING_MODULE_NAME, STAKING_POOL_ID, formatPoolInfo } from "@/lib/sui-client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const amount = searchParams.get("amount")
    const duration = searchParams.get("duration") // in days

    if (!amount || !duration) {
      return NextResponse.json(
        { success: false, error: "Amount and duration parameters are required" },
        { status: 400 },
      )
    }

    const amountValue = Number.parseInt(amount)
    const durationDays = Number.parseInt(duration)

    if (isNaN(amountValue) || isNaN(durationDays) || amountValue <= 0 || durationDays <= 0) {
      return NextResponse.json({ success: false, error: "Invalid amount or duration values" }, { status: 400 })
    }

    // Fetch pool data to get current reward rate
    const poolData = await provider.devInspectTransaction({
      sender: "0x0000000000000000000000000000000000000000",
      transaction: {
        kind: "ProgrammableTransaction",
        inputs: [{ kind: "Input", index: 0, type: "pure", value: STAKING_POOL_ID }],
        transactions: [
          {
            kind: "MoveCall",
            target: `${STAKING_PACKAGE_ID}::${STAKING_MODULE_NAME}::get_pool_info`,
            arguments: [{ kind: "Input", index: 0, type: "object" }],
            typeArguments: ["0x2::sui::SUI"],
          },
        ],
      },
    })

    const poolInfo = formatPoolInfo(poolData.results?.Ok[0][0])

    // Calculate estimated rewards
    const durationSeconds = durationDays * 86400
    const REWARDS_PRECISION = 1_000_000_000 // From the contract

    // Simple estimation based on current pool state
    const estimatedRewards = (amountValue * poolInfo.rewardRate * durationSeconds) / REWARDS_PRECISION

    // Calculate APY
    const annualRewards = (amountValue * poolInfo.rewardRate * 31536000) / REWARDS_PRECISION // 365 days in seconds
    const apy = (annualRewards / amountValue) * 100

    // Use AI to generate investment advice
    const { text: aiAnalysis } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Analyze this staking opportunity and provide brief investment advice:
      Amount to stake: ${amountValue} SUI
      Staking period: ${durationDays} days
      Estimated rewards: ${estimatedRewards.toFixed(4)} SUI
      Current APY: ${apy.toFixed(2)}%
      Minimum lock period: ${poolInfo.minStakeDuration / 86400} days
      
      Keep it concise (3-4 sentences) and balanced, mentioning both potential benefits and risks.`,
    })

    return NextResponse.json({
      success: true,
      data: {
        amount: amountValue,
        durationDays,
        estimatedRewards,
        apy,
        minStakeDuration: poolInfo.minStakeDuration,
        aiAnalysis,
      },
    })
  } catch (error) {
    console.error("Error estimating rewards:", error)
    return NextResponse.json({ success: false, error: "Failed to estimate staking rewards" }, { status: 500 })
  }
}
