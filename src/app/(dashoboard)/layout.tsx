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
    redirect("/sign-up");
  }

  return (
    <SidebarProvider>
      <DashboardSideBar />
      <main className="flex flex-col h-screen w-screen bg-muted">
        <DashboardNavbar />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Layout;
