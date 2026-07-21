// test-connection.mjs
// Run with: node test-connection.mjs
// (Loads env vars manually since this runs outside Next.js)

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// crude .env.local parser so this works standalone
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf-8')
    .split('\n')
    .filter((line) => line.includes('='))
    .map((line) => line.split('=').map((s) => s.trim()))
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data, error } = await supabase.from('users').select('*')

if (error) {
  console.error('❌ Connection failed:', error.message)
  process.exit(1)
} else {
  console.log(`✅ Connected! Found ${data.length} users:`)
  console.log(data.map((u) => u.name))
}