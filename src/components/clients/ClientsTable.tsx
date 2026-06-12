import { useCallback, useEffect, useState } from 'react';
import { Plus, Inbox } from 'lucide-react';
import ClientRow from './ClientRow';
import StatusBadge from './StatusBadge';
import BacklogModal from './BacklogModal';
import NewClientModal from './NewClientModal';
import { supabase } from '../../lib/supabase/client';
import { showToast } from '../../lib/toast';
import { formatDate } from '../../lib/format';
import type { Client, ClientStatus } from '../../lib/types';

export type ClientsView = 'con-web' | 'sin-web' | 'ganados';

interface Props {
  view: ClientsView;
}

const VIEW_CONFIG: Record<ClientsView, { title: string; emptyMessage: string }> = {
  'con-web': {
    title: 'Clientes con sitio web',
    emptyMessage: 'Aún no tienes prospectos con sitio web. Agrega el primero para empezar a darle seguimiento.',
  },
  'sin-web': {
    title: 'Clientes sin sitio web',
    emptyMessage: 'Aún no tienes prospectos sin sitio web. Agrega el primero para empezar a darle seguimiento.',
  },
  ganados: {
    title: 'Clientes ganados',
    emptyMessage: 'Todavía no tienes clientes ganados. Cuando un cliente pase a estado "Ganado" aparecerá aquí.',
  },
};

const TABLE_COLUMNS = ['Cliente', 'Contacto', 'Canal', 'Medio', 'Estado', 'Fecha', 'Nicho', 'Backlog', 'Acciones'];

function matchesView(client: Client, view: ClientsView): boolean {
  if (view === 'ganados') return client.status === 'Ganado';
  return client.has_website === (view === 'con-web') && client.status !== 'Ganado';
}

export default function ClientsTable({ view }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [backlogClient, setBacklogClient] = useState<Client | null>(null);
  const [newClientOpen, setNewClientOpen] = useState(false);

  const fetchClients = useCallback(
    async (uid: string) => {
      let query = supabase.from('clients').select('*').eq('user_id', uid);

      if (view === 'ganados') {
        query = query.eq('status', 'Ganado');
      } else {
        query = query.eq('has_website', view === 'con-web').neq('status', 'Ganado');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        showToast('No se pudieron cargar los clientes.', 'error');
        return;
      }

      setClients((data ?? []) as Client[]);
    },
    [view]
  );

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function init() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        setLoading(false);
        return;
      }

      setUserId(user.id);
      await fetchClients(user.id);
      if (cancelled) return;
      setLoading(false);

      channel = supabase
        .channel(`clients-${view}-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'clients', filter: `user_id=eq.${user.id}` },
          () => fetchClients(user.id)
        )
        .subscribe();
    }

    init();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [view, fetchClients]);

  async function handleStatusChange(client: Client, status: ClientStatus) {
    if (status === 'Ganado' && client.status !== 'Ganado') {
      const confirmed = window.confirm(
        `¿Marcar a "${client.client_name}" como Ganado?\nPasará a la vista de Clientes ganados.`
      );
      if (!confirmed) return;
    }

    const { error } = await supabase.from('clients').update({ status }).eq('id', client.id);

    if (error) {
      showToast('No se pudo actualizar el estado.', 'error');
      return;
    }

    setClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, status } : c)).filter((c) => matchesView(c, view))
    );

    if (status === 'Ganado') {
      showToast(`"${client.client_name}" se movió a Clientes ganados.`, 'success');
    }
  }

  async function handleToggleHighPotential(client: Client) {
    const next = !client.is_high_potential;
    const { error } = await supabase.from('clients').update({ is_high_potential: next }).eq('id', client.id);

    if (error) {
      showToast('No se pudo actualizar el cliente.', 'error');
      return;
    }

    setClients((prev) => prev.map((c) => (c.id === client.id ? { ...c, is_high_potential: next } : c)));
  }

  async function handleDelete(client: Client) {
    const confirmed = window.confirm(`¿Eliminar a "${client.client_name}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    const { error } = await supabase.from('clients').delete().eq('id', client.id);

    if (error) {
      showToast('No se pudo eliminar el cliente.', 'error');
      return;
    }

    setClients((prev) => prev.filter((c) => c.id !== client.id));
    showToast('Cliente eliminado.', 'success');
  }

  function handleFileUploaded(clientId: string, field: 'audit_doc_url' | 'proposal_doc_url', path: string) {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, [field]: path } : c)));
  }

  function handleBacklogSaved(backlog: Client['backlog']) {
    if (!backlogClient) return;
    setClients((prev) => prev.map((c) => (c.id === backlogClient.id ? { ...c, backlog } : c)));
  }

  const config = VIEW_CONFIG[view];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{config.title}</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {clients.length} {clients.length === 1 ? 'cliente' : 'clientes'}
          </p>
        </div>
        <button
          onClick={() => setNewClientOpen(true)}
          className="flex items-center gap-2 rounded-md bg-[#006aff] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          Nuevo cliente
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-[var(--text-secondary)]">
          Cargando…
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border-subtle)] py-20 text-center">
          <Inbox size={28} className="text-[var(--text-secondary)]" />
          <p className="max-w-sm text-sm text-[var(--text-secondary)]">{config.emptyMessage}</p>
          <button
            onClick={() => setNewClientOpen(true)}
            className="mt-2 flex items-center gap-2 rounded-md bg-[#006aff] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Nuevo cliente
          </button>
        </div>
      ) : view === 'ganados' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <a
              key={client.id}
              href={`/proyecto/${client.id}`}
              className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[#006aff]/50"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{client.client_name}</p>
                <StatusBadge status={client.status} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{client.contact_name || 'Sin contacto'}</p>
              <div className="mt-auto flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>{client.niche || '—'}</span>
                <span>{formatDate(client.date)}</span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                {TABLE_COLUMNS.map((col) => (
                  <th key={col} className="whitespace-nowrap px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  userId={userId ?? ''}
                  onStatusChange={handleStatusChange}
                  onToggleHighPotential={handleToggleHighPotential}
                  onOpenBacklog={setBacklogClient}
                  onDelete={handleDelete}
                  onFileUploaded={handleFileUploaded}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {backlogClient && (
        <BacklogModal client={backlogClient} onClose={() => setBacklogClient(null)} onSaved={handleBacklogSaved} />
      )}

      {newClientOpen && userId && (
        <NewClientModal
          userId={userId}
          defaultHasWebsite={view !== 'sin-web'}
          onClose={() => setNewClientOpen(false)}
          onCreated={() => fetchClients(userId)}
        />
      )}
    </div>
  );
}
