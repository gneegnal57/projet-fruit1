import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, FileText, Truck, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { handleValidationError } from '../../utils/error-handler';
import { z } from 'zod';

interface CustomsClearance {
  id: string;
  shipment_id: string;
  declaration_number: string | null;
  status: string;
  customs_fees: number | null;
  clearance_date: string | null;
  documents_url: string[] | null;
  created_at: string;
  shipment: {
    tracking_number: string;
    carrier: string;
  };
}

const customsClearanceSchema = z.object({
  shipment_id: z.string().uuid('ID d\'expédition invalide'),
  declaration_number: z.string().nullable(),
  status: z.string(),
  customs_fees: z.number().min(0).nullable(),
  clearance_date: z.string().nullable(),
  documents_url: z.array(z.string().url()).nullable(),
});

const CustomsClearance = () => {
  const [clearances, setClearances] = useState<CustomsClearance[]>([]);
  const [shipments, setShipments] = useState<{ id: string; tracking_number: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentClearance, setCurrentClearance] = useState<Partial<CustomsClearance> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchClearances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customs_clearance')
        .select(`
          *,
          shipment:shipments(tracking_number, carrier)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClearances(data || []);
    } catch (err) {
      console.error('Error fetching clearances:', err);
      setError('Erreur lors du chargement des dédouanements');
    } finally {
      setLoading(false);
    }
  };

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('id, tracking_number')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (err) {
      console.error('Error fetching shipments:', err);
    }
  };

  useEffect(() => {
    fetchClearances();
    fetchShipments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate data
      const validatedData = customsClearanceSchema.parse(currentClearance);

      if (currentClearance?.id) {
        const { error } = await supabase
          .from('customs_clearance')
          .update(validatedData)
          .eq('id', currentClearance.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customs_clearance')
          .insert([validatedData]);

        if (error) throw error;
      }

      setShowModal(false);
      setCurrentClearance(null);
      fetchClearances();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        console.error('Error saving customs clearance:', err);
        setError('Erreur lors de l\'enregistrement du dédouanement');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dédouanement ?')) return;

    try {
      const { error } = await supabase
        .from('customs_clearance')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchClearances();
    } catch (err) {
      console.error('Error deleting customs clearance:', err);
      setError('Erreur lors de la suppression du dédouanement');
    }
  };

  const filteredClearances = clearances.filter(clearance =>
    clearance.declaration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clearance.shipment?.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clearance.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Dédouanements</h1>
        <button
          onClick={() => {
            setCurrentClearance({});
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Dédouanement
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un dédouanement..."
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
                  Expédition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Déclaration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frais
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClearances.map((clearance) => (
                <tr key={clearance.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {clearance.shipment?.tracking_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {clearance.shipment?.carrier}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {clearance.declaration_number || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      clearance.status === 'completed' ? 'bg-green-100 text-green-800' :
                      clearance.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {clearance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      {clearance.customs_fees?.toFixed(2) || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {clearance.documents_url?.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Document {index + 1}
                        </a>
                      )) || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setCurrentClearance(clearance);
                        setShowModal(true);
                      }}
                      className="text-orange-600 hover:text-orange-900 mr-3"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(clearance.id)}
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {currentClearance?.id ? 'Modifier le dédouanement' : 'Nouveau dédouanement'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setCurrentClearance(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expédition
                </label>
                <select
                  value={currentClearance?.shipment_id || ''}
                  onChange={(e) => setCurrentClearance({ ...currentClearance, shipment_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                >
                  <option value="">Sélectionner une expédition</option>
                  {shipments.map((shipment) => (
                    <option key={shipment.id} value={shipment.id}>
                      {shipment.tracking_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Numéro de déclaration
                </label>
                <input
                  type="text"
                  value={currentClearance?.declaration_number || ''}
                  onChange={(e) => setCurrentClearance({ ...currentClearance, declaration_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  value={currentClearance?.status || 'pending'}
                  onChange={(e) => setCurrentClearance({ ...currentClearance, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                >
                  <option value="pending">En attente</option>
                  <option value="processing">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="blocked">Bloqué</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Frais de douane
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentClearance?.customs_fees || ''}
                  onChange={(e) => setCurrentClearance({
                    ...currentClearance,
                    customs_fees: e.target.value ? parseFloat(e.target.value) : null
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date de dédouanement
                </label>
                <input
                  type="date"
                  value={currentClearance?.clearance_date || ''}
                  onChange={(e) => setCurrentClearance({ ...currentClearance, clearance_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URLs des documents
                </label>
                <input
                  type="text"
                  value={currentClearance?.documents_url?.join(', ') || ''}
                  onChange={(e) => setCurrentClearance({
                    ...currentClearance,
                    documents_url: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Séparez les URLs par des virgules"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setCurrentClearance(null);
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
                  {currentClearance?.id ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomsClearance;