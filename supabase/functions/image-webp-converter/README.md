# Image WebP Converter - Storage Webhook Handler

Automatically converts uploaded images to WebP format when they're added to Supabase Storage buckets.

## Features

- **Automatic conversion**: Converts images to WebP on upload
- **Smart skipping**: Skips files that are already WebP or non-images
- **Quality preservation**: Uses 85% quality and maintains original dimensions
- **Optional cleanup**: Can automatically delete original files after conversion
- **Multi-bucket support**: Works with multiple storage buckets

## Deployment

### 1. Deploy the Edge Function

```bash
supabase functions deploy image-webp-converter
```

### 2. Set Required Environment Variables

The function needs access to your Supabase service role key:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Note: `SUPABASE_URL` is automatically provided by the Supabase environment.

### 3. Register Storage Webhooks

You need to register webhooks for each bucket you want to monitor. Use the Supabase CLI:

```bash
# For the 'assets' bucket
supabase storage create-hook \
  --bucket-id assets \
  --event INSERT \
  --function-name image-webp-converter

# For the 'products' bucket
supabase storage create-hook \
  --bucket-id products \
  --event INSERT \
  --function-name image-webp-converter

# For the 'categories' bucket
supabase storage create-hook \
  --bucket-id categories \
  --event INSERT \
  --function-name image-webp-converter

# For the 'blogs' bucket
supabase storage create-hook \
  --bucket-id blogs \
  --event INSERT \
  --function-name image-webp-converter

# For the 'success-stories' bucket
supabase storage create-hook \
  --bucket-id success-stories \
  --event INSERT \
  --function-name image-webp-converter
```

Alternatively, you can set up webhooks via the Supabase Dashboard:
1. Go to Storage → Settings → Hooks
2. Create a new hook for each bucket
3. Set event type to `INSERT`
4. Set the function URL to your deployed edge function

## Configuration

### Enable/Disable Original File Deletion

By default, the function **keeps** the original files after converting them to WebP. To change this behavior:

1. Open `supabase/functions/image-webp-converter/index.ts`
2. Find the line near the top:
   ```typescript
   const DELETE_ORIGINAL_FILES = false;
   ```
3. Change it to:
   ```typescript
   const DELETE_ORIGINAL_FILES = true;
   ```
4. Redeploy the function

### Adjust WebP Quality

To change the conversion quality (default is 85):

1. Find the `convertToWebP` function
2. Modify the quality value:
   ```typescript
   await image.encode({
     webp: {
       quality: 85, // Change this value (0-100)
     },
   });
   ```

## How It Works

1. **Webhook Trigger**: When a file is uploaded to a monitored bucket, Supabase sends a webhook to this function
2. **Validation**: The function checks if the file is an image and not already WebP
3. **Download**: Downloads the original file using the service role key
4. **Conversion**: Uses @squoosh/lib to convert the image to WebP format
5. **Upload**: Uploads the WebP version with the same filename but `.webp` extension
6. **Cleanup** (optional): Deletes the original file if `DELETE_ORIGINAL_FILES` is enabled

## Supported Image Formats

- JPEG/JPG
- PNG
- GIF
- BMP
- TIFF
- Any format supported by @squoosh/lib

## Monitoring

Check the function logs to monitor conversions:

```bash
supabase functions logs image-webp-converter
```

## Response Format

The function returns JSON with the following structure:

```json
{
  "status": "converted" | "skipped" | "error",
  "details": "Description of what happened"
}
```

## Troubleshooting

### Images aren't being converted

1. Verify the webhook is registered: Check Supabase Dashboard → Storage → Settings → Hooks
2. Check function logs: `supabase functions logs image-webp-converter`
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
4. Verify the uploaded file is actually an image (check MIME type)

### Original files aren't being deleted

- Check that `DELETE_ORIGINAL_FILES` is set to `true`
- Review function logs for deletion errors
- Ensure the service role key has proper permissions

## Backfill Existing Images

To convert existing images that were uploaded before this webhook was set up, use the backfill script:

```bash
deno run --allow-net --allow-env tools/backfill-webp.ts \
  --buckets=assets,products,categories,blogs,success-stories \
  --quality=85
```

Add `--delete-originals` if you want to remove the source files after each successful conversion. Run with `--help` to see all options.

See `tools/backfill-webp.ts` for more details.
