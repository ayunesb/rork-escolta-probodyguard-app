import app from '@/backend/hono';

export async function GET(request: Request) {
  console.log('[API Route] GET request:', request.url);
  return app.fetch(request);
}

export async function POST(request: Request) {
  console.log('[API Route] POST request:', request.url);
  return app.fetch(request);
}

export async function PUT(request: Request) {
  console.log('[API Route] PUT request:', request.url);
  return app.fetch(request);
}

export async function DELETE(request: Request) {
  console.log('[API Route] DELETE request:', request.url);
  return app.fetch(request);
}

export async function PATCH(request: Request) {
  console.log('[API Route] PATCH request:', request.url);
  return app.fetch(request);
}

export async function OPTIONS(request: Request) {
  console.log('[API Route] OPTIONS request:', request.url);
  return app.fetch(request);
}
