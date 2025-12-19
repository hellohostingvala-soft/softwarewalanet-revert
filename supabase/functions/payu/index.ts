import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYU_MERCHANT_KEY = Deno.env.get('PAYU_MERCHANT_KEY');
const PAYU_SALT_KEY = Deno.env.get('PAYU_SALT_KEY');
const PAYU_BASE_URL = 'https://test.payu.in'; // Use 'https://secure.payu.in' for production

async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createPaymentHash(params: {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}) {
  console.log('Creating PayU payment hash for txnid:', params.txnid);
  
  const { txnid, amount, productinfo, firstname, email, udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '' } = params;
  
  // PayU hash formula: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
  const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${PAYU_SALT_KEY}`;
  
  const hash = await generateHash(hashString);
  console.log('Payment hash generated successfully');
  
  return {
    key: PAYU_MERCHANT_KEY,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    hash,
    surl: params.udf1 || '', // Success URL passed in udf1
    furl: params.udf2 || '', // Failure URL passed in udf2
    payuBaseUrl: PAYU_BASE_URL,
  };
}

async function verifyPaymentHash(params: {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  status: string;
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}) {
  console.log('Verifying PayU payment hash for txnid:', params.txnid);
  
  const { txnid, amount, productinfo, firstname, email, status, hash, udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '' } = params;
  
  // Reverse hash formula: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const reverseHashString = `${PAYU_SALT_KEY}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
  
  const calculatedHash = await generateHash(reverseHashString);
  const isValid = calculatedHash === hash;
  
  console.log('Payment verification result:', isValid ? 'VALID' : 'INVALID');
  
  return {
    isValid,
    status,
    txnid,
  };
}

function generateTxnId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN${timestamp}${random}`.toUpperCase();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    
    console.log(`PayU action requested: ${action}`);

    if (!PAYU_MERCHANT_KEY || !PAYU_SALT_KEY) {
      console.error('PayU credentials not configured');
      throw new Error('PayU credentials not configured');
    }

    let result;

    switch (action) {
      case 'create-payment':
        if (!params.amount || !params.productinfo || !params.firstname || !params.email) {
          throw new Error('Missing required fields: amount, productinfo, firstname, email');
        }
        const txnid = params.txnid || generateTxnId();
        result = await createPaymentHash({
          txnid,
          amount: params.amount,
          productinfo: params.productinfo,
          firstname: params.firstname,
          email: params.email,
          udf1: params.successUrl || '',
          udf2: params.failureUrl || '',
        });
        break;

      case 'verify-payment':
        if (!params.txnid || !params.amount || !params.productinfo || !params.firstname || !params.email || !params.status || !params.hash) {
          throw new Error('Missing required fields for verification');
        }
        result = await verifyPaymentHash(params);
        break;

      case 'generate-txnid':
        result = { txnid: generateTxnId() };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('PayU function error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
