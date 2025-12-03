import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NavigationMenuDemo } from "@/components/nav-menu";
import { Card, CardContent } from "./ui/card";
import { MenuIcon } from "./ui/icons/lucide-menu";
import { UserIcon } from "./ui/icons/lucide-user";
import { useAuth } from "@/auth/authprovider";
export default function HeaderPage() {
  const { user } = useAuth();
  return (
    <div className="flex items-center gap-2 p-1">
      <Card className="flex w-full flex-row items-center text-orange-500 px-1 py-1">
        <SidebarTrigger className="!bg-white"></SidebarTrigger>
        <div className="flex-1 text-orange-500 text-xl font-bold">
          <span>MEDALI</span>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            <span>
              {user?.firstName} {user?.lastName}
            </span>
            <MenuIcon className="w-6 h-6 cursor-pointer" />
          </div>
        </div>
      </Card>
    </div>
  );
}
