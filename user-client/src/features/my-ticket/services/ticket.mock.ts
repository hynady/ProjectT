import { TicketDisplayUnit } from "../internal-types/ticket.type";

export const ticketMockData = {
    tickets: [
        {
            ticket: {
                id: '1',
                occaId: '1',
                showId: '1',
                typeId: '1',
                purchaseDate: '2025-01-15',
                qrCode: `TICKET-${crypto.randomUUID()}`,
                purchasedBy: 'hynady',
                checkedInAt: '2025-01-20T15:30:00Z'
            },
            occa: {
                id: '1',
                title: 'Summer Music Festival 2025',
                location: 'Central Park',
                duration: '4 hours',
                address: '123 Park Avenue, New York',
            },
            show: {
                id: '1',
                occaId: '1',
                date: '2025-02-15',
                time: '19:00'
            },
            ticketType: {
                id: '1',
                showId: '1',
                type: 'VIP',
                price: 150
            }
        },
        // Same Event, Different Show Time
        {
            ticket: {
                id: '2',
                occaId: '1',
                showId: '2',
                typeId: '2',
                purchaseDate: '2025-01-15',
                qrCode: `TICKET-${crypto.randomUUID()}`,
                purchasedBy: 'hynady'
            },
            occa: {
                id: '1',
                title: 'Summer Music Festival 2025',
                location: 'Central Park',
                duration: '4 hours',
                address: '123 Park Avenue, New York',
            },
            show: {
                id: '2',
                occaId: '1',
                date: '2025-02-16',
                time: '20:00'
            },
            ticketType: {
                id: '2',
                showId: '2',
                type: 'Regular',
                price: 80
            }
        },
        // Different Event - Theater Show
        {
            ticket: {
                id: '3',
                occaId: '2',
                showId: '3',
                typeId: '3',
                purchaseDate: '2025-01-10',
                qrCode: `TICKET-${crypto.randomUUID()}`,
                purchasedBy: 'hynady'
            },
            occa: {
                id: '2',
                title: 'The Phantom of the Opera',
                location: 'Broadway Theater',
                duration: '2.5 hours',
                address: '456 Broadway, New York',
            },
            show: {
                id: '3',
                occaId: '2',
                date: '2025-01-25',
                time: '18:30'
            },
            ticketType: {
                id: '3',
                showId: '3',
                type: 'Premium',
                price: 200
            }
        },
        // Past Event
        {
            ticket: {
                id: '4',
                occaId: '3',
                showId: '4',
                typeId: '4',
                purchaseDate: '2025-01-01',
                qrCode: `TICKET-${crypto.randomUUID()}`,
                purchasedBy: 'hynady'
            },
            occa: {
                id: '3',
                title: 'New Year Concert',
                location: 'City Hall',
                duration: '3 hours',
                address: '789 Main Street, New York',
            },
            show: {
                id: '4',
                occaId: '3',
                date: '2025-01-05',
                time: '20:00'
            },
            ticketType: {
                id: '4',
                showId: '4',
                type: 'Standard',
                price: 100
            }
        },
        // Today's Event
        {
            ticket: {
                id: '5',
                occaId: '4',
                showId: '5',
                typeId: '5',
                purchaseDate: '2025-01-19',
                qrCode: `TICKET-${crypto.randomUUID()}`,
                purchasedBy: 'hynady'
            },
            occa: {
                id: '4',
                title: 'Art Gallery Opening',
                location: 'Modern Art Museum',
                duration: '5 hours',
                address: '321 Museum Road, New York',
            },
            show: {
                id: '5',
                occaId: '4',
                date: '2025-01-20',
                time: '10:00'
            },
            ticketType: {
                id: '5',
                showId: '5',
                type: 'VIP',
                price: 120
            }
        }
    ] as TicketDisplayUnit[]
};