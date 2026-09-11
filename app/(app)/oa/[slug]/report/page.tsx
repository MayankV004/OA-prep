import { redirect } from 'next/navigation';

export default async function ReportRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/oa/${slug}`);
}
