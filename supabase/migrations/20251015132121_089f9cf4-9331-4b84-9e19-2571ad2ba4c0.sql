-- Add explicit deny policy for authenticated non-admin users on contact_submissions
-- This provides defense-in-depth protection for PII data
CREATE POLICY "Deny non-admin authenticated SELECT on contact_submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (false);

-- Allow admins to manage user roles for role assignment
-- This enables programmatic admin role management
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));