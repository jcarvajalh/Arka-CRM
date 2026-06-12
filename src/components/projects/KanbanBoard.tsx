import { useCallback, useEffect, useMemo, useState, type SubmitEvent } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { showToast } from '../../lib/toast';
import { KANBAN_COLUMNS, type KanbanColumnKey, type ProjectTask } from '../../lib/types';
import KanbanCard from './KanbanCard';

interface Props {
  clientId: string;
  userId: string;
}

function reindex(items: ProjectTask[]): ProjectTask[] {
  return items.map((task, index) => ({ ...task, order_index: index }));
}

export default function KanbanBoard({ clientId, userId }: Props) {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);
  const [addingColumn, setAddingColumn] = useState<KanbanColumnKey | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const tasksByColumn = useMemo(() => {
    const map = new Map<KanbanColumnKey, ProjectTask[]>();
    for (const column of KANBAN_COLUMNS) map.set(column.key, []);
    for (const task of tasks) {
      map.get(task.status)?.push(task);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.order_index - b.order_index);
    }
    return map;
  }, [tasks]);

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('client_id', clientId)
      .order('order_index');

    if (error) {
      showToast('No se pudieron cargar las tareas.', 'error');
      return;
    }
    setTasks((data ?? []) as ProjectTask[]);
  }, [clientId]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      await fetchTasks();
      if (!cancelled) setLoading(false);
    }
    init();

    const channel = supabase
      .channel(`project-tasks-${clientId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_tasks', filter: `client_id=eq.${clientId}` },
        () => fetchTasks()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [clientId, fetchTasks]);

  async function persistOrder(updatedTasks: ProjectTask[], previousTasks: ProjectTask[]) {
    const changed = updatedTasks.filter((task) => {
      const prev = previousTasks.find((p) => p.id === task.id);
      return !prev || prev.status !== task.status || prev.order_index !== task.order_index;
    });

    if (changed.length === 0) return;

    const results = await Promise.all(
      changed.map((task) =>
        supabase
          .from('project_tasks')
          .update({ status: task.status, order_index: task.order_index })
          .eq('id', task.id)
      )
    );

    if (results.some((r) => r.error)) {
      showToast('No se pudo guardar el nuevo orden.', 'error');
      setTasks(previousTasks);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeTaskItem = tasks.find((t) => t.id === activeId);
    if (!activeTaskItem) return;

    const overIsColumn = KANBAN_COLUMNS.some((c) => c.key === overId);
    const overTask = overIsColumn ? null : tasks.find((t) => t.id === overId);
    const targetColumn: KanbanColumnKey = overIsColumn
      ? (overId as KanbanColumnKey)
      : (overTask?.status ?? activeTaskItem.status);

    const sourceColumn = activeTaskItem.status;
    let updatedTasks: ProjectTask[];

    if (sourceColumn === targetColumn) {
      const columnTasks = tasksByColumn.get(sourceColumn) ?? [];
      const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
      const newIndex = overIsColumn ? columnTasks.length - 1 : columnTasks.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = reindex(arrayMove(columnTasks, oldIndex, newIndex));
      const changedById = new Map(reordered.map((t) => [t.id, t]));
      updatedTasks = tasks.map((t) => changedById.get(t.id) ?? t);
    } else {
      const sourceTasks = reindex((tasksByColumn.get(sourceColumn) ?? []).filter((t) => t.id !== activeId));
      const destTasks = tasksByColumn.get(targetColumn) ?? [];
      const insertIndex = overIsColumn ? destTasks.length : destTasks.findIndex((t) => t.id === overId);
      const movedTask: ProjectTask = { ...activeTaskItem, status: targetColumn };
      const newDestTasks = reindex([
        ...destTasks.slice(0, insertIndex < 0 ? destTasks.length : insertIndex),
        movedTask,
        ...destTasks.slice(insertIndex < 0 ? destTasks.length : insertIndex),
      ]);

      const changedById = new Map([...sourceTasks, ...newDestTasks].map((t) => [t.id, t]));
      updatedTasks = tasks.map((t) => changedById.get(t.id) ?? t);
    }

    setTasks(updatedTasks);
    persistOrder(updatedTasks, tasks);
  }

  function handleMove(task: ProjectTask, direction: -1 | 1) {
    const currentIndex = KANBAN_COLUMNS.findIndex((c) => c.key === task.status);
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= KANBAN_COLUMNS.length) return;

    const targetColumn = KANBAN_COLUMNS[targetIndex].key;
    const sourceTasks = reindex((tasksByColumn.get(task.status) ?? []).filter((t) => t.id !== task.id));
    const destTasks = tasksByColumn.get(targetColumn) ?? [];
    const movedTask: ProjectTask = { ...task, status: targetColumn, order_index: destTasks.length };

    const changedById = new Map([...sourceTasks, movedTask].map((t) => [t.id, t]));
    const updatedTasks = tasks.map((t) => changedById.get(t.id) ?? t);

    setTasks(updatedTasks);
    persistOrder(updatedTasks, tasks);
  }

  async function handleAddTask(column: KanbanColumnKey, title: string, description: string) {
    const orderIndex = tasksByColumn.get(column)?.length ?? 0;

    const { data, error } = await supabase
      .from('project_tasks')
      .insert({
        user_id: userId,
        client_id: clientId,
        title,
        description: description || null,
        status: column,
        order_index: orderIndex,
      })
      .select()
      .single();

    if (error || !data) {
      showToast('No se pudo agregar la tarea.', 'error');
      return;
    }

    setTasks((prev) => [...prev, data as ProjectTask]);
    setAddingColumn(null);
  }

  async function handleDeleteTask(task: ProjectTask) {
    if (!window.confirm(`¿Eliminar la tarea "${task.title}"?`)) return;

    const previousTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));

    const { error } = await supabase.from('project_tasks').delete().eq('id', task.id);
    if (error) {
      showToast('No se pudo eliminar la tarea.', 'error');
      setTasks(previousTasks);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[var(--text-secondary)]">
        Cargando…
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="flex gap-3">
          {KANBAN_COLUMNS.map((column, index) => (
            <KanbanColumn
              key={column.key}
              column={column}
              tasks={tasksByColumn.get(column.key) ?? []}
              isAdding={addingColumn === column.key}
              canMoveLeft={index > 0}
              canMoveRight={index < KANBAN_COLUMNS.length - 1}
              onStartAdd={() => setAddingColumn(column.key)}
              onCancelAdd={() => setAddingColumn(null)}
              onAddTask={(title, description) => handleAddTask(column.key, title, description)}
              onMove={handleMove}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 rounded-lg border border-[#006aff]/50 bg-[var(--bg-app)] p-3 text-sm shadow-lg">
              <p className="font-medium leading-snug">{activeTask.title}</p>
              {activeTask.description && (
                <p className="mt-1 text-xs leading-snug text-[var(--text-secondary)]">{activeTask.description}</p>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

interface KanbanColumnProps {
  column: { key: KanbanColumnKey; label: string };
  tasks: ProjectTask[];
  isAdding: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onStartAdd: () => void;
  onCancelAdd: () => void;
  onAddTask: (title: string, description: string) => void;
  onMove: (task: ProjectTask, direction: -1 | 1) => void;
  onDelete: (task: ProjectTask) => void;
}

function KanbanColumn({
  column,
  tasks,
  isAdding,
  canMoveLeft,
  canMoveRight,
  onStartAdd,
  onCancelAdd,
  onAddTask,
  onMove,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-2.5">
        <h3 className="text-sm font-medium">{column.label}</h3>
        <span className="rounded-full bg-[var(--bg-app)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2 p-2 transition-colors ${isOver ? 'bg-[#006aff]/5' : ''}`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              canMoveLeft={canMoveLeft}
              canMoveRight={canMoveRight}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isAdding && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[var(--border-subtle)] py-6 text-xs text-[var(--text-secondary)]">
            Sin tareas
          </div>
        )}

        {isAdding && <AddTaskForm onSubmit={onAddTask} onCancel={onCancelAdd} />}
      </div>

      {!isAdding && (
        <button
          onClick={onStartAdd}
          className="flex items-center gap-1.5 border-t border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
        >
          <Plus size={13} /> Agregar tarea
        </button>
      )}
    </div>
  );
}

interface AddTaskFormProps {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
}

function AddTaskForm({ onSubmit, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSubmit(trimmedTitle, description.trim());
    setTitle('');
    setDescription('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-2.5"
    >
      <input
        autoFocus
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título de la tarea"
        className="w-full rounded-md border border-[var(--border-subtle)] bg-transparent px-2 py-1.5 text-sm outline-none focus:border-[#006aff]"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        rows={2}
        className="w-full resize-none rounded-md border border-[var(--border-subtle)] bg-transparent px-2 py-1.5 text-sm outline-none focus:border-[#006aff]"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-2 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-md bg-[#006aff] px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Agregar
        </button>
      </div>
    </form>
  );
}
