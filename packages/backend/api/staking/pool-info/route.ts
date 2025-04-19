import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { provider, STAKING_PACKAGE_ID, STAKING_MODULE_NAME, STAKING_POOL_ID, formatPoolInfo } from "@/lib/sui-client"

export async function GET() {
  try {
    // Fetch pool data from blockchain
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

    // Use AI to generate a summary of the pool status
    const { text: aiSummary } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Summarize this staking pool data in 2-3 sentences, highlighting key metrics for potential stakers:
      Total staked: ${poolInfo.stakedBalance} SUI
      Available rewards: ${poolInfo.rewardsBalance} SUI
      Reward rate: ${poolInfo.rewardRate} per second per token
      Minimum staking period: ${poolInfo.minStakeDuration} seconds`,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...poolInfo,
        aiSummary,
      },
    })
  } catch (error) {
    console.error("Error fetching pool info:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch staking pool information" }, { status: 500 })
  }
}
