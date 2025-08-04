import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import NewTicket from "@/pages/new-ticket";
import MyTickets from "@/pages/my-tickets";
import TicketDetails from "@/pages/ticket-details";
import Calendar from "@/pages/calendar";
import TicketTree from "@/pages/ticket-tree";
import Queues from "@/pages/queues";
import Labels from "@/pages/labels";
import WorkSchedules from "@/pages/work-schedules";
import Inventory from "@/pages/inventory";
import Analytics from "@/pages/analytics";
import SLAMonitor from "@/pages/sla-monitor";
import Export from "@/pages/export";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/new-ticket" component={NewTicket} />
          <Route path="/my-tickets" component={MyTickets} />
          <Route path="/ticket/:ticketId" component={TicketDetails} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/ticket-tree" component={TicketTree} />
          <Route path="/queues" component={Queues} />
          <Route path="/labels" component={Labels} />
          <Route path="/work-schedules" component={WorkSchedules} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/sla" component={SLAMonitor} />
          <Route path="/export" component={Export} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
