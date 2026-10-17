import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/account';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  const redirectUrl = new URL(next, requestUrl.origin);

  // If user cancelled or OAuth error returned from Google/Supabase
  if (error) {
    redirectUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(redirectUrl);
  }

  // If code is present, attempt server exchange and forward to client for PKCE finalization
  if (code) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.exchangeCodeForSession(code);
      } catch (err) {
        // In PKCE flows initiated from the browser, the code verifier lives in client localStorage.
        // Forwarding code to destination ensures browser client seamlessly finalizes session.
        console.warn('Notice: Server code exchange bypassed; client will finalize in browser:', err);
      }
    }
    redirectUrl.searchParams.set('code', code);
  }

  // Redirect customer back to their authenticated account dashboard or specified destination
  return NextResponse.redirect(redirectUrl);
}
