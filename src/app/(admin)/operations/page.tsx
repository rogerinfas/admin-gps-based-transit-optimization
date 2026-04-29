import PageShell from "@/components/layout/page-shell";
import { OperationsDashboard } from "./_components/dashboard";
import { getOperationsDashboardData } from "./_utils/get-operations-dashboard-data";

export default async function OperationsPage() {
  const dashboardData = await getOperationsDashboardData();
  return (
    <PageShell navbarVariant="dark">
      <OperationsDashboard data={dashboardData} />
    </PageShell>
  );
}
