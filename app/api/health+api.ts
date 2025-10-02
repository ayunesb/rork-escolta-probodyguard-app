export async function GET() {
  console.log('[Health Check] API is running');
  return Response.json({ 
    status: 'ok', 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
}
