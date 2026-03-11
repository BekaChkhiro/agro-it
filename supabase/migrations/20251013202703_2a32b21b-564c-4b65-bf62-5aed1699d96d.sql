-- Create storage bucket for assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true);

-- Allow everyone to view assets
CREATE POLICY "Assets are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'assets');

-- Allow admins to upload assets
CREATE POLICY "Admins can upload assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update assets
CREATE POLICY "Admins can update assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete assets
CREATE POLICY "Admins can delete assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);