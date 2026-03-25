import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key] = value.replace(/"/g, '');
  }
});

const supabase = createClient(
  envVars.VITE_SUPABASE_URL,
  envVars.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function checkData() {
  console.log('Checking products...');

  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('product_id, product_name, monthly_price, lifetime_price')
    .eq('is_active', true)
    .limit(3);

  if (prodError) {
    console.error('Error fetching products:', prodError);
  } else {
    console.log('Found products:', products?.length || 0);
    if (products && products.length > 0) {
      products.forEach(product => {
        console.log(`- ${product.product_name}: Monthly ₹${product.monthly_price}, Lifetime ₹${product.lifetime_price}`);
      });
    }
  }

  console.log('Checking marketplace orders...');

  const { data: orders, error: orderError } = await supabase
    .from('marketplace_orders')
    .select('*')
    .limit(3);

  if (orderError) {
    console.error('Error fetching orders:', orderError);
  } else {
    console.log('Found orders:', orders?.length || 0);
    if (orders && orders.length > 0) {
      orders.forEach(order => {
        console.log(`Order:`, JSON.stringify(order, null, 2));
      });
    }
  }
}

checkData().catch(console.error);