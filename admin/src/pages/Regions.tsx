import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import api from '../lib/api';
import type { Region } from '../lib/types';

export default function Regions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const [newRegion, setNewRegion] = useState('');
  const [addingRegion, setAddingRegion] = useState(false);
  const [regionError, setRegionError] = useState('');

  const [newDistrict, setNewDistrict] = useState<Record<number, string>>({});
  const [addingDistrict, setAddingDistrict] = useState<number | null>(null);

  function fetchRegions() {
    api.get('/regions').then((r) => setRegions(r.data)).finally(() => setLoading(false));
  }

  useEffect(() => { fetchRegions(); }, []);

  async function addRegion() {
    if (!newRegion.trim()) return;
    setRegionError('');
    try {
      await api.post('/regions', { name: newRegion.trim() });
      setNewRegion('');
      setAddingRegion(false);
      fetchRegions();
    } catch (e: any) {
      setRegionError(e.response?.data?.error || 'Error');
    }
  }

  async function deleteRegion(id: number) {
    if (!confirm("Bu viloyat va barcha tumanlarini o'chirishni xohlaysizmi?")) return;
    await api.delete(`/regions/${id}`);
    fetchRegions();
  }

  async function addDistrict(regionId: number) {
    const name = newDistrict[regionId]?.trim();
    if (!name) return;
    await api.post(`/regions/${regionId}/districts`, { name });
    setNewDistrict((p) => ({ ...p, [regionId]: '' }));
    setAddingDistrict(null);
    fetchRegions();
  }

  async function deleteDistrict(id: number) {
    if (!confirm("Bu tumanni o'chirishni xohlaysizmi?")) return;
    await api.delete(`/regions/districts/${id}`);
    fetchRegions();
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hududlar</h1>
          <p className="text-sm text-gray-500 mt-1">Viloyat va tumanlarni boshqarish</p>
        </div>
        {!addingRegion && (
          <button
            onClick={() => { setAddingRegion(true); setRegionError(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Viloyat qo'shish
          </button>
        )}
      </div>

      {addingRegion && (
        <div className="mb-5 p-4 rounded-xl border border-blue-200 bg-blue-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Yangi viloyat nomi</p>
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addRegion(); if (e.key === 'Escape') setAddingRegion(false); }}
              placeholder="Masalan: Toshkent shahri"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500"
            />
            <button onClick={addRegion} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Saqlash
            </button>
            <button
              onClick={() => { setAddingRegion(false); setNewRegion(''); setRegionError(''); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Bekor
            </button>
          </div>
          {regionError && <p className="text-red-500 text-xs mt-1">{regionError}</p>}
        </div>
      )}

      {regions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Hech qanday viloyat qo'shilmagan</p>
        </div>
      ) : (
        <div className="space-y-2">
          {regions.map((region) => (
            <div key={region.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  className="flex items-center gap-2 flex-1 text-left"
                  onClick={() => setExpanded(expanded === region.id ? null : region.id)}
                >
                  {expanded === region.id
                    ? <ChevronDown size={16} className="text-gray-400 shrink-0" />
                    : <ChevronRight size={16} className="text-gray-400 shrink-0" />}
                  <span className="font-medium text-gray-800 text-sm">{region.name}</span>
                  <span className="text-xs text-gray-400 ml-1">({region.districts.length} tuman)</span>
                </button>
                <button
                  onClick={() => deleteRegion(region.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {expanded === region.id && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  <div className="space-y-1.5 mb-3">
                    {region.districts.length === 0 ? (
                      <p className="text-xs text-gray-400 py-1">Tumanlar yo'q</p>
                    ) : (
                      region.districts.map((district) => (
                        <div key={district.id} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white group">
                          <span className="text-sm text-gray-700">{district.name}</span>
                          <button
                            onClick={() => deleteDistrict(district.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 rounded transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {addingDistrict === region.id ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={newDistrict[region.id] || ''}
                        onChange={(e) => setNewDistrict((p) => ({ ...p, [region.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') addDistrict(region.id); if (e.key === 'Escape') setAddingDistrict(null); }}
                        placeholder="Tuman nomi"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 bg-white"
                      />
                      <button onClick={() => addDistrict(region.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                        Qo'shish
                      </button>
                      <button onClick={() => setAddingDistrict(null)} className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-white">
                        Bekor
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingDistrict(region.id)}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium py-1"
                    >
                      <Plus size={13} />
                      Tuman qo'shish
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
