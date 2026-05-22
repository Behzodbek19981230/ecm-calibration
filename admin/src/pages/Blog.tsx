import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';
import type { BlogPost } from '../lib/types';

const CATEGORY_LABELS: Record<string, string> = {
  calibration: 'Kalibrlash',
  metrology: 'Metrologiya',
  standards: 'Standartlar',
  news: 'Yangiliklar',
};

const CATEGORY_COLORS: Record<string, string> = {
  calibration: 'bg-blue-100 text-blue-700',
  metrology: 'bg-orange-100 text-orange-700',
  standards: 'bg-green-100 text-green-700',
  news: 'bg-purple-100 text-purple-700',
};

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchPosts() {
    api.get('/blog/all').then((r) => setPosts(r.data)).finally(() => setLoading(false));
  }

  useEffect(() => { fetchPosts(); }, []);

  async function deletePost(id: number) {
    if (!confirm("Bu postni o'chirishni xohlaysizmi?")) return;
    await api.delete(`/blog/${id}`);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function togglePublish(post: BlogPost) {
    const updated = await api.put(`/blog/${post.id}`, { isPublished: !post.isPublished });
    setPosts((prev) => prev.map((p) => p.id === post.id ? updated.data : p));
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog postlari</h1>
          <p className="text-sm text-gray-500 mt-1">{posts.length} ta post</p>
        </div>
        <button
          onClick={() => navigate('/blog/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'hsl(205,45%,25%)' }}
        >
          <Plus size={16} />
          Yangi post
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Yuklanmoqda...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 mb-4">Hozircha post yo'q</p>
            <button
              onClick={() => navigate('/blog/new')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'hsl(205,45%,25%)' }}
            >
              Birinchi postni yarating
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Sarlavha (UZ)</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Kategoriya</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Holat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Sana</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[260px]">
                      {post.titleUz}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[260px] mt-0.5">
                      {post.excerptUz}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {CATEGORY_LABELS[post.category] || post.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        post.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {post.isPublished ? <Eye size={10} /> : <EyeOff size={10} />}
                      {post.isPublished ? 'Chop etilgan' : 'Yashirin'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => togglePublish(post)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                        title={post.isPublished ? "Yashirish" : "Chop etish"}
                      >
                        {post.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => navigate(`/blog/${post.id}/edit`)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                        title="Tahrirlash"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                        title="O'chirish"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
