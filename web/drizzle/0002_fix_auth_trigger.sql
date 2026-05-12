-- Fix voor de auth trigger zodat Google OAuth werkt.
-- Probleem: SECURITY DEFINER zonder search_path + ontbrekende grant voor
-- supabase_auth_admin (de role waar auth-flows onder lopen).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'agency_admin')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Slik de fout zodat de auth-signup nooit faalt op profile-creatie.
    -- We loggen wel.
    RAISE WARNING 'handle_new_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant executie aan supabase_auth_admin (de role die de trigger triggert)
GRANT EXECUTE ON FUNCTION public.handle_new_user TO supabase_auth_admin;
GRANT INSERT, SELECT ON public.users TO supabase_auth_admin;

-- Drop + recreate trigger om wijziging te activeren
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
