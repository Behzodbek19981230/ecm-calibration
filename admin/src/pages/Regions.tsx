import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import api from '../lib/api';
import type { Region } from '../lib/types';
import { useLang } from '../lib/LangContext';

export default function Regions() {
  const { t } = useLang();
  const r = t.regions;
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [newRegion, setNewRegion] = useState('');
  const [addingRegion, setAddingRegion] = useState(false);
  const [regionError, setRegionError] = useState('');
  const [newDistrict, setNewDistrict] = useState<Record<number, string>>({});
  const [addingDistrict, setAddingDistrict] = useState<number | null>(null);

  function fetchRegions() { api.get('/regions').then((x) => setRegions(x.data)).finally(() => setLoading(false)); }
  useEffect(() => { fetchRegions(); }, []);

  async function addRegion() {
    if (!newRegion.trim()) return;
    setRegionError('');
    try {
      await api.post('/regions', { name: newRegion.trim() });
      setNewRegion(''); setAddingRegion(false); fetchRegions();
    } catch (e: unknown) {
      setRegionError((e as {response?:{data?:{error?:string}}})?.response?.data?.error || t.common.error);
    }
  }

  async function deleteRegion(id: number) {
    if (!confirm(r.confirmDeleteRegion)) return;
    await api.delete(`/regions/${id}`); fetchRegions();
  }

  async function addDistrict(regionId: number) {
    const name = newDistrict[regionId]?.trim();
    if (!name) return;
    await api.post(`/regions/${regionId}/districts`, { name });
    setNewDistrict((p) => ({ ...p, [regionId]: '' }));
    setAddingDistrict(null); fetchRegions();
  }

  async function deleteDistrict(id: number) {
    if (!confirm(r.confirmDeleteDistrict)) return;
    await api.delete(`/regions/districts/${id}`); fetchRegions();
  }

  if (loading) return (
    <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(205,45%,35%)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{r.title}</h1>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">{r.subtitle}</p>
        </div>
        {!addingRegion && (
          <button
            onClick={() => { setAddingRegion(true); setRegionError(''); }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'hsl(205,45%,25%)' }}
          >
            <Plus size={15} />
            {r.addRegion}
          </button>
        )}
      </div>

      {addingRegion && (
        <div className="mb-5 p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{r.newRegionLabel}</p>
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addRegion(); if (e.key === 'Escape') setAddingRegion(false); }}
              placeholder={r.placeholder}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-sm outline-none bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-[hsl(205,45%,25%)]"
            />
            <button onClick={addRegion} className="px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all" style={{ background: 'hsl(205,45%,25%)' }}>
              {r.save}
            </button>
            <button
              onClick={() => { setAddingRegion(false); setNewRegion(''); setRegionError(''); }}
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t.common.cancel}
            </button>
          </div>
          {regionError && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{regionError}</p>}
        </div>
      )}

      {regions.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-slate-500">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{r.noRegions}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {regions.map((region) => (
            <div key={region.id} className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  className="flex items-center gap-2 flex-1 text-left"
                  onClick={() => setExpanded(expanded === region.id ? null : region.id)}
                >
                  {expanded === region.id
                    ? <ChevronDown size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
                    : <ChevronRight size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />}
                  <span className="font-medium text-gray-800 dark:text-slate-100 text-sm">{region.name}</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">({region.districts.length} {r.districtsCount})</span>
                </button>
                <button onClick={() => deleteRegion(region.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              {expanded === region.id && (
                <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-3 bg-gray-50 dark:bg-slate-700/50">
                  <div className="space-y-1.5 mb-3">
                    {region.districts.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-slate-500 py-1">{r.noDistricts}</p>
                    ) : region.districts.map((district) => (
                      <div key={district.id} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 group">
                        <span className="text-sm text-gray-700 dark:text-slate-200">{district.name}</span>
                        <button
                          onClick={() => deleteDistrict(district.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 rounded transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {addingDistrict === region.id ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={newDistrict[region.id] || ''}
                        onChange={(e) => setNewDistrict((p) => ({ ...p, [region.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') addDistrict(region.id); if (e.key === 'Escape') setAddingDistrict(null); }}
                        placeholder={r.districtPlaceholder}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-sm outline-none bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-[hsl(205,45%,25%)]"
                      />
                      <button onClick={() => addDistrict(region.id)} className="px-3 py-1.5 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all" style={{ background: 'hsl(205,45%,25%)' }}>
                        {t.common.add}
                      </button>
                      <button onClick={() => setAddingDistrict(null)} className="px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-xs text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700">
                        {t.common.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingDistrict(region.id)}
                      className="flex items-center gap-1.5 text-xs font-medium py-1 transition-colors"
                      style={{ color: 'hsl(205,45%,25%)' }}
                    >
                      <Plus size={13} />
                      {r.addDistrict}
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
