import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth"; // server-side Better Auth instance
import { DashboardSideBar } from "../modules/dashboard/ui/components/dashboard-sidebar";
import { DashboardNavbar } from "../modules/dashboard/ui/components/dashboard-navbar";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <DashboardSideBar />
      <main className="relative flex min-h-screen w-screen flex-col overflow-hidden bg-muted text-foreground">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_25%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_20%)]" />
        <div className="absolute inset-0 bg-grid opacity-35" />
        <div className="relative flex min-h-screen flex-col">
          <DashboardNavbar />
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Layout;
