import Header from "@/components/layout/header";
import TicketsTable from "@/components/tickets/tickets-table";

export default function MyTickets() {
  return (
    <>
      <Header 
        title="Meus Chamados" 
        subtitle="Gerenciar seus chamados de suporte"
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <TicketsTable />
        </div>
      </main>
    </>
  );
}
