import { getSession } from "~/server/better-auth/server";
import { redirect } from "next/navigation";
import { AppLayout } from "~/components/layout/app-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/signin");
  }

  return <AppLayout>{children}</AppLayout>;
}
