import { Star, ListChecks, Trash2, MessageCircle, Camera, Mail, Pencil, FileText } from 'lucide-react';
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

function ChannelCell({
  channel,
  detail,
  message,
}: {
  channel: ContactChannel | null;
  detail: string | null;
  message: string | null;
}) {
  if (!channel) return <span className="text-[var(--text-secondary)]">—</span>;
  const Icon = CHANNEL_ICONS[channel];
  return (
    <div className="flex flex-col items-start gap-1" title={message ? `Mensaje enviado:
${message}` : undefined}>
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${CHANNEL_STYLES[channel]}`}
      >
        <Icon size={12} />
        {channel}
        {message && <FileText size={11} className="opacity-70" />}
      </span>
      {detail && <span className="whitespace-nowrap text-xs text-[var(--text-secondary)]">{detail}</span>}
    </div>
  );
}

interface Props {
  client: Client;
  userId: string;
  onStatusChange: (client: Client, status: ClientStatus) => void;
  onToggleHighPotential: (client: Client) => void;
  onOpenBacklog: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onFileUploaded: (clientId: string, field: 'audit_doc_url' | 'proposal_doc_url', path: string) => void;
}

export default function ClientRow({
  client,
  userId,
  onStatusChange,
  onToggleHighPotential,
  onOpenBacklog,
  onEdit,
  onDelete,
  onFileUploaded,
}: Props) {
  const completed = client.backlog?.filter((i) => i.checked).length ?? 0;
  const total = client.backlog?.length ?? 0;

  return (
    <tr
      className={`border-b border-[var(--border-subtle)] text-sm transition-colors last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] ${
        client.is_high_potential ? 'border-l-2 border-l-[#006aff]' : 'border-l-2 border-l-transparent'
      }`}
    >
      <td className="whitespace-nowrap px-4 py-3 font-medium">
        <div className="group flex items-center gap-2">
          <span>{client.client_name}</span>
          <button
            onClick={() => onEdit(client)}
            title="Editar cliente"
            className="rounded-md p-1 text-[var(--text-secondary)] opacity-0 transition-opacity hover:bg-black/5 hover:text-[#006aff] group-hover:opacity-100 dark:hover:bg-white/5"
          >
            <Pencil size={14} />
          </button>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">
        {client.contact_name || '—'}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-[var(--text-secondary)]">{client.city || '—'}</td>
      <td className="px-4 py-3">
        <ChannelCell channel={client.contact_channel} detail={client.contact_detail} message={client.contact_message} />
      </td>
      <td className="px-4 py-3">
        <ChannelCell
          channel={client.contact_channel_2}
          detail={client.contact_detail_2}
          message={client.contact_message_2}
        />
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
