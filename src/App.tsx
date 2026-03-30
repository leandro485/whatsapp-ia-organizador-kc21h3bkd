import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/stores/main'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Conversations from '@/pages/Conversations'
import Tasks from '@/pages/Tasks'
import Contacts from '@/pages/Contacts'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'

const App = () => (
  <AppProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
