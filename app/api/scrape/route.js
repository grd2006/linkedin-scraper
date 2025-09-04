import { ApifyClient } from 'apify-client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const client = new ApifyClient({
      token: process.env.APIFY_TOKEN,
    });

    const { profileUrls } = await request.json();

    const run = await client.actor("2SyF0bVxmgGr8IVCZ").call({
      profileUrls: profileUrls,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    return NextResponse.json({ data: items });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}