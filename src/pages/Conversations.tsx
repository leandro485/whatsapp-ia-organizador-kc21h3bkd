import ChatList from '@/components/conversations/ChatList'
import ChatDetail from '@/components/conversations/ChatDetail'
import AiSidebar from '@/components/conversations/AiSidebar'

export default function Conversations() {
  return (
    <div className="h-full flex flex-col -mx-4 -my-6 md:-mx-6 md:my-0">
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Desktop Layout: 3 panes */}
        <ChatList className="w-80 hidden md:flex shrink-0 border-r" />
        <ChatDetail className="flex-1 min-w-0" />
        <AiSidebar className="w-80 hidden lg:flex shrink-0 border-l" />
      </div>
    </div>
  )
}
