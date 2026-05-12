import { redirect } from "next/navigation";
import { OperatorSidebar } from "@/components/shell/operator-sidebar";
import { getCurrentContext } from "@/lib/auth/current";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login?next=/admin");
  if (ctx.profile?.role !== "operator") {
    // Niet-operators → naar portal
    redirect("/portal");
  }

  return (
    <div className="flex h-screen w-full">
      <OperatorSidebar hasAgency={!!ctx.agency} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
