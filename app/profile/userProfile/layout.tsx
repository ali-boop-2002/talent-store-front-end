import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main>
        <SidebarTrigger className="hover:cursor-pointer hover:bg-gray-200 bg-purple-500" />
        {children}
      </main>
    </SidebarProvider>
  );
}
