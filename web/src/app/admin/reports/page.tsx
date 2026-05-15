// /admin/reports — placeholder voor platform-brede rapportages

import { Topbar } from "@/components/shell/topbar";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminReportsPage() {
  return (
    <>
      <Topbar
        title="Rapporten"
        description="Platform-brede rapportages — binnenkort beschikbaar"
      />
      <div className="p-4 md:p-6 max-w-5xl">
        <Card>
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-[15px] text-[var(--text-secondary)]">
                Rapporten worden hier beschikbaar gesteld in een toekomstige versie.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
