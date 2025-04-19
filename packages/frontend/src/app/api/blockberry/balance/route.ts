import { NextRequest, NextResponse } from 'next/server';

interface CoinBalance {
    coinType: string;
    coinName: string;
    coinSymbol: string;
    balance: number;
    balanceUsd: number;
    decimals: number;
    coinPrice: number;
}

export async function GET(request: NextRequest) {
    try {
        // Extract address from the query parameter
        const url = new URL(request.url);
        const address = url.searchParams.get('address');
        
        if (!address) {
            return NextResponse.json({ error: 'Address not provided' }, { status: 400 });
        }
        
        // Your API Key (this should be stored in an environment variable in production)
        const apiKey = process.env.NEXT_PUBLIC_BLOCK_BERRY_API_KEY;
        
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }
        
        // Make the request to Blockberry API
        const response = await fetch(`https://api.blockberry.one/sui/v1/accounts/${address}/balance`, {
            headers: {
                'accept': '*/*',
                'x-api-key': apiKey
            }
        });
        
        if (!response.ok) {
            return NextResponse.json(
                { error: `Error fetching data: ${response.statusText}` }, 
                { status: response.status }
            );
        }
        
        const data: CoinBalance[] = await response.json();
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in balance API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}
