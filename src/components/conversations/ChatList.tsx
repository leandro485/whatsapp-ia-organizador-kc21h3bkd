import { useAppStore } from '@/stores/main'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ChatList({ className }: { className?: string }) {
  const { chats, activeChatId, setActiveChatId, globalSearch, categoryFilter } = useAppStore()

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.contactName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(globalSearch.toLowerCase())
    const matchesFilter = categoryFilter ? chat.category === categoryFilter : true
    return matchesSearch && matchesFilter
  })

  return (
    <div className={cn('flex flex-col border-r bg-background', className)}>
      <div className="p-4 border-b shrink-0 flex items-center justify-between">
        <h2 className="font-semibold text-lg">Conversas</h2>
        <Badge variant="secondary">{filteredChats.length}</Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nenhuma conversa encontrada com os filtros atuais.
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  'flex items-start gap-3 p-4 border-b last:border-0 text-left transition-colors hover:bg-muted/50',
                  activeChatId === chat.id
                    ? 'bg-accent/50 border-l-2 border-l-primary'
                    : 'border-l-2 border-l-transparent',
                )}
              >
                <Avatar className="h-10 w-10 border mt-0.5">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback>{chat.contactName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm truncate pr-2">{chat.contactName}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{chat.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-2">{chat.lastMessage}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] px-1.5 h-4 bg-muted/50">
                      {chat.category}
                    </Badge>
                    {chat.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
