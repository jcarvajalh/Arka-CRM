import { Star, ListChecks, Trash2, MessageCircle, Camera, Mail } from 'lucide-react';
import StatusBadge from './StatusBadge';
import FileUpload from './FileUpload';
import { formatDate } from '../../lib/format';
import type { Client, ClientStatus, ContactChannel } from '../../lib/types';

const CHANNEL_STYLES: Record<ContactChannel, string> = {
  WhatsApp: 'bg-green-500/20 text-green-400',
  Instagram: 'bg-pink-500/20 text-pink-400',
  Correo: 'bg-blue-500/20 text-blue-400',
};

const CHANNEL_ICONS: Record<ContactChannel, typeof MessageCircle> = {
  WhatsApp: MessageCircle,
  Instagram: Camera,
  Correo: Mail,
};

interface Props {
  client: Client;
  userId: string;
  onStatusChange: (client: Client, status: ClientStatus) => void;
  onToggleHighPotential: (client: Client) => void;
  onOpenBacklog: (client: Client) => void;
  onDelete: (client: Client) => void;
  onFileUploaded: (clientId: string, field: 'audit_doc_url' | 'proposal_doc_url', path: string) => void;
}

export default function ClientRow({
  client,
  userId,
  onStatusChange,
  onToggleHighPotential,
  onOpenBacklog,
  onDelete,
  onFileUploaded,
}: Props) {
  const ChannelIcon = client.contact_channel ? CHANNEL_ICONS[client.contact_channel] : null;
  const completed = client.backlog?.filter((i) => i.checked).length ?? 0;
  const total = client.backlog?.length ?? 0;

  return (
    <tr
      className={`border-b border-[var(--border-subtle)] text-sm transition-colors last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] ${
        client.is_high_potential ? 'border-l-2 border-l-[#006aff]' : 'border-l-2 border-l-transparent'
      }`}
    >
      <td className="whitespace-nowrap px-4 py-3 font-medium">{client.client_name}</td>
      <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">
        {client.contact_name || '—'}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {client.contact_channel && ChannelIcon ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${CHANNEL_STYLES[client.contact_channel]}`}
          >
            <ChannelIcon size={12} />
            {client.contact_channel}
          </span>
        ) : (
          <span className="text-[var(--text-secondary)]">—</span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">
        {client.contact_detail || '—'}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <StatusBadge status={client.status} onChange={(status) => onStatusChange(client, status)} />
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">{formatDate(client.date)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">{client.niche || '—'}</td>
      <td className="whitespace-nowrap px-4 py-3">
        <button
          onClick={() => onOpenBacklog(client)}
          title="Ver backlog"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ListChecks size={15} className={total > 0 && completed === total ? 'text-green-400' : 'text-[var(--text-secondary)]'} />
          <span className="text-[var(--text-secondary)]">
            {completed}/{total}
          </span>
        </button>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleHighPotential(client)}
            title="Cliente potencial"
            className={`rounded-md p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
              client.is_high_potential ? 'text-[#006aff]' : 'opacity-40'
            }`}
          >
            <Star size={15} fill={client.is_high_potential ? 'currentColor' : 'none'} />
          </button>

          {client.has_website && (
            <FileUpload
              client={client}
              field="audit_doc_url"
              label="Auditoría"
              userId={userId}
              onUploaded={(path) => onFileUploaded(client.id, 'audit_doc_url', path)}
            />
          )}

          <FileUpload
            client={client}
            field="proposal_doc_url"
            label="Propuesta"
            userId={userId}
            onUploaded={(path) => onFileUploaded(client.id, 'proposal_doc_url', path)}
          />

          <button
            onClick={() => onDelete(client)}
            title="Eliminar cliente"
            className="rounded-md p-1.5 opacity-40 transition-colors hover:bg-red-500/10 hover:text-red-400 hover:opacity-100"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
