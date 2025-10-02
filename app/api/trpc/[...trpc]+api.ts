import app from '@/backend/hono';

export async function GET(request: Request) {
  try {
    console.log('[API Route] GET request:', request.url);
    const response = await app.fetch(request);
    console.log('[API Route] GET response status:', response.status);
    return response;
  } catch (error) {
    console.error('[API Route] GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API Route] POST request:', request.url);
    const response = await app.fetch(request);
    console.log('[API Route] POST response status:', response.status);
    return response;
  } catch (error) {
    console.error('[API Route] POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    console.log('[API Route] PUT request:', request.url);
    return await app.fetch(request);
  } catch (error) {
    console.error('[API Route] PUT error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('[API Route] DELETE request:', request.url);
    return await app.fetch(request);
  } catch (error) {
    console.error('[API Route] DELETE error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    console.log('[API Route] PATCH request:', request.url);
    return await app.fetch(request);
  } catch (error) {
    console.error('[API Route] PATCH error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  try {
    console.log('[API Route] OPTIONS request:', request.url);
    return await app.fetch(request);
  } catch (error) {
    console.error('[API Route] OPTIONS error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
