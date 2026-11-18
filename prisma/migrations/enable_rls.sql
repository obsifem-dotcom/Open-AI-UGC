-- Enable Row Level Security (RLS) on all public tables
-- Fixes Supabase security advisor warning: "Table publicly accessible and data sensitive"

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Creation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;

-- Revoke public PostgREST API access (anon and authenticated roles)
REVOKE ALL ON TABLE public."User" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Account" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Session" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Creation" FROM anon, authenticated;
REVOKE ALL ON TABLE public."VerificationToken" FROM anon, authenticated;
