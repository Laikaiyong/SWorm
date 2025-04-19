import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { provider, STAKING_PACKAGE_ID, STAKING_MODULE_NAME, STAKING_POOL_ID, formatStakeInfo } from "@/lib/sui-client"
import { formatPoolInfo } from "@/lib/sui-client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ success: false, error: "Address parameter is required" }, { status: 400 })
    }

    // Fetch user stake data from blockchain
    const stakeData = await provider.devInspectTransaction({
      sender: "0x0000000000000000000000000000000000000000",
      transaction: {
        kind: "ProgrammableTransaction",
        inputs: [
          { kind: "Input", index: 0, type: "pure", value: STAKING_POOL_ID },
          { kind: "Input", index: 1, type: "pure", value: address },
        ],
        transactions: [
          {
            kind: "MoveCall",
            target: `${STAKING_PACKAGE_ID}::${STAKING_MODULE_NAME}::get_stake_info`,
            arguments: [
              { kind: "Input", index: 0, type: "object" },
              { kind: "Input", index: 1, type: "pure" },
            ],
            typeArguments: ["0x2::sui::SUI"],
          },
        ],
      },
    })

    const stakeInfo = formatStakeInfo(stakeData.results?.Ok[0][0])

    // Calculate time remaining until unstaking is allowed
    const currentTime = Math.floor(Date.now() / 1000)
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
    const unlockTime = stakeInfo.stakeTimestamp + poolInfo.minStakeDuration
    const timeRemaining = Math.max(0, unlockTime - currentTime)

    // Use AI to generate personalized staking advice
    const { text: aiAdvice } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Generate personalized staking advice for a user with the following data:
      Amount staked: ${stakeInfo.amount} SUI
      Staked since: ${new Date(stakeInfo.stakeTimestamp * 1000).toLocaleDateString()}
      Time until unlock: ${Math.floor(timeRemaining / 86400)} days, ${Math.floor((timeRemaining % 86400) / 3600)} hours
      Current reward rate: ${poolInfo.rewardRate} per second per token
      
      Keep it concise (2-3 sentences) and helpful.`,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...stakeInfo,
        unlockTime,
        timeRemaining,
        canUnstake: currentTime >= unlockTime,
        aiAdvice,
      },
    })
  } catch (error) {
    console.error("Error fetching user info:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch staking information" }, { status: 500 })
  }
}
