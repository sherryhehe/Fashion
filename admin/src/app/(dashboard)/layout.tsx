import Layout from '@/components/layout/Layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout pageTitle="Dashboard">{children}</Layout>;
}
