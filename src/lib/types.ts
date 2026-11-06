export type ContactChannel = 'WhatsApp' | 'Instagram' | 'Correo';

export type ClientStatus =
  | 'Prospecto'
  | 'Contactado'
  | 'Respondió'
  | 'Reunión'
  | 'Propuesta enviada'
  | 'Negociación'
  | 'Ganado'
  | 'Finalizado'
  | 'Perdido';

export interface BacklogItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Client {
  id: string;
  user_id: string;
  has_website: boolean;
  client_name: string;
  contact_name: string | null;
  contact_channel: ContactChannel | null;
  contact_detail: string | null;
  status: ClientStatus;
  date: string | null;
  niche: string | null;
  website_url: string | null;
  social_media: string | null;
  is_high_potential: boolean;
  backlog: BacklogItem[];
  audit_doc_url: string | null;
  proposal_doc_url: string | null;
  created_at: string;
  updated_at: string;
}

export type KanbanColumnKey =
  | 'sin_empezar'
  | 'en_desarrollo'
  | 'terminadas'
  | 'revisadas'
  | 'aprobadas';

export interface ProjectTask {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: KanbanColumnKey;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const CLIENT_STATUSES: ClientStatus[] = [
  'Prospecto',
  'Contactado',
  'Respondió',
  'Reunión',
  'Propuesta enviada',
  'Negociación',
  'Ganado',
  'Finalizado',
  'Perdido',
];

export const CONTACT_CHANNELS: ContactChannel[] = ['WhatsApp', 'Instagram', 'Correo'];

export const STATUS_STYLES: Record<ClientStatus, string> = {
  Prospecto: 'bg-gray-500/20 text-gray-400',
  Contactado: 'bg-orange-500/20 text-orange-400',
  Respondió: 'bg-orange-400/20 text-orange-300',
  Reunión: 'bg-yellow-500/20 text-yellow-400',
  'Propuesta enviada': 'bg-blue-500/20 text-blue-400',
  Negociación: 'bg-green-500/20 text-green-400',
  Ganado: 'bg-green-600/20 text-green-500',
  Finalizado: 'bg-purple-500/20 text-purple-400',
  Perdido: 'bg-red-500/20 text-red-400',
};

export const KANBAN_COLUMNS: { key: KanbanColumnKey; label: string }[] = [
  { key: 'sin_empezar', label: 'Sin empezar' },
  { key: 'en_desarrollo', label: 'En desarrollo' },
  { key: 'terminadas', label: 'Terminadas' },
  { key: 'revisadas', label: 'Revisadas' },
  { key: 'aprobadas', label: 'Aprobadas' },
];

export const DEFAULT_BACKLOG_WITH_WEBSITE: BacklogItem[] = [
  { id: 'w1', label: 'Analizar velocidad del sitio.', checked: false },
  { id: 'w2', label: 'Analizar diseño y experiencia móvil.', checked: false },
  { id: 'w3', label: 'Analizar SEO básico.', checked: false },
  {
    id: 'w4',
    label: 'Analizar elementos de conversión (WhatsApp, formularios, CTA).',
    checked: false,
  },
  { id: 'w5', label: 'Documentar 3 a 5 problemas importantes.', checked: false },
  { id: 'w6', label: 'Preparar mini auditoría PDF o documento.', checked: false },
  {
    id: 'w7',
    label: 'Enviar mensaje personalizado por WhatsApp + auditoría PDF.',
    checked: false,
  },
  { id: 'w8', label: 'Intentar agendar llamada/Reunión.', checked: false },
  {
    id: 'w9',
    label: 'Grabar video Loom de 2-3 minutos mostrando problemas (Opcional).',
    checked: false,
  },
  { id: 'w10', label: 'Realizar llamada de descubrimiento.', checked: false },
  { id: 'w11', label: 'Presentar propuesta.', checked: false },
  { id: 'w12', label: 'Hacer seguimiento en días 2, 5, 10 y 15.', checked: false },
  { id: 'w13', label: 'Actualizar CRM.', checked: false },
];

export const DEFAULT_BACKLOG_WITHOUT_WEBSITE: BacklogItem[] = [
  { id: 'nw1', label: 'Analizar presencia digital actual.', checked: false },
  {
    id: 'nw2',
    label: 'Identificar oportunidades perdidas (sin SEO, sin reservas, sin credibilidad web).',
    checked: false,
  },
  {
    id: 'nw3',
    label: 'Seleccionar demo adecuada para mostrar (odontología o estética).',
    checked: false,
  },
  {
    id: 'nw4',
    label: 'Enviar mensaje personalizado por WhatsApp + Demo (sitio web).',
    checked: false,
  },
  {
    id: 'nw5',
    label:
      'Presentación PDF Arka + Explicar beneficios: confianza, posicionamiento, captación de pacientes.',
    checked: false,
  },
  { id: 'nw6', label: 'Intentar agendar llamada.', checked: false },
  { id: 'nw7', label: 'Realizar llamada de descubrimiento.', checked: false },
  { id: 'nw8', label: 'Presentar propuesta.', checked: false },
  { id: 'nw9', label: 'Hacer seguimiento en días 2, 5, 10 y 15.', checked: false },
  { id: 'nw10', label: 'Actualizar CRM.', checked: false },
];
