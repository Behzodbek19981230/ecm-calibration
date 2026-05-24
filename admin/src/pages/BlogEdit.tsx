import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useLang } from '../lib/LangContext';

type Lang = 'Uz' | 'Ru' | 'En';
const LANGS: Lang[] = ['Uz', 'Ru', 'En'];
const LANG_FLAGS: Record<Lang, string> = { Uz: '🇺🇿', Ru: '🇷🇺', En: '🇬🇧' };

type FormData = {
  titleUz: string; titleRu: string; titleEn: string;
  excerptUz: string; excerptRu: string; excerptEn: string;
  contentUz: string; contentRu: string; contentEn: string;
  category: string;
  isPublished: boolean;
};

const EMPTY: FormData = {
  titleUz: '', titleRu: '', titleEn: '',
  excerptUz: '', excerptRu: '', excerptEn: '',
  contentUz: '', contentRu: '', contentEn: '',
  category: 'calibration',
  isPublished: true,
};

function Field({
  label, value, onChange, multiline = false, required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  const cls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[hsl(205,45%,25%)] focus:ring-2 focus:ring-[hsl(205,45%,25%)]/10 transition-all resize-none';
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {multiline ? (
        <textarea className={cls} rows={4} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      ) : (
        <input type="text" className={cls} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      )}
    </div>
  );
}

export default function BlogEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const be = t.blogEdit;
  const b = t.blog;
  const isNew = !id;

  const [form, setForm] = useState<FormData>(EMPTY);
  const [activeLang, setActiveLang] = useState<Lang>('Uz');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const CATEGORIES = [
    { value: 'calibration', label: b.categories.calibration },
    { value: 'metrology',   label: b.categories.metrology },
    { value: 'standards',   label: b.categories.standards },
    { value: 'news',        label: b.categories.news },
  ];

  useEffect(() => {
    if (!isNew) {
      api.get(`/blog/all`).then((r) => {
        const post = r.data.find((p: { id: number }) => p.id === Number(id));
        if (post) {
          setForm({
            titleUz: post.titleUz, titleRu: post.titleRu, titleEn: post.titleEn,
            excerptUz: post.excerptUz, excerptRu: post.excerptRu, excerptEn: post.excerptEn,
            contentUz: post.contentUz, contentRu: post.contentRu, contentEn: post.contentEn,
            category: post.category,
            isPublished: post.isPublished,
          });
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  function set(key: keyof FormData, value: string | boolean) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isNew) {
        await api.post('/blog', form);
      } else {
        await api.put(`/blog/${id}`, form);
      }
      navigate('/blog');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.common.error;
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">{t.common.loading}</div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/blog')}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            {isNew ? be.newPost : be.editPost}
          </h1>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-6 text-sm text-red-600">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Metadata row */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-700 dark:text-slate-200 mb-4 text-sm">{be.generalSettings}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{be.category}</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-[hsl(205,45%,25%)] transition-all bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => set('isPublished', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-[hsl(205,45%,25%)]' : 'bg-gray-200 dark:bg-slate-600'}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-1 ${form.isPublished ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-200">{b.published}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Multilingual content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          {/* Lang tabs */}
          <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-slate-700 rounded-xl w-fit">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setActiveLang(l)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeLang === l
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-gray-800 dark:text-slate-100'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
              >
                <span>{LANG_FLAGS[l]}</span>
                {l}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Field
              label={`${be.titleLabel} (${activeLang})`}
              value={form[`title${activeLang}` as keyof FormData] as string}
              onChange={(v) => set(`title${activeLang}` as keyof FormData, v)}
              required={activeLang === 'Uz'}
            />
            <Field
              label={`${be.excerptLabel} (${activeLang})`}
              value={form[`excerpt${activeLang}` as keyof FormData] as string}
              onChange={(v) => set(`excerpt${activeLang}` as keyof FormData, v)}
              multiline
              required={activeLang === 'Uz'}
            />
            <Field
              label={`${be.contentLabel} (${activeLang})`}
              value={form[`content${activeLang}` as keyof FormData] as string}
              onChange={(v) => set(`content${activeLang}` as keyof FormData, v)}
              multiline
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'hsl(205,45%,25%)' }}
          >
            <Save size={15} />
            {saving ? t.common.saving : t.common.save}
          </button>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
          >
            {t.common.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
