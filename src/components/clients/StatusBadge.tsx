import { CLIENT_STATUSES, STATUS_STYLES, type ClientStatus } from '../../lib/types';

interface Props {
  status: ClientStatus;
  onChange?: (status: ClientStatus) => void;
}

export default function StatusBadge({ status, onChange }: Props) {
  const className = `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`;

  if (!onChange) {
    return <span className={className}>{status}</span>;
  }

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as ClientStatus)}
      className={`${className} cursor-pointer border-0 outline-none`}
    >
      {CLIENT_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-[#161616] text-[#f4f4f4]">
          {s}
        </option>
      ))}
    </select>
  );
}
