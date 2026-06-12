import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase/server';

const PUBLIC_PATHS = new Set(['/login']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect, url } = context;

  // Deja pasar assets estáticos sin chequear sesión
  if (/\.[a-zA-Z0-9]+$/.test(url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServerClient(request, cookies);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.supabase = supabase;
  context.locals.user = user;

  const isPublicPath = PUBLIC_PATHS.has(url.pathname);

  if (!user && !isPublicPath) {
    return redirect('/login');
  }

  if (user && isPublicPath) {
    return redirect('/');
  }

  return next();
});
