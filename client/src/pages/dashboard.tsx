import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import TicketForm from "@/components/tickets/ticket-form";
import EmailIntegration from "@/components/dashboard/email-integration";
import SLAMonitor from "@/components/dashboard/sla-monitor";
import TicketsTable from "@/components/tickets/tickets-table";

export default function Dashboard() {
  return (
    <>
      <Header 
        title="Dashboard" 
        subtitle="Visão geral do sistema de chamados"
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Dashboard Stats */}
          <div className="mb-8">
            <StatsCards />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* New Ticket Form */}
            <div className="lg:col-span-2">
              <TicketForm />
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <EmailIntegration />
              <SLAMonitor />
            </div>
          </div>

          {/* Recent Tickets Table */}
          <TicketsTable />
        </div>
      </main>
    </>
  );
}
