import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Mail, FileText, MailOpen, BookOpen } from 'lucide-react';
import api from '../lib/api';
import type { Contact, BlogPost } from '../lib/types';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/contacts'), api.get('/blog/all')])
      .then(([c, b]) => {
        setContacts(c.data);
        setPosts(b.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const unread = contacts.filter((c) => !c.isRead).length;
  const published = posts.filter((p) => p.isPublished).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">ECM Calibration boshqaruv paneli</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Mail size={20} className="text-blue-600" />}
            label="Jami xabarlar"
            value={contacts.length}
            color="bg-blue-50"
          />
          <StatCard
            icon={<MailOpen size={20} className="text-orange-500" />}
            label="O'qilmagan"
            value={unread}
            color="bg-orange-50"
          />
          <StatCard
            icon={<FileText size={20} className="text-green-600" />}
            label="Jami postlar"
            value={posts.length}
            color="bg-green-50"
          />
          <StatCard
            icon={<BookOpen size={20} className="text-purple-600" />}
            label="Chop etilgan"
            value={published}
            color="bg-purple-50"
          />
        </div>
      )}

      {/* Recent contacts */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">So'nggi xabarlar</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {contacts.slice(0, 5).map((c) => (
            <div key={c.id} className="px-6 py-4 flex items-start gap-4">
              <div
                className={`w-2 h-2 rounded-full mt-2 shrink-0 ${c.isRead ? 'bg-gray-300' : 'bg-orange-400'}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-800">{c.name}</p>
                  {c.company && (
                    <span className="text-xs text-gray-400">— {c.company}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{c.message}</p>
              </div>
              <p className="text-xs text-gray-400 shrink-0">
                {new Date(c.createdAt).toLocaleDateString('uz-UZ')}
              </p>
            </div>
          ))}
          {contacts.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-gray-400">Hozircha xabar yo'q</p>
          )}
        </div>
      </div>
    </div>
  );
}
