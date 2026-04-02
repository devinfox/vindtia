/**
 * Setup storage policies for user-photos bucket
 * Run with: npx tsx scripts/setup-storage-policies.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPolicies() {
  console.log('Setting up storage policies...\n');

  const policies = [
    {
      name: 'Users can upload their own photos',
      sql: `CREATE POLICY "Users can upload their own photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'user-photos' AND (storage.foldername(name))[1] = auth.uid()::text);`
    },
    {
      name: 'Users can update their own photos',
      sql: `CREATE POLICY "Users can update their own photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'user-photos' AND (storage.foldername(name))[1] = auth.uid()::text);`
    },
    {
      name: 'Users can delete their own photos',
      sql: `CREATE POLICY "Users can delete their own photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'user-photos' AND (storage.foldername(name))[1] = auth.uid()::text);`
    },
    {
      name: 'Public can view user photos',
      sql: `CREATE POLICY "Public can view user photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'user-photos');`
    }
  ];

  for (const policy of policies) {
    try {
      // Use the SQL editor endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey!,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql: policy.sql })
      });

      if (response.ok) {
        console.log(`✓ Created policy: ${policy.name}`);
      } else {
        const text = await response.text();
        if (text.includes('already exists')) {
          console.log(`- Policy already exists: ${policy.name}`);
        } else {
          console.log(`! Could not create policy: ${policy.name}`);
        }
      }
    } catch (err) {
      console.log(`! Error with policy: ${policy.name}`);
    }
  }

  console.log('\n✓ Policy setup complete!');
  console.log('\nIf any policies failed, you can add them manually in the Supabase Dashboard:');
  console.log('1. Go to Storage > Policies');
  console.log('2. Add the policies from the migration file');
}

setupPolicies().catch(console.error);
