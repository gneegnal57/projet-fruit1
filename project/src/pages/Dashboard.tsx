import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useSalesStore } from '../store/salesStore';
import SalesAnalytics from '../components/SalesAnalytics';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  TrendingUp,
  Truck,
  FileText,
  LogOut,
  BoxIcon,
  ArrowUp,
  ArrowDown,
  DollarSign,
  ShoppingCart,
  Building2,
  FileCheck
} from 'lucide-react';
import Products from './dashboard/Products';
import Inventory from './dashboard/Inventory';
import Customers from './dashboard/Customers';
import Sales from './dashboard/Sales';
import Suppliers from './dashboard/Suppliers';
import CustomsClearance from './dashboard/CustomsClearance';

interface DashboardStats {
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  recentSales: {
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
  }[];
  topProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  lowStock: {
    name: string;
    quantity: number;
    unit: string;
  }[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard />, label: 'Tableau de bord', path: '/dashboard' },
    { icon: <Package />, label: 'Produits', path: '/dashboard/products' },
    { icon: <BoxIcon />, label: 'Inventaire', path: '/dashboard/inventory' },
    { icon: <Users />, label: 'Clients', path: '/dashboard/customers' },
    { icon: <TrendingUp />, label: 'Ventes', path: '/dashboard/sales' },
    { icon: <Building2 />, label: 'Fournisseurs', path: '/dashboard/suppliers' },
    { icon: <FileCheck />, label: 'Dédouanement', path: '/dashboard/customs' },
    { icon: <Truck />, label: 'Livraisons', path: '/dashboard/shipments' },
    { icon: <FileText />, label: 'Rapports', path: '/dashboard/reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-orange-500">
            <span className="text-xl font-bold text-white">FruitExpress</span>
          </div>

          <div className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="flex items-center w-full px-4 py-2 text-gray-600 rounded-lg hover:bg-orange-50 hover:text-orange-500"
              >
                <span className="p-2">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.app_metadata?.role || 'Utilisateur'}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="sales" element={<Sales />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="customs" element={<CustomsClearance />} />
          {/* Other routes will be added later */}
        </Routes>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    recentSales: [],
    topProducts: [],
    lowStock: []
  });
  const [loading, setLoading] = useState(true);
  const { analytics, fetchAnalytics } = useSalesStore();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // Fetch total sales
        const { data: salesData } = await supabase
          .from('sales')
          .select('total_amount');
        
        // Fetch total customers
        const { count: customersCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact' });
        
        // Fetch total products
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact' });
        
        // Fetch pending orders
        const { count: pendingCount } = await supabase
          .from('sales')
          .select('*', { count: 'exact' })
          .eq('status', 'pending');
        
        // Fetch recent sales
        const { data: recentSalesData } = await supabase
          .from('sales')
          .select(`
            id,
            total_amount,
            status,
            created_at,
            customer:customers(company_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        // Fetch top products
        const { data: topProductsData } = await supabase
          .from('sale_items')
          .select(`
            quantity,
            unit_price,
            product:products(name)
          `)
          .limit(5);
        
        // Fetch low stock items
        const { data: lowStockData } = await supabase
          .from('inventory')
          .select(`
            quantity,
            unit,
            product:products(name)
          `)
          .lt('quantity', 10)
          .limit(5);

        const totalSales = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;

        setStats({
          totalSales,
          totalCustomers: customersCount || 0,
          totalProducts: productsCount || 0,
          pendingOrders: pendingCount || 0,
          recentSales: recentSalesData?.map(sale => ({
            id: sale.id,
            customer: sale.customer?.company_name || 'Client inconnu',
            amount: sale.total_amount,
            status: sale.status,
            date: new Date(sale.created_at).toLocaleDateString()
          })) || [],
          topProducts: topProductsData?.map(item => ({
            name: item.product?.name || 'Produit inconnu',
            quantity: item.quantity,
            revenue: item.quantity * item.unit_price
          })) || [],
          lowStock: lowStockData?.map(item => ({
            name: item.product?.name || 'Produit inconnu',
            quantity: item.quantity,
            unit: item.unit
          })) || []
        });

        // Fetch analytics for the last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        await fetchAnalytics(startDate, endDate);

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500">Vue d'ensemble de votre activité</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Chiffre d'affaires</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.totalSales.toLocaleString('fr-FR')} €</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Clients</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.totalCustomers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Produits</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.totalProducts}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Commandes en attente</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.pendingOrders}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Analytics */}
      {analytics && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analyse des ventes</h2>
          <SalesAnalytics salesData={analytics} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventes récentes</h2>
            <div className="divide-y divide-gray-200">
              {stats.recentSales.map((sale) => (
                <div key={sale.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sale.customer}</p>
                      <p className="text-sm text-gray-500">{sale.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{sale.amount.toLocaleString('fr-FR')} €</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                        sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sale.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerte stock bas</h2>
            <div className="divide-y divide-gray-200">
              {stats.lowStock.map((item, index) => (
                <div key={index} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Stock bas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;