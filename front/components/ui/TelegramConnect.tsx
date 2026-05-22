'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, CheckCircle, Loader, RefreshCw } from 'lucide-react';

type Status = 'idle' | 'loading' | 'waiting' | 'connected' | 'expired' | 'error';

interface TelegramConnectProps {
  onConnect: (chatId: string) => void;
  onDisconnect: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TelegramConnect({ onConnect, onDisconnect }: TelegramConnectProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [token, setToken] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [username, setUsername] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const startConnect = async () => {
    setStatus('loading');
    try {
      const res = await fetch(`${API}/api/telegram/token`, { method: 'POST' });
      const data = await res.json();
      setToken(data.token);
      setBotUsername(data.botUsername);
      setStatus('waiting');

      window.open(`https://t.me/${data.botUsername}?start=${data.token}`, '_blank');

      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${API}/api/telegram/status/${data.token}`);
          const d = await r.json();
          if (d.connected) {
            stopPolling();
            setUsername(d.username ?? '');
            setStatus('connected');
            onConnect(d.chatId);
          } else if (d.expired) {
            stopPolling();
            setStatus('expired');
          }
        } catch {
          // network hiccup — keep polling
        }
      }, 2000);

      setTimeout(() => {
        stopPolling();
        setStatus(s => s === 'waiting' ? 'expired' : s);
      }, 10 * 60 * 1000);
    } catch {
      setStatus('error');
    }
  };

  const disconnect = () => {
    stopPolling();
    setToken('');
    setUsername('');
    setStatus('idle');
    onDisconnect();
  };

  useEffect(() => () => stopPolling(), []);

  if (status === 'connected') {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-green-200 bg-green-50">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600 shrink-0" />
          <span className="text-sm text-green-700 font-medium">
            {username ? `@${username}` : 'Telegram'} ulandi
          </span>
        </div>
        <button
          type="button"
          onClick={disconnect}
          className="text-xs text-green-600 underline underline-offset-2 hover:no-underline"
        >
          O&apos;chirish
        </button>
      </div>
    );
  }

  if (status === 'waiting') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-blue-50 border-blue-200">
          <Loader size={15} className="text-blue-600 animate-spin shrink-0" />
          <span className="text-sm text-blue-700">Telegramda botni oching va /start bosing...</span>
        </div>
        <button
          type="button"
          onClick={() => window.open(`https://t.me/${botUsername}?start=${token}`, '_blank')}
          className="text-xs text-blue-600 underline underline-offset-2"
        >
          Botni qayta ochish
        </button>
      </div>
    );
  }

  if (status === 'expired' || status === 'error') {
    return (
      <button
        type="button"
        onClick={startConnect}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-red-200 bg-red-50 text-sm text-red-600 w-full hover:bg-red-100 transition-colors"
      >
        <RefreshCw size={15} />
        {status === 'expired' ? 'Muddat tugadi — qayta ulash' : 'Xatolik — qayta urinish'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startConnect}
      disabled={status === 'loading'}
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all w-full disabled:opacity-60"
      style={{ background: '#0088CC', color: '#fff', borderColor: '#0088CC' }}
    >
      {status === 'loading'
        ? <Loader size={15} className="animate-spin" />
        : <Send size={15} />}
      Telegram orqali ulash
    </button>
  );
}
