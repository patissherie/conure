import { supabase } from '@/lib/supabaseClient'

// Sign up (new user)
async function handleSignUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    console.error(error.message)
    return
  }
  // If email confirmation is ON (default), user must click a link in their inbox
  // If you turn confirmation OFF (Supabase dashboard), they're logged in immediately
}

// Log in (existing user)
async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error(error.message)
    return
  }
  // data.session now exists — redirect to your main app page
}

// async function handleGoogleLogin() {
//   const { error } = await supabase.auth.signInWithOAuth({
//     provider: 'google',
//     options: {
//       redirectTo: `${window.location.origin}/auth/callback`,
//     },
//   })
//   if (error) console.error(error.message)
//   // No manual redirect needed after this — Supabase sends the browser to Google,
//   // then back to your redirectTo URL automatically
// }



