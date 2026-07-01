export default function handler(req, res) {
  res.status(200).json({
    supabaseUrl:  process.env.SUPABASE_URL,
    supabaseAnon: process.env.SUPABASE_ANON_KEY,
    stripeLink:   process.env.STRIPE_LINK,
    tmdbKey:      process.env.TMDB_KEY,
  });
}