import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 1. Get the form data from the user's request
  const formData = await request.formData();
  const file = formData.get('file');

  // 2. Basic validation
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  // 3. Retrieve API credentials from environment variables
  const ibmScoringEndpoint = process.env.IBM_SCORING_ENDPOINT;
  const ibmApiKey = process.env.IBM_API_KEY;

  if (!ibmScoringEndpoint || !ibmApiKey) {
    return NextResponse.json(
      { error: 'API endpoint or key is not configured.' },
      { status: 500 }
    );
  }

  try {
    // 4. Forward the image to the IBM server
    const ibmResponse = await fetch(ibmScoringEndpoint, {
      method: 'POST',
      headers: {
        // Adjust this header based on IBM's requirements. 'x-api-key' is common.
        'x-api-key': ibmApiKey,
      },
      body: formData, // Forward the same form data
    });

    // 5. Handle the response from the IBM server
    if (!ibmResponse.ok) {
      const errorData = await ibmResponse.text();
      console.error('IBM API Error:', errorData);
      return NextResponse.json(
        { error: `Error from IBM API: ${ibmResponse.statusText}` },
        { status: ibmResponse.status }
      );
    }

    const classificationResult = await ibmResponse.json();

    // 6. Send the classification result back to the frontend
    return NextResponse.json(classificationResult);
    
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred.' },
      { status: 500 }
    );
  }
}