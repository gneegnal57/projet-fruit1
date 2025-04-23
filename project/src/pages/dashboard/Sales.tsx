import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, ShoppingCart, CreditCard, Package, User, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Sale {
  id: string;
  customer_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_by: string;
  created_at: string;
  customer: {
    company_name: string;
    contact_name: string | null;
  };
  items: SaleItem[];
}

interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product: {
    name: string;
  };
}

interface Customer {
  id: string;
  company_name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface InventoryItem {
  product_id: string;
  quantity: number;
  unit: string;
}

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentSale, setCurrentSale] = useState<Partial<Sale> & { items?: Partial<SaleItem>[] }>({});
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(company_name, contact_name),
          items:sale_items(
            id,
            product_id,
            quantity,
            unit_price,
            product:products(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Erreur lors du chargement des ventes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, company_name')
        .order('company_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('product_id, quantity, unit');

      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchProducts();
    fetchInventory();
  }, []);

  const checkInventoryAvailability = (items: Partial<SaleItem>[]) => {
    const unavailableItems = items.filter(item => {
      const inventoryItem = inventory.find(inv => inv.product_id === item.product_id);
      return !inventoryItem || inventoryItem.quantity < (item.quantity || 0);
    });

    return unavailableItems.length === 0;
  };

  const updateInventory = async (items: Partial<SaleItem>[]) => {
    for (const item of items) {
      const inventoryItem = inventory.find(inv => inv.product_id === item.product_id);
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity - (item.quantity || 0);
        await supabase
          .from('inventory')
          .update({ quantity: newQuantity })
          .eq('product_id', item.product_id);
      }
    }
    await fetchInventory();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSale.customer_id || !currentSale.items?.length) {
      setError('Veuillez sélectionner un client et ajouter des produits');
      return;
    }

    if (!checkInventoryAvailability(currentSale.items)) {
      setError('Stock insuffisant pour certains produits');
      return;
    }

    try {
      if (currentSale.id) {
        // Update existing sale
        const { error: saleError } = await supabase
          .from('sales')
          .update({
            customer_id: currentSale.customer_id,
            total_amount: calculateTotal(currentSale.items),
            status: currentSale.status,
            payment_status: currentSale.payment_status,
          })
          .eq('id', currentSale.id);

        if (saleError) throw saleError;

        // Update sale items
        const { error: itemsError } = await supabase
          .from('sale_items')
          .upsert(
            currentSale.items.map(item => ({
              ...item,
              sale_id: currentSale.id
            }))
          );

        if (itemsError) throw itemsError;

        // Update inventory
        await updateInventory(currentSale.items);
      } else {
        // Create new sale
        const { data: sale, error: saleError } = await supabase
          .from('sales')
          .insert([{
            customer_id: currentSale.customer_id,
            total_amount: calculateTotal(currentSale.items),
            status: 'pending',
            payment_status: 'pending',
          }])
          .select()
          .single();

        if (saleError) throw saleError;

        // Create sale items
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(
            currentSale.items.map(item => ({
              ...item,
              sale_id: sale.id
            }))
          );

        if (itemsError) throw itemsError;

        // Update inventory
        await updateInventory(currentSale.items);
      }

      setShowModal(false);
      setCurrentSale({});
      fetchSales();
    } catch (err) {
      console.error('Error saving sale:', err);
      setError('Erreur lors de l\'enregistrement de la vente');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) return;

    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSales();
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError('Erreur lors de la suppression de la vente');
    }
  };

  const calculateTotal = (items: Partial<SaleItem>[] = []) => {
    return items.reduce((total, item) => {
      return total + (item.quantity || 0) * (item.unit_price || 0);
    }, 0);
  };

  const addSaleItem = () => {
    setCurrentSale(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        { quantity: 1, unit_price: 0 }
      ]
    }));
  };

  const removeSaleItem = (index: number) => {
    setCurrentSale(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: any) => {
    setCurrentSale(prev => ({
      ...prev,
      items: prev.items?.map((item, i) => {
        if (i === index) {
          if (field === 'product_id') {
            const product = products.find(p => p.id === value);
            return {
              ...item,
              [field]: value,
              unit_price: product?.price || 0
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const getInventoryStatus = (productId: string, quantity: number) => {
    const inventoryItem = inventory.find(item => item.product_id === productId);
    if (!inventoryItem) return { available: false, remaining: 0 };
    return {
      available: inventoryItem.quantity >= quantity,
      remaining: inventoryItem.quantity - quantity
    };
  };

  const filteredSales = sales.filter(sale =>
    sale.customer?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.payment_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Ventes</h1>
        <button
          onClick={() => {
            setCurrentSale({ items: [] });
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Vente
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une vente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-12">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sale.customer?.company_name}
                        </div>
                        {sale.customer?.contact_name && (
                          <div className="text-sm text-gray-500">
                            {sale.customer.contact_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {sale.total_amount.toFixed(2)} €
                    </div>
                    <div className="text-sm text-gray-500">
                      {sale.items?.length || 0} articles
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                      sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sale.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      sale.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {sale.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setCurrentSale(sale);
                        setShowModal(true);
                      }}
                      className="text-orange-600 hover:text-orange-900 mr-3"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {currentSale.id ? 'Modifier la vente' : 'Nouvelle vente'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setCurrentSale({});
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client
                </label>
                <select
                  value={currentSale.customer_id || ''}
                  onChange={(e) => setCurrentSale({ ...currentSale, customer_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Articles
                  </label>
                  <button
                    type="button"
                    onClick={addSaleItem}
                    className="flex items-center text-sm text-orange-600 hover:text-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter un article
                  </button>
                </div>
                <div className="space-y-3">
                  {currentSale.items?.map((item, index) => {
                    const inventoryStatus = item.product_id ? 
                      getInventoryStatus(item.product_id, item.quantity || 0) : 
                      null;

                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-1">
                          <select
                            value={item.product_id || ''}
                            onChange={(e) => updateSaleItem(index, 'product_id', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            required
                          >
                            <option value="">Sélectionner un produit</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {product.price.toFixed(2)} €
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || ''}
                            onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value))}
                            className={`block w-full rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${
                              inventoryStatus && !inventoryStatus.available
                                ? 'border-red-300 text-red-900'
                                : 'border-gray-300'
                            }`}
                            placeholder="Qté"
                            required
                          />
                          {inventoryStatus && !inventoryStatus.available && (
                            <div className="text-xs text-red-600 mt-1 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Stock insuffisant
                            </div>
                          )}
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unit_price || ''}
                            onChange={(e) => updateSaleItem(index, 'unit_price', parseFloat(e.target.value))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            placeholder="Prix"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSaleItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {currentSale.items?.length ? (
                  <div className="mt-4 text-right">
                    <span className="text-sm font-medium text-gray-700">
                      Total: {calculateTotal(currentSale.items).toFixed(2)} €
                    </span>
                  </div>
                ) : null}
              </div>

              {currentSale.id && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Statut de la commande
                    </label>
                    <select
                      value={currentSale.status || 'pending'}
                      onChange={(e) => setCurrentSale({ ...currentSale, status: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="pending">En attente</option>
                      <option value="processing">En cours</option>
                      <option value="completed">Terminée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Statut du paiement
                    </label>
                    <select
                      value={currentSale.payment_status || 'pending'}
                      onChange={(e) => setCurrentSale({ ...currentSale, payment_status: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="pending">En attente</option>
                      <option value="paid">Payé</option>
                      <option value="failed">Échoué</option>
                      <option value="refunded">Remboursé</option>
                    </select>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setCurrentSale({});
                    setError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  {currentSale.id ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;