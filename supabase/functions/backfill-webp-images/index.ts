import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { ImagePool } from 'https://esm.sh/@squoosh/lib@0.5.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUCKETS = ['assets', 'products', 'categories', 'blogs', 'success-stories'];
const QUALITY = 85;
const DELETE_ORIGINALS = false; // Set to true to delete original files

async function convertToWebP(imageBuffer: ArrayBuffer): Promise<Uint8Array> {
  const imagePool = new ImagePool(1);

  try {
    const image = imagePool.ingestImage(imageBuffer);
    await image.decoded;

    await image.encode({
      webp: {
        quality: QUALITY,
      },
    });

    const encodedImage = await image.encodedWith.webp;

    if (!encodedImage) {
      throw new Error('WebP encoding failed');
    }

    return encodedImage.binary;
  } finally {
    await imagePool.close();
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let totalConverted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const details: string[] = [];

    console.log('Starting WebP backfill conversion...');

    for (const bucketId of BUCKETS) {
      console.log(`\n=== Processing bucket: ${bucketId} ===`);
      
      // List all files in bucket
      const { data: files, error: listError } = await supabase.storage
        .from(bucketId)
        .list('', {
          limit: 1000,
          offset: 0,
        });

      if (listError) {
        console.error(`Error listing files in ${bucketId}:`, listError);
        details.push(`❌ ${bucketId}: Failed to list files`);
        totalErrors++;
        continue;
      }

      if (!files || files.length === 0) {
        console.log(`No files found in ${bucketId}`);
        details.push(`⚪ ${bucketId}: No files found`);
        continue;
      }

      console.log(`Found ${files.length} files in ${bucketId}`);

      for (const file of files) {
        const filePath = file.name;
        const mimeType = file.metadata?.mimetype || '';

        // Skip if not an image
        if (!mimeType.startsWith('image/')) {
          console.log(`Skipping non-image: ${filePath}`);
          totalSkipped++;
          continue;
        }

        // Skip if already WebP
        if (mimeType === 'image/webp' || filePath.toLowerCase().endsWith('.webp')) {
          console.log(`Skipping existing WebP: ${filePath}`);
          totalSkipped++;
          continue;
        }

        try {
          console.log(`Converting: ${bucketId}/${filePath}`);

          // Download original
          const { data: fileData, error: downloadError } = await supabase.storage
            .from(bucketId)
            .download(filePath);

          if (downloadError || !fileData) {
            console.error(`Download error for ${filePath}:`, downloadError);
            details.push(`❌ ${bucketId}/${filePath}: Download failed`);
            totalErrors++;
            continue;
          }

          // Convert to WebP
          const imageBuffer = await fileData.arrayBuffer();
          const webpBuffer = await convertToWebP(imageBuffer);

          // Generate WebP filename
          const webpPath = filePath.replace(/\.[^.]+$/, '.webp');

          // Upload WebP version
          const webpBlob = new Blob([new Uint8Array(webpBuffer)], { type: 'image/webp' });

          const { error: uploadError } = await supabase.storage
            .from(bucketId)
            .upload(webpPath, webpBlob, {
              contentType: 'image/webp',
              cacheControl: '3600',
              upsert: true,
            });

          if (uploadError) {
            console.error(`Upload error for ${webpPath}:`, uploadError);
            details.push(`❌ ${bucketId}/${filePath}: Upload failed`);
            totalErrors++;
            continue;
          }

          console.log(`✓ Converted: ${bucketId}/${filePath} → ${webpPath}`);
          details.push(`✓ ${bucketId}/${filePath} → ${webpPath}`);
          totalConverted++;

          // Optionally delete original
          if (DELETE_ORIGINALS && webpPath !== filePath) {
            try {
              const { error: deleteError } = await supabase.storage
                .from(bucketId)
                .remove([filePath]);

              if (deleteError) {
                console.warn(`Failed to delete original: ${filePath}`, deleteError);
              } else {
                console.log(`  Deleted original: ${filePath}`);
              }
            } catch (deleteErr) {
              console.warn(`Error during deletion: ${filePath}`, deleteErr);
            }
          }

        } catch (error) {
          console.error(`Conversion error for ${filePath}:`, error);
          details.push(`❌ ${bucketId}/${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          totalErrors++;
        }
      }
    }

    const summary = {
      converted: totalConverted,
      skipped: totalSkipped,
      errors: totalErrors,
      details: details.slice(0, 100), // Limit details to prevent huge responses
    };

    console.log('\n=== Backfill Complete ===');
    console.log(`Converted: ${totalConverted}`);
    console.log(`Skipped: ${totalSkipped}`);
    console.log(`Errors: ${totalErrors}`);

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        converted: 0,
        skipped: 0,
        errors: 1,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
