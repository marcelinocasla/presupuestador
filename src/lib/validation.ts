import { z } from 'zod';

export const QuoteSchema = z.object({
    clientName: z.string().min(1, "El nombre del cliente es requerido"),
    clientPhone: z.string().optional(),
    clientAddress: z.string().optional(),
    transportName: z.string().optional(),

    dimensions: z.object({
        length: z.number().min(1, "El largo debe ser mayor a 0"),
        width: z.number().min(1, "El ancho debe ser mayor a 0"),
    }),

    solarium: z.object({
        top: z.number().min(0),
        bottom: z.number().min(0),
        left: z.number().min(0),
        right: z.number().min(0),
    }),

    shippingCost: z.number().min(0),
});
