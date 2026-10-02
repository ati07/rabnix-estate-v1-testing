'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { CITIES_DATA } from '@/lib/realEstateData';
import {
  MapPin, Plus, Trash2, Pencil, Loader2, UploadCloud, X, Check, Save, Eye, EyeOff, RefreshCw,
} from 'lucide-react';

interface CuratedLocality {
  id: string;
  city: string;
  name: string;
  thumbnail: string;
  sortOrder: number;
  liveCount: number;
}
interface AvailableData {
  fromListings: { name: string; count: number }[];
  suggestions: string[];
  curatedNames: string[];
}

const EMPTY_AVAIL: AvailableData = { fromListings: [], suggestions: [], curatedNames: [] };

export function LocalitiesPanel() {
  const cities = CITIES_DATA.map((c) => c.name);
  const [city, setCity] = useState<string>(cities.includes('Lucknow') ? 'Lucknow' : cities[0]);
  const [items, setItems] = useState<CuratedLocality[]>([]);
  const [avail, setAvail] = useState<AvailableData>(EMPTY_AVAIL);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add / edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (msg: string) => { setBanner(msg); setTimeout(() => setBanner(null), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, availRes] = await Promise.all([
        fetch(`/api/admin/localities?city=${encodeURIComponent(city)}`, { cache: 'no-store', credentials: 'same-origin' }),
        fetch(`/api/admin/localities/available?city=${encodeURIComponent(city)}`, { cache: 'no-store', credentials: 'same-origin' }),
      ]);
      const list = await listRes.json();
      const av = await availRes.json();
      setItems(list?.success ? list.localities : []);
      setAvail(av?.success ? { fromListings: av.fromListings, suggestions: av.suggestions, curatedNames: av.curatedNames } : EMPTY_AVAIL);
    } catch {
      setError('Could not load localities.');
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setEditingId(null); setName(''); setThumbnail(''); setSortOrder(0); setError(null); };

  const startEdit = (l: CuratedLocality) => {
    setEditingId(l.id);
    setName(l.name);
    setThumbnail(l.thumbnail);
    setSortOrder(l.sortOrder);
    setError(null);
    if (typeof document !== 'undefined') document.getElementById('locality-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'same-origin' });
      const data = await res.json();
      if (data?.success && data.urls?.[0]) setThumbnail(data.urls[0]);
      else setError(data?.error || 'Upload failed.');
    } catch {
      setError('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !thumbnail.trim()) { setError('Locality name and a thumbnail image are required.'); return; }
    setSubmitting(true);
    try {
      const payload = { city, name: name.trim(), thumbnail: thumbnail.trim(), sortOrder };
      const res = editingId
        ? await fetch(`/api/admin/localities/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'same-origin' })
        : await fetch('/api/admin/localities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'same-origin' });
      const data = await res.json();
      if (!data?.success) { setError(data?.error || 'Could not save.'); return; }
      flash(editingId ? `Updated "${name}".` : `Added "${name}" to ${city}.`);
      resetForm();
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (l: CuratedLocality) => {
    if (typeof window !== 'undefined' && !window.confirm(`Remove "${l.name}" from ${l.city}? This only removes the home-page tile, not any listings.`)) return;
    await fetch(`/api/admin/localities/${l.id}`, { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
    flash(`Removed "${l.name}".`);
    if (editingId === l.id) resetForm();
    load();
  };

  // Live count for the name currently typed in the form (matches server logic).
  const typedMatch = avail.fromListings.find((f) => f.name.toLowerCase() === name.trim().toLowerCase());
  const pickName = (n: string) => { setName(n); if (error) setError(null); };

  const labelCls = 'text-xs font-bold text-[#0F2A43]';
  const inputCls = 'w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#18A67D]/40';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {banner && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <Check className="w-4 h-4" /> {banner}
        </div>
      )}

      {/* Header + city picker */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-base text-[#0F2A43] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#18A67D]" /> Popular Localities
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5 max-w-xl">
              Curate the home-page &ldquo;Popular Localities&rdquo; tiles. Price range and the
              &ldquo;Properties for Sale&rdquo; count are computed live from approved listings — a
              tile is <strong>only shown on the site when it has real inventory</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select value={city} onChange={(e) => { resetForm(); setCity(e.target.value); }} className={inputCls + ' !w-auto font-bold'}>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={load} className="p-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / edit form */}
      <form id="locality-form" onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-sm text-[#0F2A43]">{editingId ? 'Edit Locality' : `Add Locality to ${city}`}</h4>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-xs font-bold text-[#64748B] hover:text-[#0F2A43] flex items-center gap-1 cursor-pointer">
              <X className="w-3.5 h-3.5" /> Cancel edit
            </button>
          )}
        </div>

        {error && <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          <div className="space-y-1.5">
            <label className={labelCls}>Locality name</label>
            <input value={name} onChange={(e) => pickName(e.target.value)} placeholder="e.g. Gomti Nagar" className={inputCls} list="locality-suggestions" />
            <datalist id="locality-suggestions">
              {avail.fromListings.map((f) => <option key={'l' + f.name} value={f.name} />)}
              {avail.suggestions.map((s) => <option key={'s' + s} value={s} />)}
            </datalist>
            {name.trim() && (
              typedMatch
                ? <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1"><Eye className="w-3 h-3" /> Matches {typedMatch.count} approved listing{typedMatch.count === 1 ? '' : 's'} — will show on site</p>
                : <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1"><EyeOff className="w-3 h-3" /> No approved listings match this name yet — tile stays hidden until inventory exists</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>Sort order</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} className={inputCls + ' md:w-28'} />
          </div>
        </div>

        {/* Thumbnail upload */}
        <div className="space-y-1.5">
          <label className={labelCls}>Thumbnail image</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-xs relative bg-[#E2E8F0] flex-shrink-0">
              {thumbnail
                ? <Image src={thumbnail} alt="thumbnail" fill sizes="64px" className="object-cover" referrerPolicy="no-referrer" />
                : <div className="w-full h-full flex items-center justify-center text-[#94A3B8]"><MapPin className="w-5 h-5" /></div>}
            </div>
            <div className="flex flex-col gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#0F2A43] hover:bg-[#F8FAFC] flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                {uploading ? 'Uploading…' : (thumbnail ? 'Replace image' : 'Upload image')}
              </button>
              <input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="…or paste an image URL" className={inputCls + ' text-xs'} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={submitting || uploading} className="px-5 py-2 rounded-xl bg-[#0F2A43] hover:bg-[#163b5c] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingId ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {editingId ? 'Save Changes' : 'Add Locality'}
          </button>
        </div>
      </form>

      {/* Quick-add from real inventory */}
      {avail.fromListings.filter((f) => !avail.curatedNames.some((c) => c.toLowerCase() === f.name.toLowerCase())).length > 0 && (
        <div className="bg-[#F0FAF6] p-4 rounded-2xl border border-[#D1F0E6]">
          <p className="text-xs font-black text-[#0E7C5D] mb-2">Localities with approved listings (not yet curated) — click to pre-fill the form:</p>
          <div className="flex flex-wrap gap-2">
            {avail.fromListings
              .filter((f) => !avail.curatedNames.some((c) => c.toLowerCase() === f.name.toLowerCase()))
              .map((f) => (
                <button key={f.name} type="button" onClick={() => { resetForm(); pickName(f.name); }} className="px-3 py-1.5 rounded-full bg-white border border-[#CBEFE0] text-xs font-bold text-[#0E7C5D] hover:bg-[#E7F6F1] cursor-pointer flex items-center gap-1.5">
                  <Plus className="w-3 h-3" /> {f.name} <span className="text-[10px] text-[#64748B]">({f.count})</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Curated list */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
          <h4 className="font-black text-sm text-[#0F2A43]">Curated for {city} <span className="text-[#64748B] font-bold">({items.length})</span></h4>
        </div>
        {loading ? (
          <div className="p-8 flex items-center justify-center text-[#64748B] text-sm gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748B]">No curated localities for {city} yet. Add one above — the home page will keep showing the built-in fallback tiles until you do.</div>
        ) : (
          <ul className="divide-y divide-[#F1F5F9]">
            {items.map((l) => {
              const visible = l.liveCount > 0;
              return (
                <li key={l.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#F8FAFC]">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-[#E2E8F0] relative bg-[#E2E8F0] flex-shrink-0">
                    <Image src={l.thumbnail} alt={l.name} fill sizes="44px" className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0F2A43] truncate">{l.name}</span>
                      {visible
                        ? <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1"><Eye className="w-3 h-3" /> LIVE · {l.liveCount}</span>
                        : <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1"><EyeOff className="w-3 h-3" /> HIDDEN · 0</span>}
                    </div>
                    <span className="text-[11px] text-[#64748B]">Sort #{l.sortOrder}</span>
                  </div>
                  <button onClick={() => startEdit(l)} className="p-2 rounded-lg text-[#64748B] hover:bg-slate-100 hover:text-[#0F2A43] cursor-pointer" title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(l)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer" title="Remove"><Trash2 className="w-4 h-4" /></button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
