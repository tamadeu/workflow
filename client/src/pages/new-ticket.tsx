import Header from "@/components/layout/header";
import TicketForm from "@/components/tickets/ticket-form";

export default function NewTicket() {
  return (
    <>
      <Header 
        title="Novo Chamado" 
        subtitle="Crie um novo chamado de suporte"
        showNewTicketButton={false}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <TicketForm />
          </div>
        </div>
      </main>
    </>
  );
}
