import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { supabase } from '../../lib/supabase/client';
import { showToast } from '../../lib/toast';
import type { BacklogItem, Client } from '../../lib/types';

interface Props {
  client: Client;
  onClose: () => void;
  onSaved: (backlog: BacklogItem[]) => void;
}

export default function BacklogModal({ client, onClose, onSaved }: Props) {
  const [items, setItems] = useState<BacklogItem[]>(() => client.backlog ?? []);
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleItem(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  }

  function updateLabel(id: string, label: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, label } : item)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function addItem() {
    const label = newLabel.trim();
    if (!label) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), label, checked: false }]);
    setNewLabel('');
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase.from('clients').update({ backlog: items }).eq('id', client.id);
    setSaving(false);
    if (error) {
      showToast('No se pudo guardar el backlog.', 'error');
      return;
    }
    onSaved(items);
    showToast('Backlog actualizado.', 'success');
    onClose();
  }

  const completed = items.filter((i) => i.checked).length;

  return (
    <Modal
      title={client.client_name}
      onClose={onClose}
      variant="drawer"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-[#006aff] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
        Backlog · {completed}/{items.length} completadas
      </p>

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-2 rounded-md border border-[var(--border-subtle)] px-3 py-2"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(item.id)}
              className="mt-1 h-4 w-4 shrink-0 accent-[#006aff]"
            />
            <textarea
              value={item.label}
              onChange={(e) => updateLabel(item.id, e.target.value)}
              rows={1}
              className={`flex-1 resize-none bg-transparent text-sm outline-none ${
                item.checked ? 'line-through opacity-50' : ''
              }`}
            />
            <button
              onClick={() => removeItem(item.id)}
              className="shrink-0 opacity-40 transition-opacity hover:opacity-100"
              aria-label="Eliminar tarea"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-md border border-dashed border-[var(--border-subtle)] px-3 py-6 text-center text-sm text-[var(--text-secondary)]">
            Sin tareas en el backlog todavía.
          </li>
        )}
      </ul>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder="Agregar tarea…"
          className="flex-1 rounded-md border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#006aff]"
        />
        <button
          onClick={addItem}
          className="rounded-md border border-[var(--border-subtle)] p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Agregar tarea"
        >
          <Plus size={16} />
        </button>
      </div>
    </Modal>
  );
}
