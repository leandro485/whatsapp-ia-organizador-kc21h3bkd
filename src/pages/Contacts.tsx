import { useState } from 'react'
import { useAppStore } from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Star, MessageCircleOff, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function Contacts() {
  const { chats } = useAppStore()
  const [search, setSearch] = useState('')

  const filteredChats = chats.filter((c) =>
    c.contactName.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contatos & Relacionamentos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie interações e limpe grupos inativos.
          </p>
        </div>
      </div>

      <Card className="flex-1 border-none shadow-none bg-transparent">
        <Tabs defaultValue="vips" className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="vips">Contatos VIP</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="groups">Limpeza de Grupos</TabsTrigger>
            </TabsList>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background h-9"
              />
            </div>
          </div>

          <TabsContent value="vips" className="flex-1 mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredChats.filter((c) => c.isVip).length === 0 && (
                <div className="col-span-full py-10 text-center text-muted-foreground">
                  Nenhum VIP encontrado.
                </div>
              )}
              {filteredChats
                .filter((c) => c.isVip)
                .map((contact) => (
                  <Card
                    key={contact.id}
                    className="overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="p-0">
                      <div className="h-16 bg-gradient-to-r from-primary/20 to-primary/5 border-b" />
                      <div className="px-4 pb-4 -mt-8 relative">
                        <div className="flex justify-between items-end">
                          <Avatar className="h-16 w-16 border-4 border-background shadow-sm">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback>{contact.contactName[0]}</AvatarFallback>
                          </Avatar>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-warning hover:text-warning/80"
                          >
                            <Star fill="currentColor" className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="mt-3">
                          <h3 className="font-semibold text-lg">{contact.contactName}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{contact.category}</p>

                          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 border">
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">Score</div>
                              <div className="font-semibold text-primary">
                                {contact.interactionScore}/100
                              </div>
                            </div>
                            <div className="w-[1px] h-8 bg-border" />
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground mb-1">Mensagens</div>
                              <div className="font-semibold">
                                {Math.floor(Math.random() * 500) + 100}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="flex-1 mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredChats.length === 0 && (
                <div className="col-span-full py-10 text-center text-muted-foreground">
                  Nenhum contato encontrado.
                </div>
              )}
              {filteredChats.map((contact) => (
                <Card
                  key={contact.id}
                  className="overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12 border shadow-sm">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.contactName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{contact.contactName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {contact.category}
                        </Badge>
                        {contact.isVip && (
                          <Star fill="hsl(var(--warning))" className="h-3 w-3 text-warning" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="flex-1 mt-0">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6 p-4 bg-muted/50 rounded-lg border">
                  <div className="p-2 bg-background rounded-full border shadow-sm">
                    <MessageCircleOff className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Grupos Inativos Detectados</h3>
                    <p className="text-xs text-muted-foreground">
                      Grupos com muita notificação e nenhuma interação sua nos últimos 30 dias.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredChats.filter((c) => c.isGroup).length === 0 && (
                    <div className="py-4 text-center text-muted-foreground text-sm">
                      Nenhum grupo inativo encontrado.
                    </div>
                  )}
                  {filteredChats
                    .filter((c) => c.isGroup)
                    .map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={group.avatar} />
                            <AvatarFallback>{group.contactName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{group.contactName}</h4>
                              <Badge variant="secondary" className="text-[10px]">
                                Silenciado
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {group.unread} mensagens não lidas • Última interação há 45 dias
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Arquivar
                          </Button>
                          <Button variant="destructive" size="sm">
                            Sair do Grupo
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
