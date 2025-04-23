import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  price: z.number().min(0, 'Le prix doit être positif'),
  image_url: z.string().url('URL invalide').optional().nullable(),
  category: z.string().optional().nullable(),
  origin_country: z.string().optional().nullable(),
});

export const customerSchema = z.object({
  company_name: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  contact_name: z.string().optional().nullable(),
  email: z.string().email('Email invalide').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

export const saleItemSchema = z.object({
  product_id: z.string().uuid('ID de produit invalide'),
  quantity: z.number().min(0.01, 'La quantité doit être positive'),
  unit_price: z.number().min(0, 'Le prix unitaire doit être positif'),
});

export const saleSchema = z.object({
  customer_id: z.string().uuid('ID de client invalide'),
  items: z.array(saleItemSchema).min(1, 'Au moins un article est requis'),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']),
});

export const inventorySchema = z.object({
  product_id: z.string().uuid('ID de produit invalide'),
  quantity: z.number().min(0, 'La quantité ne peut pas être négative'),
  unit: z.string().min(1, 'L\'unité est requise'),
  batch_number: z.string().optional().nullable(),
  expiration_date: z.string().optional().nullable(),
  storage_location: z.string().optional().nullable(),
});

export type Product = z.infer<typeof productSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type SaleItem = z.infer<typeof saleItemSchema>;
export type Sale = z.infer<typeof saleSchema>;
export type Inventory = z.infer<typeof inventorySchema>;