import MetricsOverview from '@/components/dashboard/MetricsOverview'
import VolumeAnalytics from '@/components/dashboard/VolumeAnalytics'
import CategoryDistribution from '@/components/dashboard/CategoryDistribution'
import RecentActivity from '@/components/dashboard/RecentActivity'
import PendingTasks from '@/components/dashboard/PendingTasks'
import UrgencyGrid from '@/components/dashboard/UrgencyGrid'

export default function Index() {
  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Painel Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize sua produtividade e o volume de mensagens gerenciados pela IA.
          </p>
        </div>
      </div>

      <MetricsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolumeAnalytics />
        </div>
        <div>
          <CategoryDistribution />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="flex flex-col gap-6">
          <UrgencyGrid />
          <PendingTasks />
        </div>
      </div>
    </div>
  )
}
