import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { provider, STAKING_PACKAGE_ID, STAKING_MODULE_NAME } from "@/lib/sui-client"

export async function GET() {
  try {
    // Fetch recent staking events
    const events = await provider.queryEvents({
      query: {
        MoveEventType: `${STAKING_PACKAGE_ID}::${STAKING_MODULE_NAME}::StakeEvent`,
      },
      limit: 10,
      order: "descending",
    })

    // Fetch recent unstaking events
    const unstakeEvents = await provider.queryEvents({
      query: {
        MoveEventType: `${STAKING_PACKAGE_ID}::${STAKING_MODULE_NAME}::UnstakeEvent`,
      },
      limit: 10,
      order: "descending",
    })

    // Fetch recent reward claim events
    const rewardEvents = await provider.queryEvents({
      query: {
        MoveEventType: `${STAKING_PACKAGE_ID}::${STAKING_MODULE_NAME}::RewardClaimEvent`,
      },
      limit: 10,
      order: "descending",
    })

    // Prepare data for AI analysis
    const stakeData = events.data.map((e) => ({
      staker: e.parsedJson?.staker,
      amount: Number(e.parsedJson?.amount),
      timestamp: e.timestampMs,
    }))

    const unstakeData = unstakeEvents.data.map((e) => ({
      staker: e.parsedJson?.staker,
      amount: Number(e.parsedJson?.amount),
      timestamp: e.timestampMs,
    }))

    const rewardData = rewardEvents.data.map((e) => ({
      staker: e.parsedJson?.staker,
      amount: Number(e.parsedJson?.amount),
      timestamp: e.timestampMs,
    }))

    // Calculate some basic metrics
    const totalStaked = stakeData.reduce((sum, event) => sum + event.amount, 0)
    const totalUnstaked = unstakeData.reduce((sum, event) => sum + event.amount, 0)
    const totalRewardsClaimed = rewardData.reduce((sum, event) => sum + event.amount, 0)
    const uniqueStakers = new Set(stakeData.map((e) => e.staker)).size

    // Use AI to analyze the staking activity
    const { text: aiAnalysis } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Analyze recent staking activity and provide insights:
      Recent stakes: ${stakeData.length} events totaling ${totalStaked} SUI
      Recent unstakes: ${unstakeData.length} events totaling ${totalUnstaked} SUI
      Recent rewards claimed: ${rewardData.length} events totaling ${totalRewardsClaimed} SUI
      Unique stakers: ${uniqueStakers}
      Net flow: ${totalStaked - totalUnstaked} SUI
      
      Provide a concise analysis (4-5 sentences) of what this activity suggests about the staking pool's health, user confidence, and potential trends. Include actionable insights for pool administrators.`,
    })

    return NextResponse.json({
      success: true,
      data: {
        recentActivity: {
          stakes: stakeData,
          unstakes: unstakeData,
          rewardsClaimed: rewardData,
        },
        metrics: {
          totalStaked,
          totalUnstaked,
          totalRewardsClaimed,
          uniqueStakers,
          netFlow: totalStaked - totalUnstaked,
        },
        aiAnalysis,
      },
    })
  } catch (error) {
    console.error("Error analyzing events:", error)
    return NextResponse.json({ success: false, error: "Failed to analyze staking events" }, { status: 500 })
  }
}
