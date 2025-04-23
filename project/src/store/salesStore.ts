import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ChartData } from 'chart.js';

interface SalesAnalytics {
  daily: ChartData<'line'>;
  products: ChartData<'bar'>;
}

interface SalesStore {
  analytics: SalesAnalytics | null;
  loading: boolean;
  error: string | null;
  fetchAnalytics: (startDate: Date, endDate: Date) => Promise<void>;
}

export const useSalesStore = create<SalesStore>((set) => ({
  analytics: null,
  loading: false,
  error: null,
  fetchAnalytics: async (startDate: Date, endDate: Date) => {
    try {
      set({ loading: true, error: null });
      
      // Fetch daily sales
      const { data: dailySales, error: dailyError } = await supabase
        .from('sales')
        .select('created_at, total_amount')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      if (dailyError) throw dailyError;

      // Fetch product sales
      const { data: productSales, error: productError } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          unit_price,
          product:products(name)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (productError) throw productError;

      // Process daily sales data
      const dailyData = processDailySales(dailySales);
      
      // Process product sales data
      const productData = processProductSales(productSales);

      set({
        analytics: {
          daily: dailyData,
          products: productData,
        },
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));

const processDailySales = (sales: any[]): ChartData<'line'> => {
  const salesByDate = sales.reduce((acc: { [key: string]: number }, sale) => {
    const date = new Date(sale.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + sale.total_amount;
    return acc;
  }, {});

  return {
    labels: Object.keys(salesByDate),
    datasets: [
      {
        label: 'Ventes journalières',
        data: Object.values(salesByDate),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.4,
      },
    ],
  };
};

const processProductSales = (sales: any[]): ChartData<'bar'> => {
  const productSales = sales.reduce((acc: { [key: string]: number }, sale) => {
    const productName = sale.product.name;
    acc[productName] = (acc[productName] || 0) + (sale.quantity * sale.unit_price);
    return acc;
  }, {});

  return {
    labels: Object.keys(productSales),
    datasets: [
      {
        label: 'Ventes par produit',
        data: Object.values(productSales),
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 1,
      },
    ],
  };
};