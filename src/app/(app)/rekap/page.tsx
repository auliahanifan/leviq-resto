import { getAllPaidOrders } from "@/lib/rekap";
import { RekapDashboard } from "@/components/RekapDashboard";

export default async function RekapPage() {
  const orders = await getAllPaidOrders();
  return <RekapDashboard orders={orders} />;
}
