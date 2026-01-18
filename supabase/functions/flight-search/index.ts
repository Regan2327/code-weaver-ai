import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  adults?: number;
  maxResults?: number;
}

interface AmadeusToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Get Amadeus OAuth token
async function getAmadeusToken(): Promise<string> {
  const apiKey = Deno.env.get('AMADEUS_API_KEY');
  const apiSecret = Deno.env.get('AMADEUS_API_SECRET');

  if (!apiKey || !apiSecret) {
    throw new Error('Amadeus API credentials not configured');
  }

  console.log('[Amadeus] Requesting access token...');

  const response = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Amadeus] Token error:', error);
    throw new Error(`Failed to get Amadeus token: ${response.status}`);
  }

  const data: AmadeusToken = await response.json();
  console.log('[Amadeus] Token acquired successfully');
  return data.access_token;
}

// IATA airport code mapping for common cities
const cityToAirport: Record<string, string> = {
  'new york': 'JFK',
  'nyc': 'JFK',
  'los angeles': 'LAX',
  'la': 'LAX',
  'san francisco': 'SFO',
  'chicago': 'ORD',
  'miami': 'MIA',
  'seattle': 'SEA',
  'boston': 'BOS',
  'denver': 'DEN',
  'austin': 'AUS',
  'las vegas': 'LAS',
  'london': 'LHR',
  'paris': 'CDG',
  'tokyo': 'NRT',
  'dubai': 'DXB',
  'singapore': 'SIN',
  'sydney': 'SYD',
  'toronto': 'YYZ',
  'berlin': 'BER',
  'amsterdam': 'AMS',
  'barcelona': 'BCN',
  'hong kong': 'HKG',
  'rome': 'FCO',
  'madrid': 'MAD',
  'frankfurt': 'FRA',
  'dallas': 'DFW',
  'atlanta': 'ATL',
  'phoenix': 'PHX',
  'orlando': 'MCO',
  'washington': 'IAD',
  'dc': 'IAD',
};

function parseCity(input: string): string {
  const normalized = input.toLowerCase().trim();
  // Check if it's already an IATA code (3 letters)
  if (/^[a-zA-Z]{3}$/.test(normalized)) {
    return normalized.toUpperCase();
  }
  return cityToAirport[normalized] || normalized.toUpperCase().slice(0, 3);
}

function extractFlightInfo(query: string): { origin?: string; destination?: string; date?: string } {
  const lowerQuery = query.toLowerCase();
  let origin: string | undefined;
  let destination: string | undefined;
  let date: string | undefined;

  // Extract cities from "from X to Y" pattern
  const fromToMatch = lowerQuery.match(/from\s+([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s|$|on|for)/);
  if (fromToMatch) {
    origin = parseCity(fromToMatch[1].trim());
    destination = parseCity(fromToMatch[2].trim());
  } else {
    // Try "to X" pattern
    const toMatch = lowerQuery.match(/to\s+([a-z\s]+?)(?:\s|$|on|for)/);
    if (toMatch) {
      destination = parseCity(toMatch[1].trim());
    }
    // Try "from X" pattern
    const fromMatch = lowerQuery.match(/from\s+([a-z\s]+?)(?:\s|$|to|on|for)/);
    if (fromMatch) {
      origin = parseCity(fromMatch[1].trim());
    }
  }

  // Extract date patterns
  const datePatterns = [
    /(\d{4}-\d{2}-\d{2})/, // ISO format
    /(\d{1,2}\/\d{1,2}\/\d{4})/, // MM/DD/YYYY
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?/i,
    /(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?/i,
  ];

  for (const pattern of datePatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      // Convert to ISO format
      if (match[0].includes('-')) {
        date = match[0];
      } else if (match[0].includes('/')) {
        const [m, d, y] = match[0].split('/');
        date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      } else {
        // Month name format
        const months: Record<string, string> = {
          january: '01', february: '02', march: '03', april: '04',
          may: '05', june: '06', july: '07', august: '08',
          september: '09', october: '10', november: '11', december: '12'
        };
        const monthName = (match[1] || match[2]).toLowerCase();
        const day = (match[2] || match[1]).match(/\d+/)?.[0] || '1';
        const year = match[3] || new Date().getFullYear().toString();
        date = `${year}-${months[monthName]}-${day.padStart(2, '0')}`;
      }
      break;
    }
  }

  // Default to tomorrow if no date specified
  if (!date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7); // Default to a week from now for better availability
    date = tomorrow.toISOString().split('T')[0];
  }

  return { origin, destination, date };
}

async function searchFlights(token: string, params: FlightSearchParams) {
  const { origin, destination, departureDate, adults = 1, maxResults = 5 } = params;

  console.log(`[Amadeus] Searching flights: ${origin} -> ${destination} on ${departureDate}`);

  const searchParams = new URLSearchParams({
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate: departureDate,
    adults: adults.toString(),
    max: maxResults.toString(),
    currencyCode: 'USD',
  });

  const response = await fetch(
    `https://api.amadeus.com/v2/shopping/flight-offers?${searchParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('[Amadeus] Search error:', error);
    
    // Try to parse error for better messaging
    try {
      const errorData = JSON.parse(error);
      if (errorData.errors?.[0]?.detail) {
        throw new Error(errorData.errors[0].detail);
      }
    } catch {
      // Fall through to generic error
    }
    
    throw new Error(`Flight search failed: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[Amadeus] Found ${data.data?.length || 0} flights`);
  return data;
}

// Transform Amadeus response to our FlightOption format
function transformFlights(amadeusData: any) {
  if (!amadeusData.data || amadeusData.data.length === 0) {
    return [];
  }

  const dictionaries = amadeusData.dictionaries || {};
  const carriers = dictionaries.carriers || {};

  return amadeusData.data.map((offer: any, index: number) => {
    const itinerary = offer.itineraries[0];
    const segments = itinerary.segments;
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    const departureTime = new Date(firstSegment.departure.at);
    const arrivalTime = new Date(lastSegment.arrival.at);

    // Calculate duration
    const durationMatch = itinerary.duration.match(/PT(\d+H)?(\d+M)?/);
    const hours = parseInt(durationMatch[1]?.replace('H', '') || '0');
    const minutes = parseInt(durationMatch[2]?.replace('M', '') || '0');
    const durationStr = `${hours}h ${minutes}m`;

    const carrierCode = firstSegment.carrierCode;
    const airlineName = carriers[carrierCode] || carrierCode;

    return {
      id: `amadeus-${offer.id}-${index}`,
      airline: airlineName,
      departureTime: departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      arrivalTime: arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      duration: durationStr,
      price: parseFloat(offer.price.total),
      stops: segments.length - 1,
      origin: firstSegment.departure.iataCode,
      destination: lastSegment.arrival.iataCode,
      flightNumber: `${carrierCode}${firstSegment.number}`,
      aircraft: firstSegment.aircraft?.code || 'N/A',
      bookingClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
    };
  });
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, origin, destination, date } = await req.json();
    
    console.log('[FlightSearch] Request:', { query, origin, destination, date });

    // Extract flight info from natural language query if provided
    let searchOrigin = origin;
    let searchDestination = destination;
    let searchDate = date;

    if (query) {
      const extracted = extractFlightInfo(query);
      searchOrigin = searchOrigin || extracted.origin;
      searchDestination = searchDestination || extracted.destination;
      searchDate = searchDate || extracted.date;
    }

    // Validate required params
    if (!searchOrigin || !searchDestination) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not determine origin and destination. Please specify "from [city] to [city]"',
          flights: [],
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get token and search flights
    const token = await getAmadeusToken();
    const amadeusData = await searchFlights(token, {
      origin: searchOrigin,
      destination: searchDestination,
      departureDate: searchDate || new Date().toISOString().split('T')[0],
      adults: 1,
      maxResults: 5,
    });

    const flights = transformFlights(amadeusData);

    console.log(`[FlightSearch] Returning ${flights.length} flights`);

    return new Response(
      JSON.stringify({ 
        flights,
        searchParams: {
          origin: searchOrigin,
          destination: searchDestination,
          date: searchDate,
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[FlightSearch] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Flight search failed',
        flights: [],
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
