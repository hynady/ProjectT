import { ReactNode } from 'react';

interface TicketCheckInLayoutProps {
  children: ReactNode;
}

export const TicketCheckInLayout = ({ children }: TicketCheckInLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto flex h-16 items-center px-4">
          <h1 className="text-xl font-bold">Hệ thống Check-in Vé</h1>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t bg-card py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} - Hệ thống Check-in Vé
      </footer>
    </div>
  );
};
