import { NextRequest, NextResponse } from "next/server";

// Define the response type
interface BlockberryAccountStats {
  coinsCount: number;
  nftsCount: number;
  othersCount: number;
  collectionsCount: number;
  kiosksCount: number;
  balance: number;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const address = searchParams.get("address");
  
  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const blockberryUrl = `https://api.blockberry.one/sui/v1/accounts/stats/${address}`;
    const response = await fetch(blockberryUrl, {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_BLOCK_BERRY_API_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Blockberry API error: ${response.status}`);
    }

    const data = await response.json() as BlockberryAccountStats;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from Blockberry:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Blockberry" },
      { status: 500 }
    );
  }
}