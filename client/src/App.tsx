import { Switch, Route } from "wouter";
import { queryClient } from "./lib/static-query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminRoute } from "@/components/auth/admin-route";
import { AdminOnly, ManagerAndAdminOnly } from "@/components/auth/role-guard";
import { TicketAccessGuard } from "@/components/auth/ticket-access-guard";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import NewTicket from "@/pages/new-ticket";
import NewTicketQuick from "@/pages/new-ticket-quick";
import NewTicketFull from "@/pages/new-ticket-full";
import MyTickets from "@/pages/my-tickets";
import AllTickets from "@/pages/all-tickets";
import DepartmentTickets from "@/pages/department-tickets";
import TicketDetails from "@/pages/ticket-details";
import Calendar from "@/pages/calendar";
import TicketTree from "@/pages/ticket-tree";
import Queues from "@/pages/queues";
import RequestTypes from "@/pages/request-types";
import Departments from "@/pages/departments";
import SlaLevels from "@/pages/sla-levels";
import Labels from "@/pages/labels";
import TicketStatuses from "@/pages/ticket-statuses";
import TicketPriorities from "@/pages/ticket-priorities";
import WorkSchedules from "@/pages/work-schedules";
import Users from "@/pages/users";
import UserDetails from "@/pages/user-details";
import NewUser from "@/pages/new-user";
import EditUser from "@/pages/edit-user";
import ClientForm from "@/pages/client-form";
import Analytics from "@/pages/analytics";
import SLAMonitor from "@/pages/sla-monitor";
import Export from "@/pages/export";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import AuthCallback from "@/pages/auth-callback";
import UserProfile from "@/pages/user-profile";
import Sidebar from "@/components/layout/sidebar";
import BottomMenu from "@/components/layout/bottom-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

function Router() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Switch>
      {/* Rotas públicas (sem layout e sem proteção) */}
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/auth/callback" component={AuthCallback} />
      
      {/* Rotas protegidas (com layout e proteção de autenticação) */}
      <Route>
        <ProtectedRoute>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar 
              isMobile={isMobile} 
              isOpen={sidebarOpen}
              onClose={handleSidebarClose}
            />
            <div className={`flex-1 ${isMobile ? 'w-full' : 'lg:pl-0'} ${isMobile ? 'pb-16' : ''}`}>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/new-ticket" component={NewTicket} />
                <Route path="/tickets/new/quick" component={NewTicketQuick} />
                <Route path="/tickets/new/full" component={NewTicketFull} />
                <Route path="/my-tickets" component={MyTickets} />
                
                {/* Todos os Chamados - apenas admins */}
                <Route path="/all-tickets">
                  <AdminOnly>
                    <AllTickets />
                  </AdminOnly>
                </Route>
                
                {/* Chamados do Departamento - gerentes e admins */}
                <Route path="/department-tickets">
                  <ManagerAndAdminOnly>
                    <DepartmentTickets />
                  </ManagerAndAdminOnly>
                </Route>
                
                <Route path="/ticket/:ticketId">
                  <TicketAccessGuard>
                    <TicketDetails />
                  </TicketAccessGuard>
                </Route>
                <Route path="/calendar" component={Calendar} />
                <Route path="/ticket-tree" component={TicketTree} />
                <Route path="/queues" component={Queues} />
                
                {/* Rotas administrativas protegidas */}
                <Route path="/request-types">
                  <AdminRoute>
                    <RequestTypes />
                  </AdminRoute>
                </Route>
                <Route path="/departments">
                  <AdminRoute>
                    <Departments />
                  </AdminRoute>
                </Route>
                <Route path="/sla-levels">
                  <AdminRoute>
                    <SlaLevels />
                  </AdminRoute>
                </Route>
                <Route path="/labels">
                  <AdminRoute>
                    <Labels />
                  </AdminRoute>
                </Route>
                <Route path="/ticket-statuses">
                  <AdminRoute>
                    <TicketStatuses />
                  </AdminRoute>
                </Route>
                <Route path="/ticket-priorities">
                  <AdminRoute>
                    <TicketPriorities />
                  </AdminRoute>
                </Route>
                <Route path="/work-schedules">
                  <AdminRoute>
                    <WorkSchedules />
                  </AdminRoute>
                </Route>
                <Route path="/settings">
                  <AdminRoute>
                    <Settings />
                  </AdminRoute>
                </Route>
                <Route path="/users">
                  <AdminRoute>
                    <Users />
                  </AdminRoute>
                </Route>
                <Route path="/users/new">
                  <AdminRoute>
                    <NewUser />
                  </AdminRoute>
                </Route>
                <Route path="/users/edit/:id">
                  <AdminRoute>
                    <EditUser />
                  </AdminRoute>
                </Route>
                <Route path="/users/:id">
                  <AdminRoute>
                    <UserDetails />
                  </AdminRoute>
                </Route>
                <Route path="/analytics">
                  <AdminRoute>
                    <Analytics />
                  </AdminRoute>
                </Route>
                <Route path="/sla">
                  <AdminRoute>
                    <SLAMonitor />
                  </AdminRoute>
                </Route>
                <Route path="/export">
                  <AdminRoute>
                    <Export />
                  </AdminRoute>
                </Route>
                
                {/* Rotas gerais */}
                <Route path="/profile" component={UserProfile} />
                <Route component={NotFound} />
              </Switch>
            </div>
            
            {/* Bottom Menu - Mobile Only */}
            {isMobile && (
              <div className="fixed bottom-0 left-0 right-0 z-50">
                <BottomMenu onMenuToggle={handleMenuToggle} />
              </div>
            )}
          </div>
        </ProtectedRoute>
      </Route>
    </Switch>
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
