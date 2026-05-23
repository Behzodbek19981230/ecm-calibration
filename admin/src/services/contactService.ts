import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Contact } from '../lib/types';

// ── API functions ──────────────────────────────────────────────

const fetchContacts = (): Promise<Contact[]> =>
  api.get('/contacts').then((r) => r.data);

const markContactRead = (id: number): Promise<Contact> =>
  api.patch(`/contacts/${id}/read`).then((r) => r.data);

const deleteContact = (id: number) =>
  api.delete(`/contacts/${id}`);

// ── Hooks ──────────────────────────────────────────────────────

const CONTACTS_KEY = ['contacts'] as const;

export function useContacts() {
  return useQuery({ queryKey: CONTACTS_KEY, queryFn: fetchContacts });
}

export function useMarkContactRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markContactRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTACTS_KEY }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTACTS_KEY }),
  });
}
