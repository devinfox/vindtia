import Replicate from 'replicate';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.REPLICATE_API_TOKEN;

if (!token) {
  console.log('❌ REPLICATE_API_TOKEN not found in .env.local');
  process.exit(1);
}

console.log('✓ Token found:', token.substring(0, 8) + '...');

const replicate = new Replicate({ auth: token });

try {
  const model = await replicate.models.get('cuuupid', 'idm-vton');
  console.log('✓ API connection successful!');
  console.log('  Model: IDM-VTON');
  console.log('  Latest version:', model.latest_version?.id?.substring(0, 12) + '...');
} catch (err) {
  console.log('❌ API error:', err.message);
}
