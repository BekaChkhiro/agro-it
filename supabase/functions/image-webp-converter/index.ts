import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { ImagePool } from 'https://esm.sh/@squoosh/lib@0.5.3';

// Configuration
const DELETE_ORIGINAL_FILES = false; // Set to true to auto-delete original files after conversion

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StorageWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: {
    id: string;
    name: string;
    bucket_id: string;
    owner: string;
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
    metadata: {
      mimetype?: string;
      size?: number;
    };
  };
  old_record: null | Record<string, unknown>;
}

async function convertToWebP(imageBuffer: ArrayBuffer): Promise<Uint8Array> {
  const imagePool = new ImagePool(1); // Use 1 thread for Deno Edge Functions

  try {
    const image = imagePool.ingestImage(imageBuffer);

    await image.decoded;

    await image.encode({
      webp: {
        quality: 85,
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
  // Handle CORS preflight
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
          status: 'error', 
          details: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const payload: StorageWebhookPayload = await req.json();
    
    console.log('Received webhook:', JSON.stringify(payload, null, 2));

    // Only process INSERT events
    if (payload.type !== 'INSERT') {
      console.log(`Skipping: Event type is ${payload.type}, not INSERT`);
      return new Response(
        JSON.stringify({ 
          status: 'skipped', 
          details: `Event type ${payload.type} not supported` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { record } = payload;
    const bucketId = record.bucket_id;
    const filePath = record.name;
    const mimeType = record.metadata?.mimetype || '';

    console.log(`Processing file: ${bucketId}/${filePath} (${mimeType})`);

    // Skip if not an image
    if (!mimeType.startsWith('image/')) {
      console.log('Skipping: Not an image file');
      return new Response(
        JSON.stringify({ 
          status: 'skipped', 
          details: 'File is not an image' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Skip if already WebP
    if (mimeType === 'image/webp' || filePath.toLowerCase().endsWith('.webp')) {
      console.log('Skipping: Already WebP format');
      return new Response(
        JSON.stringify({ 
          status: 'skipped', 
          details: 'File is already in WebP format' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Download the original file
    console.log('Downloading original file...');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketId)
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          details: `Failed to download file: ${downloadError?.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Convert to WebP
    console.log('Converting to WebP...');
    const imageBuffer = await fileData.arrayBuffer();
    const webpBuffer = await convertToWebP(imageBuffer);

    // Generate WebP filename
    const webpPath = filePath.replace(/\.[^.]+$/, '.webp');
    
    console.log(`Uploading WebP version to: ${bucketId}/${webpPath}`);
    
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
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          details: `Failed to upload WebP: ${uploadError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('WebP conversion complete');

    // Optionally delete original file
    let deletionNote = '';
    if (DELETE_ORIGINAL_FILES && webpPath !== filePath) {
      try {
        const { error: deleteError } = await supabase.storage
          .from(bucketId)
          .remove([filePath]);

        if (deleteError) {
          console.warn('Failed to delete original file:', deleteError);
          deletionNote = ` (original kept: ${deleteError.message})`;
        } else {
          console.log('Original file deleted');
          deletionNote = ' (original deleted)';
        }
      } catch (deleteErr) {
        console.warn('Error during deletion:', deleteErr);
        deletionNote = ' (original kept: deletion error)';
      }
    }

    return new Response(
      JSON.stringify({ 
        status: 'converted', 
        details: `Converted ${filePath} to ${webpPath}${deletionNote}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
