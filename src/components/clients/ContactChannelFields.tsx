import { CONTACT_CHANNELS, type ContactChannel } from '../../lib/types';

export interface ChannelValue {
  channel: ContactChannel | '';
  detail: string;
  message: string;
}

interface Props {
  title: string;
  value: ChannelValue;
  onChange: (value: ChannelValue) => void;
  optional?: boolean;
}

const inputClass =
  'w-full rounded-md border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#006aff]';
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]';

export default function ContactChannelFields({ title, value, onChange, optional }: Props) {
  const set = (patch: Partial<ChannelValue>) => onChange({ ...value, ...patch });
  const disabled = value.channel === '';

  return (
    <fieldset className="flex flex-col gap-3 rounded-md border border-[var(--border-subtle)] p-3">
      <legend className="px-1 text-xs font-semibold text-[var(--text-secondary)]">{title}</legend>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Canal</label>
          <select
            value={value.channel}
            onChange={(e) => set({ channel: e.target.value as ContactChannel | '' })}
            className={inputClass}
          >
            {optional && <option value="">Ninguno</option>}
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
            value={value.detail}
            onChange={(e) => set({ detail: e.target.value })}
            placeholder={value.channel === 'Instagram' ? '@usuario' : 'Número o correo'}
            disabled={disabled}
            className={`${inputClass} disabled:opacity-40`}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Mensaje enviado</label>
        <textarea
          value={value.message}
          onChange={(e) => set({ message: e.target.value })}
          placeholder="Pega aquí el mensaje que enviaste por este canal"
          rows={3}
          disabled={disabled}
          className={`${inputClass} resize-y disabled:opacity-40`}
        />
      </div>
    </fieldset>
  );
}

/** Convierte el estado del formulario en columnas de la tabla `clients`. */
export function channelToColumns(first: ChannelValue, second: ChannelValue) {
  const hasSecond = second.channel !== '';
  return {
    contact_channel: first.channel || null,
    contact_detail: first.detail.trim() || null,
    contact_message: first.message.trim() || null,
    contact_channel_2: hasSecond ? second.channel : null,
    contact_detail_2: hasSecond ? second.detail.trim() || null : null,
    contact_message_2: hasSecond ? second.message.trim() || null : null,
  } as {
    contact_channel: ContactChannel | null;
    contact_detail: string | null;
    contact_message: string | null;
    contact_channel_2: ContactChannel | null;
    contact_detail_2: string | null;
    contact_message_2: string | null;
  };
}
