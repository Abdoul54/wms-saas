import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import AppHeader from "./app-header";

const AppLayout = ({ children }: {
    children: React.ReactNode;
}) => {
    return (
        <SidebarProvider className="bg-accent">
            <AppSidebar variant="floating" />
            <SidebarInset className="bg-transparent">
                <AppHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default AppLayout
