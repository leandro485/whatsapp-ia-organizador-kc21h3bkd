import { Phone, Video, MoreVertical, Paperclip, SendHorizontal, Bot } from 'lucide-react'
import { useAppStore } from '@/stores/main'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ChatDetail({ className }: { className?: string }) {
  const { chats, activeChatId } = useAppStore()
  const activeChat = chats.find((c) => c.id === activeChatId)

  if (!activeChat) {
    return (
      <div className={`flex items-center justify-center flex-col bg-background ${className}`}>
        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <Bot className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium text-foreground">Hub Inteligente Ativo</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Navegue pelas suas conversas à esquerda
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col bg-background relative ${className}`}>
      {/* Header */}
      <div className="h-16 border-b px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={activeChat.avatar} />
            <AvatarFallback>{activeChat.contactName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">{activeChat.contactName}</span>
            <span className="text-xs text-primary font-medium">Online</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Messages Area - Mocked */}
      <ScrollArea className="flex-1 p-4 bg-[url('https://img.usecurling.com/i?q=pattern&color=gray&shape=outline')] bg-opacity-5">
        <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
          <div className="self-center bg-muted/80 px-3 py-1 rounded-full text-xs text-muted-foreground mb-4 font-medium">
            Ontem
          </div>

          <div className="self-end bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
            <p className="text-sm">Tudo bem? Como estão as coisas para o fechamento?</p>
            <span className="text-[10px] text-primary-foreground/70 block text-right mt-1">
              09:30
            </span>
          </div>

          <div className="self-start bg-card border p-3 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
            <p className="text-sm">{activeChat.lastMessage}</p>
            <span className="text-[10px] text-muted-foreground block text-right mt-1">
              {activeChat.timestamp}
            </span>
          </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-background border-t shrink-0">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input
            placeholder="Digite uma mensagem..."
            className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary h-10"
          />
          <Button size="icon" className="rounded-full shrink-0 h-10 w-10 shadow-md">
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
