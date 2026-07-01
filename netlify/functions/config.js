// netlify/functions/config.js
exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      supabaseUrl:  process.env.SUPABASE_URL,
      supabaseAnon: process.env.SUPABASE_ANON_KEY,
      stripeLink:   process.env.STRIPE_LINK,
      tmdbKey:      process.env.TMDB_KEY,
    }),
  };
};