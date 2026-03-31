-- Function to atomically increment redirect hit count
CREATE OR REPLACE FUNCTION public.increment_redirect_hit(redirect_from_path text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.redirects
  SET hit_count = COALESCE(hit_count, 0) + 1,
      last_hit_at = now()
  WHERE from_path = redirect_from_path
    AND is_active = true;
$$;

-- Allow anonymous users to call this function (needed from middleware)
GRANT EXECUTE ON FUNCTION public.increment_redirect_hit(text) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_redirect_hit(text) TO authenticated;
