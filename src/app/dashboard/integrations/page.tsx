"use client";

import { api } from "~/trpc/react";
import { Mail, Calendar, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useSearchParams } from "next/navigation";

export default function IntegrationsPage() {
  const { data: status, isLoading } = api.integrations.getStatus.useQuery();
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected");

  const handleConnect = (integration: string) => {
    window.location.href = `/api/connect?plugin=${integration}`;
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-3xl font-bold">Integrations</h1>
      <p className="mb-8 text-zinc-500">
        Connect your accounts to power your command center.
      </p>

      {connected && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">
            Successfully connected {connected}!
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* Gmail Card */}
        <div className="bg-card flex items-center justify-between rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Mail className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gmail</h3>
              <p className="text-sm text-zinc-500">
                Sync emails, threads, and attachments.
              </p>
            </div>
          </div>
          <Button
            variant={status?.gmail ? "outline" : "default"}
            disabled={isLoading || status?.gmail}
            onClick={() => handleConnect("gmail")}
          >
            {isLoading
              ? "Checking..."
              : status?.gmail
                ? "Connected"
                : "Connect"}
          </Button>
        </div>

        {/* Google Calendar Card */}
        <div className="bg-card flex items-center justify-between rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Google Calendar</h3>
              <p className="text-sm text-zinc-500">
                Sync upcoming events and meetings.
              </p>
            </div>
          </div>
          <Button
            variant={status?.calendar ? "outline" : "default"}
            disabled={isLoading || status?.calendar}
            onClick={() => handleConnect("googlecalendar")}
          >
            {isLoading
              ? "Checking..."
              : status?.calendar
                ? "Connected"
                : "Connect"}
          </Button>
        </div>
      </div>
    </div>
  );
}
