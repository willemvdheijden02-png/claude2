// /admin/settings — platform-configuratie en systeemstatus

import Link from "next/link";
import { Topbar } from "@/components/shell/topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function AdminSettingsPage() {
  return (
    <>
      <Topbar
        title="Instellingen"
        description="Platform-configuratie en systeemstatus."
      />
      <div className="p-4 md:p-6 max-w-5xl">
        <div className="grid gap-4">
          {/* Platform */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[14px] font-semibold text-[var(--text-primary)]">
                Platform
              </CardTitle>
              <CardDescription className="text-[12px] text-[var(--text-tertiary)]">
                Algemene platform-informatie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-default)]">
                  <span className="text-[13px] text-[var(--text-secondary)]">Naam</span>
                  <span className="text-[13px] font-medium text-[var(--text-primary)]">Willoe Platform</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-default)]">
                  <span className="text-[13px] text-[var(--text-secondary)]">Versie</span>
                  <span className="text-[13px] font-mono text-[var(--text-secondary)]">v1.0.0</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[13px] text-[var(--text-secondary)]">Omgeving</span>
                  <Badge tone="success" className="h-[18px] px-2 text-[10px]">
                    PRODUCTION
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[14px] font-semibold text-[var(--text-primary)]">
                Database
              </CardTitle>
              <CardDescription className="text-[12px] text-[var(--text-tertiary)]">
                Databaseverbinding en -status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-default)]">
                  <span className="text-[13px] text-[var(--text-secondary)]">Provider</span>
                  <span className="text-[13px] font-medium text-[var(--text-primary)]">Supabase PostgreSQL</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[13px] text-[var(--text-secondary)]">Status</span>
                  <span className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                    <span className="size-2 rounded-full bg-green-500 inline-block" />
                    Verbonden
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[14px] font-semibold text-[var(--text-primary)]">
                Queue
              </CardTitle>
              <CardDescription className="text-[12px] text-[var(--text-tertiary)]">
                Achtergrondtaken en verwerking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-default)]">
                  <span className="text-[13px] text-[var(--text-secondary)]">Status</span>
                  <span className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                    <span className="size-2 rounded-full bg-green-500 inline-block" />
                    Background jobs actief
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[13px] text-[var(--text-secondary)]">Bekijken</span>
                  <Link
                    href="/admin/queue"
                    className="text-[13px] text-[var(--accent-500)] hover:underline"
                  >
                    Naar queue &rarr;
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
