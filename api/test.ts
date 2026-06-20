export default function handler(_req: Request) {
  return new Response(JSON.stringify({
    ok: true,
    time: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? 'SET' : 'MISSING',
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'MISSING',
    },
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
