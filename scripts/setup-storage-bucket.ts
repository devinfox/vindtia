/**
 * Setup script to create the user-photos storage bucket in Supabase
 *
 * Run with: npx tsx scripts/setup-storage-bucket.ts
 *
 * Or create manually in Supabase Dashboard:
 * 1. Go to Storage in your Supabase project
 * 2. Click "New bucket"
 * 3. Name: "user-photos"
 * 4. Enable "Public bucket" (so images can be displayed)
 * 5. Set file size limit to 10MB
 * 6. Allow mime types: image/jpeg, image/png, image/webp
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBucket() {
  console.log('Setting up user-photos storage bucket...\n');

  // Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError);
    process.exit(1);
  }

  const existingBucket = buckets?.find(b => b.name === 'user-photos');

  if (existingBucket) {
    console.log('✓ Bucket "user-photos" already exists');
  } else {
    // Create the bucket
    const { data, error: createError } = await supabase.storage.createBucket('user-photos', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
      process.exit(1);
    }

    console.log('✓ Created bucket "user-photos"');
  }

  // Set up RLS policies for the bucket
  console.log('\nNote: You may need to set up RLS policies in the Supabase Dashboard:');
  console.log('1. Go to Storage > Policies');
  console.log('2. For "user-photos" bucket, add these policies:');
  console.log('');
  console.log('   SELECT (view): Allow users to view their own photos');
  console.log('   - Policy: (bucket_id = \'user-photos\' AND auth.uid()::text = (storage.foldername(name))[1])');
  console.log('');
  console.log('   INSERT (upload): Allow users to upload to their own folder');
  console.log('   - Policy: (bucket_id = \'user-photos\' AND auth.uid()::text = (storage.foldername(name))[1])');
  console.log('');
  console.log('   DELETE: Allow users to delete their own photos');
  console.log('   - Policy: (bucket_id = \'user-photos\' AND auth.uid()::text = (storage.foldername(name))[1])');
  console.log('');
  console.log('Or since the bucket is public, you can also set a simpler policy that allows authenticated users to manage their folder.');

  console.log('\n✓ Setup complete!');
}

setupStorageBucket().catch(console.error);
