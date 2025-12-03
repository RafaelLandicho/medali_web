"use client";

import {
  Home,
  Inbox,
  LogOutIcon,
  Settings,
  User,
  SearchIcon,
  FilePenIcon,
  FilePlusIcon,
  FolderOpenIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import add from "./images/add.png";
import medicalReport from "./images/medical-report.png";
import prescription from "./images/prescription(1).png";
import view from "./images/view.png";
import analytics from "./images/analytics.jpg";
import prescriptionBig from "./images/prescriptionBig.jpg";
import prescriptionBig2 from "./images/prescriptionBig2.jpg";
import medicalRecords from "./images/medicalRecords.jpg";
import usersPic from "./images/users.jpg";
import patientPic from "./images/patient.png";
import doctorPic from "./images/doctor.png";
import { LogoutSolid } from "@mynaui/icons-react";
import { useAuth } from "@/auth/authprovider";

const items = [
  {
    title: "Home",
    url: "/home",
    icon: () => <Home className="text-white" />,
    details:
      "Welcome to the home section. This is where your dashboard overview lives.",
  },
  {
    title: "View Medical Records",
    url: "/records",
    icon: () => <SearchIcon className=" text-white" />,
    details: "Access and manage all patient medical records securely here.",
  },
  {
    title: "Add Medical Records",
    url: "/add-record",
    icon: () => <FilePlusIcon className=" text-white" />,
    details: "Create and store a patient medical records inside the database.",
  },
  {
    title: "View Prescriptions ",
    url: "/prescriptions",
    icon: () => <FilePenIcon className=" text-white" />,
    details: "Access and manage all patient prescriptions securely here.",
  },
  {
    title: "View Users",
    url: "/users",
    icon: () => <User className="text-white" />,
    details: "Manage user accounts, permissions, and access control settings.",
  },
  {
    title: "View Analytics",
    url: "/analytics",
    icon: () => <FolderOpenIcon className=" text-white" />,
    details: "View and manage your personal profile information and settings.",
  },
];

export function AppSidebar() {
  const { logout } = useAuth();
  return (
    <Sidebar collapsible="icon">
      <SidebarContent
        className="bg-[#00a896] 
                                 data-[collapsed=true]:flex 
                                 data-[collapsed=true]:flex-col 
                                 data-[collapsed=true]:items-center 
                                 data-[collapsed=true]:justify-center
                                 flex flex-col h-full"
      >
        {/* <div className="flex justify-center py-2">
          <SidebarTrigger className="text-orange-500 !bg-white" />
        </div> */}
        <div className="flex-1 flex flex-col">
          <SidebarGroup className="group-data-[collapsible=icon]:hidden" />
          <img src={doctorPic} className="object-contain rounded p-5" />
          <SidebarGroupContent
            className="data-[collapsed=true]:flex
                                        data-[collapsed=true]:flex-col
                                        data-[collapsed=true]:items-center
                                        data-[collapsed=true]:justify-center
                                        w-full"
          >
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-[#1782a7] w-full"
                  >
                    <a href={item.url} className="flex items-center gap-5">
                      <div className="w-7 h-7 flex items-center justify-center">
                        <item.icon />
                      </div>
                      <span className="text-white text-xl">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </div>

        <SidebarFooter className="hover:bg-[#1782a7] w-full">
          <div className="flex flex-row justify-center items-center w-full py-2">
            <LogoutSolid
              onClick={logout}
              className="text-red-600 cursor-pointer w-6 h-6"
            />
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
