import { create } from 'zustand';
import { Plant, Task, Record, TaskType, WeeklyStats } from '@/types';
import { mockPlants, mockPlantLibrary } from '@/data/plants';
import { mockTasks } from '@/data/tasks';
import { mockRecords } from '@/data/records';
import { formatDate, getWeekDays } from '@/utils/date';

interface AppState {
  plants: Plant[];
  tasks: Task[];
  records: Record[];
  plantLibrary: typeof mockPlantLibrary;
  selectedPlantId: string | null;
  currentDate: Date;
  setPlants: (plants: Plant[]) => void;
  addPlant: (plant: Omit<Plant, 'id' | 'createdAt' | 'healthStatus'>) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  completeTask: (taskId: string) => void;
  setRecords: (records: Record[]) => void;
  addRecord: (record: Omit<Record, 'id'>) => void;
  setSelectedPlantId: (id: string | null) => void;
  setCurrentDate: (date: Date) => void;
  getTodayTasks: () => Task[];
  getPendingTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getWeeklyStats: () => WeeklyStats;
  getPlantById: (id: string) => Plant | undefined;
  getTasksByPlant: (plantId: string) => Task[];
  getRecordsByPlant: (plantId: string) => Record[];
  getTasksByDate: (date: string) => Task[];
}

export const useAppStore = create<AppState>((set, get) => ({
  plants: mockPlants,
  tasks: mockTasks,
  records: mockRecords,
  plantLibrary: mockPlantLibrary,
  selectedPlantId: null,
  currentDate: new Date(),

  setPlants: (plants) => set({ plants }),
  addPlant: (plant) => {
    const newPlant: Plant = {
      ...plant,
      id: `p_${Date.now()}`,
      createdAt: formatDate(new Date()),
      healthStatus: 'good'
    };
    set((state) => ({ plants: [...state.plants, newPlant] }));
  },

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: `t_${Date.now()}`,
      completed: false
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },
  completeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: true, completedAt: formatDate(new Date(), 'YYYY-MM-DD HH:mm') }
          : t
      )
    }));
    console.log('[Task] Task completed:', taskId);
  },

  setRecords: (records) => set({ records }),
  addRecord: (record) => {
    const newRecord: Record = {
      ...record,
      id: `r_${Date.now()}`
    };
    set((state) => ({ records: [...state.records, newRecord] }));
  },

  setSelectedPlantId: (id) => set({ selectedPlantId: id }),
  setCurrentDate: (date) => set({ currentDate: date }),

  getTodayTasks: () => {
    const today = formatDate(new Date());
    return get().tasks.filter((t) => t.date === today);
  },

  getPendingTasks: () => {
    return get().tasks.filter((t) => !t.completed);
  },

  getCompletedTasks: () => {
    return get().tasks.filter((t) => t.completed);
  },

  getWeeklyStats: () => {
    const weekDays = getWeekDays();
    const weekStart = formatDate(weekDays[0]);
    const weekEnd = formatDate(weekDays[6]);
    const weekTasks = get().tasks.filter((t) => t.date >= weekStart && t.date <= weekEnd);
    
    const totalTasks = weekTasks.length;
    const completedTasks = weekTasks.filter((t) => t.completed).length;
    
    const tasksByType: Record<TaskType, number> = {
      water: 0,
      fertilize: 0,
      prune: 0,
      pest: 0
    };
    
    weekTasks.forEach((t) => {
      tasksByType[t.type]++;
    });

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      tasksByType
    };
  },

  getPlantById: (id) => {
    return get().plants.find((p) => p.id === id);
  },

  getTasksByPlant: (plantId) => {
    return get().tasks.filter((t) => t.plantId === plantId);
  },

  getRecordsByPlant: (plantId) => {
    return get().records.filter((r) => r.plantId === plantId);
  },

  getTasksByDate: (date) => {
    return get().tasks.filter((t) => t.date === date);
  }
}));
