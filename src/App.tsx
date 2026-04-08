import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/stores/main'
import { ThemeProvider } from '@/components/theme-provider'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Conversations from '@/pages/Conversations'
import Tasks from '@/pages/Tasks'
import Contacts from '@/pages/Contacts'
import Settings from '@/pages/Settings'
import Profile from '@/pages/Profile'
import NotFound from '@/pages/NotFound'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Index />} />
      <Route path="/conversations" element={<Conversations />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
)

const App = () => (
  <AuthProvider>
    <AppProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </BrowserRouter>
      </ThemeProvider>
    </AppProvider>
  </AuthProvider>
)

export default App
