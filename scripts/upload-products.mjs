/**
 * Product Upload Script
 * Run with: node scripts/upload-products.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Hardcoded config (from .env.local)
const SUPABASE_URL = 'https://mkjofdvohtfkpjcvabxr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ram9mZHZvaHRma3BqY3ZhYnhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM5ODE4NSwiZXhwIjoyMDc4OTc0MTg1fQ.v5r1hTnTxk3tAYVPhwf_0ttt1hH3g2fAzK5RUoVQPjM';

const CSV_PATH = '/Users/devin/Downloads/VINDTIA 04_04_26 ECommerce Upload - Sheet1.csv';
const IMAGES_DIR = '/Users/devin/Downloads/VINDTIA-ECOM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Extract era from description
function extractEra(description) {
  const eraMatch = description.match(/(\d{2})'s|early (\d{2})'s|late (\d{2})'s/i);
  if (eraMatch) {
    const yearStr = eraMatch[1] || eraMatch[2] || eraMatch[3];
    const num = parseInt(yearStr);
    if (num >= 80 && num <= 89) return '1980s';
    if (num >= 90 && num <= 99) return '1990s';
    if (num >= 0 && num <= 19) return '2000s';
  }
  return null;
}

// Extract material from description
function extractMaterial(description) {
  const descLower = description.toLowerCase();
  if (descLower.includes('cashmere')) return 'cashmere';
  if (descLower.includes('silk')) return 'silk';
  if (descLower.includes('wool') || descLower.includes('tweed')) return 'wool';
  if (descLower.includes('cotton') || descLower.includes('corduroy')) return 'cotton';
  if (descLower.includes('linen')) return 'linen';
  if (descLower.includes('leather') || descLower.includes('mink') || descLower.includes('fur') || descLower.includes('lamb skin')) return 'leather';
  if (descLower.includes('velvet')) return 'velvet';
  if (descLower.includes('satin')) return 'satin';
  if (descLower.includes('lace')) return 'lace';
  if (descLower.includes('denim')) return 'denim';
  if (descLower.includes('jersey') || descLower.includes('mesh') || descLower.includes('knit')) return 'mixed';
  return null;
}

// Map color
function mapColor(colour) {
  const colorLower = colour.toLowerCase();
  if (colorLower.includes('black')) return 'black';
  if (colorLower.includes('white') || colorLower.includes('cream')) return 'white';
  if (colorLower.includes('navy')) return 'navy';
  if (colorLower.includes('blue')) return 'blue';
  if (colorLower.includes('green')) return 'green';
  if (colorLower.includes('brown') || colorLower.includes('tan') || colorLower.includes('chocolate')) return 'brown';
  if (colorLower.includes('beige')) return 'beige';
  if (colorLower.includes('gold')) return 'gold';
  if (colorLower.includes('silver') || colorLower.includes('metallic')) return 'silver';
  if (colorLower.includes('pink') || colorLower.includes('peach')) return 'pink';
  if (colorLower.includes('purple')) return 'purple';
  if (colorLower.includes('red') || colorLower.includes('orange')) return 'red';
  if (colorLower.includes('yellow')) return 'beige';
  return 'beige';
}

// Map category
function mapCategory(type) {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('dress')) return 'dresses';
  if (typeLower.includes('skirt')) return 'bottoms';
  if (typeLower.includes('jacket') || typeLower.includes('blazer') || typeLower.includes('coat')) return 'jackets';
  if (typeLower.includes('set') || typeLower.includes('suit')) return 'dresses';
  return 'tops';
}

// Get style from SKU
function getStyle(sku) {
  if (sku.startsWith('F')) return 'feminine';
  if (sku.startsWith('M')) return 'masculine';
  return 'unisex';
}

// Parse CSV
function parseCSV(csvPath) {
  console.log('Reading CSV from:', csvPath);
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ''));

    if (values.length >= 7 && values[0]) {
      products.push({
        sku: values[0],
        designer: values[1],
        type: values[2],
        description: values[3],
        colour: values[4],
        size: values[5],
        price: parseFloat(values[6]) || 0,
      });
    }
  }

  return products;
}

// Get images for SKU
function getImagesForSku(sku) {
  const files = fs.readdirSync(IMAGES_DIR);
  return files
    .filter(f => f.startsWith(sku + '-') && /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/-(\d+)\./)?.[1] || '0');
      const numB = parseInt(b.match(/-(\d+)\./)?.[1] || '0');
      return numA - numB;
    })
    .map(f => path.join(IMAGES_DIR, f));
}

// Upload image
async function uploadImage(imagePath) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(fileName);
    const storagePath = `products/${timestamp}-${randomStr}${ext}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType: `image/jpeg`,
        upsert: false,
      });

    if (error) {
      console.error(`  Failed to upload ${fileName}:`, error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    return urlData.publicUrl;
  } catch (err) {
    console.error(`  Error uploading:`, err.message);
    return null;
  }
}

// Get or create designer
async function getOrCreateDesigner(name) {
  const { data: existing } = await supabase
    .from('designers')
    .select('id')
    .ilike('name', name)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from('designers')
    .insert([{ name }])
    .select('id')
    .single();

  if (error) {
    console.error(`  Failed to create designer ${name}:`, error.message);
    return null;
  }

  console.log(`  Created new designer: ${name}`);
  return created.id;
}

// Create product
async function createProduct(csvProduct, designerId, mediaUrls) {
  const era = extractEra(csvProduct.description);
  const material = extractMaterial(csvProduct.description);
  const color = mapColor(csvProduct.colour);
  const category = mapCategory(csvProduct.type);
  const style = getStyle(csvProduct.sku);
  const name = csvProduct.description.substring(0, 200);

  const { data: product, error: productError } = await supabase
    .from('products')
    .insert([{
      name,
      sku: csvProduct.sku,
      designer_id: designerId,
      description: csvProduct.description,
      price_per_rental: csvProduct.price,
      size: csvProduct.size,
      color,
      category,
      condition: 'Good',
      era,
      material,
      style,
      archive: false,
      tier_required: 1,
    }])
    .select('id')
    .single();

  if (productError) {
    console.error(`  Failed to create product:`, productError.message);
    return false;
  }

  // Create inventory
  await supabase.from('inventory').insert([{ product_id: product.id, quantity: 1 }]);

  // Create media
  if (mediaUrls.length > 0) {
    const mediaRecords = mediaUrls.map((url, index) => ({
      product_id: product.id,
      url,
      sort_order: index,
    }));
    await supabase.from('product_media').insert(mediaRecords);
  }

  return true;
}

// Main
async function main() {
  console.log('=== Vindtia Product Upload ===\n');

  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV not found:', CSV_PATH);
    process.exit(1);
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('Images folder not found:', IMAGES_DIR);
    process.exit(1);
  }

  const csvProducts = parseCSV(CSV_PATH);
  console.log(`Found ${csvProducts.length} products in CSV\n`);

  let success = 0;
  let failed = 0;

  for (const csvProduct of csvProducts) {
    console.log(`Processing: ${csvProduct.sku}`);

    const designerId = await getOrCreateDesigner(csvProduct.designer);
    const imagePaths = getImagesForSku(csvProduct.sku);
    console.log(`  Found ${imagePaths.length} images`);

    const mediaUrls = [];
    for (const imgPath of imagePaths) {
      const url = await uploadImage(imgPath);
      if (url) {
        mediaUrls.push(url);
        console.log(`  Uploaded: ${path.basename(imgPath)}`);
      }
    }

    const ok = await createProduct(csvProduct, designerId, mediaUrls);
    if (ok) {
      success++;
      console.log(`  ✓ Created product`);
    } else {
      failed++;
    }
  }

  console.log('\n=== Done ===');
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
