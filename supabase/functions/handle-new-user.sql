
-- This file is for reference only. Execute this in the SQL editor if the handle_new_user function needs to be updated.

-- Drop the trigger before modifying the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now recreate the handle_new_user function with improved error handling
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  role_text text;
BEGIN
  -- Extract role from metadata with fallback to 'staff'
  role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'staff');
  
  -- Validate role value against allowed values
  IF role_text NOT IN ('doctor', 'staff', 'admin') THEN
    role_text := 'staff';
  END IF;
  
  -- Create the profile using text-based role validation instead of type casting
  INSERT INTO public.profiles (id, username, name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    role_text::user_role -- Cast after validation to ensure it's a valid value
  );
  
  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW; -- Still return NEW to allow the user creation even if profile creation fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger again
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
