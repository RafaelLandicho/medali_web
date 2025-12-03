import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NavigationMenuDemo } from "@/components/nav-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { MenuIcon } from "./components/ui/icons/lucide-menu";
import { UserIcon } from "./components/ui/icons/lucide-user";
import { useAuth } from "@/auth/authprovider";
import HeaderPage from "./components/header";
export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex !min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="sticky top-0 z-50 w-full bg-background border-b">
            <HeaderPage></HeaderPage>
          </div>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
