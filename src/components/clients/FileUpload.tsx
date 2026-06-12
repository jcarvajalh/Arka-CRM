import { useEffect, useRef, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { showToast } from '../../lib/toast';
import type { Client } from '../../lib/types';

interface Props {
  client: Client;
  field: 'audit_doc_url' | 'proposal_doc_url';
  label: string;
  userId: string;
  onUploaded: (path: string) => void;
}

export default function FileUpload({ client, field, label, userId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const path = client[field];

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    const tipo = field === 'audit_doc_url' ? 'auditoria' : 'propuesta';
    const filePath = `${userId}/${client.id}/${tipo}-${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage.from('client-docs').upload(filePath, file, {
      upsert: true,
      contentType: 'application/pdf',
    });

    if (uploadError) {
      setUploading(false);
      showToast(`No se pudo subir el archivo: ${uploadError.message}`, 'error');
      return;
    }

    const { error: updateError } = await supabase
      .from('clients')
      .update({ [field]: filePath })
      .eq('id', client.id);

    setUploading(false);

    if (updateError) {
      showToast('Archivo subido, pero no se pudo guardar la referencia.', 'error');
      return;
    }

    onUploaded(filePath);
    showToast(`${label} subida correctamente.`, 'success');
  }

  async function handleView() {
    setMenuOpen(false);
    if (!path) return;
    const { data, error } = await supabase.storage.from('client-docs').createSignedUrl(path, 60);
    if (error || !data) {
      showToast('No se pudo abrir el archivo.', 'error');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  function handleReplace() {
    setMenuOpen(false);
    inputRef.current?.click();
  }

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        title={path ? `${label}: ver / reemplazar` : `Subir ${label.toLowerCase()}`}
        disabled={uploading}
        onClick={() => (path ? setMenuOpen((v) => !v) : inputRef.current?.click())}
        className={`rounded-md p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
          path ? 'text-[#006aff]' : 'opacity-40'
        } ${uploading ? 'animate-pulse' : ''}`}
      >
        <Paperclip size={15} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1 text-xs shadow-lg">
          <button
            type="button"
            onClick={handleView}
            className="block w-full px-3 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/5"
          >
            Ver
          </button>
          <button
            type="button"
            onClick={handleReplace}
            className="block w-full px-3 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/5"
          >
            Reemplazar
          </button>
        </div>
      )}
    </div>
  );
}
