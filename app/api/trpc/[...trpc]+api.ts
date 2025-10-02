import app from '@/backend/hono';

const handleRequest = async (request: Request, method: string) => {
  try {
    const url = new URL(request.url);
    console.log(`[API Route ${method}] Request:`, url.pathname);
    console.log(`[API Route ${method}] Full URL:`, request.url);
    
    const response = await app.fetch(request);
    
    console.log(`[API Route ${method}] Response status:`, response.status);
    console.log(`[API Route ${method}] Response content-type:`, response.headers.get('content-type'));
    
    return response;
  } catch (error) {
    console.error(`[API Route ${method}] Error:`, error);
    return Response.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      method,
      url: request.url
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export async function GET(request: Request) {
  return handleRequest(request, 'GET');
}

export async function POST(request: Request) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: Request) {
  return handleRequest(request, 'PUT');
}

export async function DELETE(request: Request) {
  return handleRequest(request, 'DELETE');
}

export async function PATCH(request: Request) {
  return handleRequest(request, 'PATCH');
}

export async function OPTIONS(request: Request) {
  return handleRequest(request, 'OPTIONS');
}
