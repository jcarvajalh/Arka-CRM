import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, ChevronRight, GripVertical, Trash2 } from 'lucide-react';
import type { ProjectTask } from '../../lib/types';

interface Props {
  task: ProjectTask;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMove: (task: ProjectTask, direction: -1 | 1) => void;
  onDelete: (task: ProjectTask) => void;
}

export default function KanbanCard({ task, canMoveLeft, canMoveRight, onMove, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-3 text-sm"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab touch-none opacity-30 transition-opacity hover:opacity-70 active:cursor-grabbing"
          aria-label="Arrastrar tarea"
        >
          <GripVertical size={14} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">{task.title}</p>
          {task.description && (
            <p className="mt-1 text-xs leading-snug text-[var(--text-secondary)]">{task.description}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(task)}
          className="shrink-0 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-60 hover:opacity-100"
          aria-label="Eliminar tarea"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 border-t border-[var(--border-subtle)] pt-2">
        <button
          disabled={!canMoveLeft}
          onClick={() => onMove(task, -1)}
          className="rounded p-1 transition-colors hover:bg-black/5 disabled:opacity-20 dark:hover:bg-white/5"
          aria-label="Mover a columna anterior"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          disabled={!canMoveRight}
          onClick={() => onMove(task, 1)}
          className="rounded p-1 transition-colors hover:bg-black/5 disabled:opacity-20 dark:hover:bg-white/5"
          aria-label="Mover a columna siguiente"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
