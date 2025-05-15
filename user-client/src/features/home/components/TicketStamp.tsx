import React from 'react';

export const TicketStamp: React.FC = () => {
  return (
    <div className="absolute bottom-0 right-0 w-64 h-64 opacity-5 pointer-events-none transform translate-x-[160px] -translate-y-[50px]">
      <img 
        src="/ticket-stamp.svg" 
        alt="Ticket Stamp" 
        className="w-full h-full object-contain dark:invert"
      />
    </div>
  );
};
