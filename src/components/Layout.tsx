import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden h-screen bg-background">
          <Header />
          <main className="flex-1 overflow-auto animate-fade-in-up bg-slate-50/50 dark:bg-transparent">
            <div className="container h-full max-w-7xl py-6 px-4 md:px-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
