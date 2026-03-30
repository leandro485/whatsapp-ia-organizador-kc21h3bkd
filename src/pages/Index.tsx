import SummaryCard from '@/components/dashboard/SummaryCard'
import UrgencyGrid from '@/components/dashboard/UrgencyGrid'
import ActivityChart from '@/components/dashboard/ActivityChart'
import PendingTasks from '@/components/dashboard/PendingTasks'

export default function Index() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Visão Geral
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seu painel de controle e inteligência para WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
        <div className="md:col-span-2 flex flex-col gap-6">
          <SummaryCard />
          <ActivityChart />
        </div>
        <div className="flex flex-col gap-6 h-full">
          <div className="flex-1">
            <UrgencyGrid />
          </div>
          <div className="flex-1">
            <PendingTasks />
          </div>
        </div>
      </div>
    </div>
  )
}
