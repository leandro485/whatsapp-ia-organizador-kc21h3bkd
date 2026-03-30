import { Search, Bell, RefreshCw } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppStore } from '@/stores/main'

export default function Header() {
  const { globalSearch, setGlobalSearch } = useAppStore()

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-2 flex-1">
        <SidebarTrigger className="-ml-2" />
        <div className="relative w-full max-w-sm hidden md:block ml-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Pesquisa Inteligente (Contatos, Mensagens)..."
            className="w-full bg-muted/50 pl-9 border-none focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex h-8 gap-2 text-xs font-medium"
        >
          <RefreshCw className="h-3.5 w-3.5 text-primary" />
          Sincronizar
        </Button>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>
        <div className="h-5 w-[1px] bg-border mx-1 hidden sm:block" />
        <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
          <AvatarImage
            src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=22"
            alt="Perfil"
          />
          <AvatarFallback>IA</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
