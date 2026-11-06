import { useState, type SubmitEvent } from 'react';
import Modal from '../ui/Modal';
import { supabase } from '../../lib/supabase/client';
import { showToast } from '../../lib/toast';
import {
  CLIENT_STATUSES,
  CONTACT_CHANNELS,
  DEFAULT_BACKLOG_WITH_WEBSITE,
  DEFAULT_BACKLOG_WITHOUT_WEBSITE,
  type ClientStatus,
  type ContactChannel,
} from '../../lib/types';

interface Props {
  userId: string;
  defaultHasWebsite: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const inputClass =
  'w-full rounded-md border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#006aff]';
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]';

export default function NewClientModal({ userId, defaultHasWebsite, onClose, onCreated }: Props) {
  const [clientName, setClientName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactChannel, setContactChannel] = useState<ContactChannel>('WhatsApp');
  const [contactDetail, setContactDetail] = useState('');
  const [hasWebsite, setHasWebsite] = useState(defaultHasWebsite);
  const [status, setStatus] = useState<ClientStatus>('Prospecto');
  const [date, setDate] = useState(todayISO());
  const [niche, setNiche] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [isHighPotential, setIsHighPotential] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!clientName.trim()) return;
    setSaving(true);

    const { error } = await supabase.from('clients').insert({
      user_id: userId,
      client_name: clientName.trim(),
      contact_name: contactName.trim() || null,
      contact_channel: contactChannel,
      contact_detail: contactDetail.trim() || null,
      has_website: hasWebsite,
      status,
      date,
      niche: niche.trim() || null,
      website_url: websiteUrl.trim() || null,
      social_media: socialMedia.trim() || null,
      is_high_potential: isHighPotential,
      backlog: hasWebsite ? DEFAULT_BACKLOG_WITH_WEBSITE : DEFAULT_BACKLOG_WITHOUT_WEBSITE,
    });

    setSaving(false);

    if (error) {
      console.error('Error al crear cliente:', error);
      showToast(`No se pudo crear el cliente: ${error.message}`, 'error');
      return;
    }

    showToast('Cliente creado correctamente.', 'success');
    onCreated();
    onClose();
  }

  return (
    <Modal
      title="Nuevo cliente"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="new-client-form"
            disabled={saving || !clientName.trim()}
            className="rounded-md bg-[#006aff] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="new-client-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Nombre del cliente *</label>
          <input
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className={inputClass}
            placeholder="Ej. Clínica Dental Sonrisas"
          />
        </div>

        <div>
          <label className={labelClass}>Nombre del contacto</label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className={inputClass}
            placeholder="Ej. María Pérez"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Canal de contacto</label>
            <select
              value={contactChannel}
              onChange={(e) => setContactChannel(e.target.value as ContactChannel)}
              className={inputClass}
            >
              {CONTACT_CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Medio de contacto</label>
            <input
              value={contactDetail}
              onChange={(e) => setContactDetail(e.target.value)}
              placeholder="Número o correo"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">¿Tiene sitio web?</p>
            <p className="text-xs text-[var(--text-secondary)]">Define la vista y el backlog inicial</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={hasWebsite}
            onClick={() => setHasWebsite((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              hasWebsite ? 'bg-[#006aff]' : 'bg-gray-500/30'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                hasWebsite ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className={inputClass}
            >
              {CLIENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Nicho</label>
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Ej. Odontología, restaurantes…"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Página web</label>
          <input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="Ej. https://cliente.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Redes sociales</label>
          <input
            value={socialMedia}
            onChange={(e) => setSocialMedia(e.target.value)}
            placeholder="Ej. @cliente en Instagram"
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isHighPotential}
            onChange={(e) => setIsHighPotential(e.target.checked)}
            className="h-4 w-4 accent-[#006aff]"
          />
          Cliente potencial
        </label>
      </form>
    </Modal>
  );
}
