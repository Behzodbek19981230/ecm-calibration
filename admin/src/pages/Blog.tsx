import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';
import type { BlogPost } from '../lib/types';
import { useLang } from '../lib/LangContext';

const CATEGORY_COLORS: Record<string, string> = {
  calibration: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  metrology:   'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400',
  standards:   'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  news:        'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400',
};

export default function Blog() {
  const navigate = useNavigate();
  const { t } = useLang();
  const b = t.blog;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchPosts() {
    api.get('/blog/all').then((r) => setPosts(r.data)).finally(() => setLoading(false));
  }
  useEffect(() => { fetchPosts(); }, []);

  async function deletePost(id: number) {
    if (!confirm(b.confirmDelete)) return;
    await api.delete(`/blog/${id}`);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function togglePublish(post: BlogPost) {
    const updated = await api.put(`/blog/${post.id}`, { isPublished: !post.isPublished });
    setPosts((prev) => prev.map((p) => p.id === post.id ? updated.data : p));
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{b.title}</h1>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">{posts.length} {b.subtitle}</p>
        </div>
        <button
          onClick={() => navigate('/blog/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'hsl(205,45%,25%)' }}
        >
          <Plus size={16} />
          {b.createNew}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400 dark:text-slate-500">{t.common.loading}</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-400 dark:text-slate-500 mb-4">{b.noPosts}</p>
            <button
              onClick={() => navigate('/blog/new')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'hsl(205,45%,25%)' }}
            >
              {b.createFirst}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                  {[b.cols.title, b.cols.category, b.cols.status, b.cols.date, ''].map((h, i) => (
                    <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate max-w-[260px]">{post.titleUz}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-[260px] mt-0.5">{post.excerptUz}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category] || 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'}`}>
                        {b.categories[post.category as keyof typeof b.categories] || post.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${post.isPublished ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                        {post.isPublished ? <Eye size={10} /> : <EyeOff size={10} />}
                        {post.isPublished ? b.published : b.hidden}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 dark:text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => togglePublish(post)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-all"
                          title={post.isPublished ? b.hide : b.publish}
                        >
                          {post.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => navigate(`/blog/${post.id}/edit`)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 text-gray-400 dark:text-slate-500 hover:text-blue-600 transition-all"
                          title={t.common.edit}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-gray-400 dark:text-slate-500 hover:text-red-500 transition-all"
                          title={t.common.delete}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
