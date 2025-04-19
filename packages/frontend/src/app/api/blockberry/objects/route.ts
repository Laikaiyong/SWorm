import { NextRequest, NextResponse } from 'next/server'

// Define types for the response structure
interface BlockberryObjectResponse {
  coins: CoinObject[]
  nfts: NFTObject[]
  domains: DomainObject[]
  unknowns: UnknownObject[]
  kiosks: KioskObject[]
}

interface CoinObject {
  coinType: string
  coinName: string
  coinDenom: string
  decimals: number
  coinSymbol: string
  objectType: string
  objectsCount: number
  lockedBalance: any
  totalBalance: number
  coinPrice: number
  imgUrl: string
  securityMessage: string
  bridged: boolean
  hasNoMetadata: boolean
  verified: boolean
}

interface BaseObject {
  objectType: string
  objectsCount: number
  type: string
  id: string
  name: string
  imgUrl: string
  securityMessage: string
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

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const blockberryUrl = `https://api.blockberry.one/sui/v1/accounts/${address}/objects`

    // Use POST with the required request body
    const response = await fetch(blockberryUrl, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_BLOCK_BERRY_API_KEY || '',
      },
      body: JSON.stringify({
        objectTypes: ['nft', 'domains', 'coin', 'unknown', 'kiosk'],
      }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch objects from Blockberry' },
        { status: 500 }
      )
    }

    const data: BlockberryObjectResponse = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching objects from Blockberry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch objects from Blockberry' },
      { status: 500 }
    )
  }
}
