import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, CheckSquare, Users, Settings, Bot } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from '@/components/ui/sidebar'
import { useAppStore, ChatCategory } from '@/stores/main'

export default function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { chats, tasks, categoryFilter, setCategoryFilter, waConnected } = useAppStore()

  const unreadChats = chats.reduce((acc, chat) => acc + chat.unread, 0)
  const pendingTasks = tasks.filter((t) => t.status === 'Detectada').length

  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Conversas', path: '/conversations', icon: MessageSquare, badge: unreadChats },
    { name: 'Tarefas', path: '/tasks', icon: CheckSquare, badge: pendingTasks },
    { name: 'Contatos', path: '/contacts', icon: Users },
    { name: 'Configurações', path: '/settings', icon: Settings },
  ]

  const filters: ChatCategory[] = ['Trabalho', 'Família', 'Financeiro', 'Vendas']

  const handleFilterClick = (filter: ChatCategory) => {
    setCategoryFilter(categoryFilter === filter ? null : filter)
    if (location.pathname !== '/conversations') {
      navigate('/conversations')
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">Hub Inteligente</span>
            <span className="text-xs text-muted-foreground">Workspace IA</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge ? (
                    <SidebarMenuBadge className="bg-primary/10 text-primary font-medium">
                      {item.badge}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel>Filtros Rápidos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filters.map((filter) => (
                <SidebarMenuItem key={filter}>
                  <SidebarMenuButton
                    variant="ghost"
                    isActive={categoryFilter === filter}
                    onClick={() => handleFilterClick(filter)}
                    className="text-muted-foreground"
                  >
                    <span className="h-2 w-2 rounded-full bg-slate-300 mr-2" />
                    <span>{filter}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="relative flex h-3 w-3">
            {waConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${waConnected ? 'bg-green-500' : 'bg-red-500'}`}
            ></span>
          </div>
          <span className="font-medium text-foreground">
            {waConnected ? 'WhatsApp Conectado' : 'Desconectado'}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
