import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import SharePresentationClient from './SharePresentationClient';

export default async function SharePage({ params }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: presentation, error } = await supabase
    .from('presentations')
    .select('topic, recipes, theme_runtime')
    .eq('share_id', params.shareId)
    .eq('is_public', true)
    .single();
  
  if (error || !presentation) {
    notFound();
  }

  return <SharePresentationClient presentation={presentation} />;
}
