import { redirect } from 'next/navigation';

export default async function VariationRedirectPage({
  params,
}: {
  params: Promise<{ pattern: string; variation: string }>;
}) {
  const { pattern, variation } = await params;
  redirect(`/dsa/${pattern}/${variation}/practice`);
}
