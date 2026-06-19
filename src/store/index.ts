import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Plant, Task, Record, TaskType, WeeklyStats } from '@/types';
import { mockPlants, mockPlantLibrary } from '@/data/plants';
import { mockTasks } from '@/data/tasks';
import { mockRecords } from '@/data/records';
import { formatDate, getWeekDays, isToday } from '@/utils/date';

const STORAGE_KEY = 'gardening_app_data_v1';

interface AppState {
  plants: Plant[];
  tasks: Task[];
  records: Record[];
  plantLibrary: typeof mockPlantLibrary;
  selectedPlantId: string | null;
  currentDate: Date;
  isInitialized: boolean;
  hydrateFromStorage: () => void;
  persistToStorage: () => void;
  setPlants: (plants: Plant[]) => void;
  addPlant: (plant: Omit<Plant, 'id' | 'createdAt' | 'healthStatus'>) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  setRecords: (records: Record[]) => void;
  addRecord: (record: Omit<Record, 'id'>) => void;
  setSelectedPlantId: (id: string | null) => void;
  setCurrentDate: (date: Date) => void;
  getTodayTasks: () => Task[];
  getPendingTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getDueTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getWeeklyStats: () => WeeklyStats;
  getPlantById: (id: string) => Plant | undefined;
  getTasksByPlant: (plantId: string) => Task[];
  getRecordsByPlant: (plantId: string) => Record[];
  getTasksByDate: (date: string) => Task[];
  isTaskDue: (task: Task) => boolean;
  isTaskOverdue: (task: Task) => boolean;
  generateCareList: (plantId?: string) => string;
  resetAllData: () => void;
}

const saveToStorage = (plants: Plant[], tasks: Task[], records: Record[]) => {
  try {
    Taro.setStorageSync(
      STORAGE_KEY,
      JSON.stringify({
        plants,
        tasks,
        records,
        savedAt: new Date().toISOString()
      })
    );
    console.log('[Storage] Data persisted successfully');
  } catch (e) {
    console.error('[Storage] Failed to persist:', e);
  }
};

const loadFromStorage = (): { plants?: Plant[]; tasks?: Task[]; records?: Record[] } | null => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    console.log('[Storage] Data loaded from storage, saved at:', data.savedAt);
    return data;
  } catch (e) {
    console.error('[Storage] Failed to load:', e);
    return null;
  }
};

const checkTaskDue = (task: Task): boolean => {
  if (task.completed) return false;
  const taskDate = `${task.date}T${task.time}:00`;
  const taskTime = new Date(taskDate).getTime();
  return new Date().getTime() >= taskTime;
};

const checkTaskOverdue = (task: Task): boolean => {
  if (task.completed) return false;
  const taskDate = new Date(`${task.date}T${task.time}:00`);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  return taskDate.getTime() < todayEnd.getTime() && !isToday(taskDate);
};

export const useAppStore = create<AppState>((set, get) => ({
  plants: mockPlants,
  tasks: mockTasks,
  records: mockRecords,
  plantLibrary: mockPlantLibrary,
  selectedPlantId: null,
  currentDate: new Date(),
  isInitialized: false,

  hydrateFromStorage: () => {
    if (get().isInitialized) return;
    const saved = loadFromStorage();
    if (saved) {
      set({
        plants: saved.plants || mockPlants,
        tasks: saved.tasks || mockTasks,
        records: saved.records || mockRecords,
        isInitialized: true
      });
      console.log('[Store] Hydrated from storage');
    } else {
      set({ isInitialized: true });
      get().persistToStorage();
      console.log('[Store] No saved data, using defaults');
    }
  },

  persistToStorage: () => {
    const { plants, tasks, records } = get();
    saveToStorage(plants, tasks, records);
  },

  setPlants: (plants) => {
    set({ plants });
    get().persistToStorage();
  },
  addPlant: (plant) => {
    const newPlant: Plant = {
      ...plant,
      id: `p_${Date.now()}`,
      createdAt: formatDate(new Date()),
      healthStatus: 'good'
    };
    set((state) => ({ plants: [...state.plants, newPlant] }));
    get().persistToStorage();
    console.log('[Store] Plant added:', newPlant.name);
  },

  setTasks: (tasks) => {
    set({ tasks });
    get().persistToStorage();
  },
  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: `t_${Date.now()}`,
      completed: false
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    get().persistToStorage();
    console.log('[Store] Task added:', newTask.plantName, newTask.type, newTask.date, newTask.time);
  },
  completeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: true, completedAt: formatDate(new Date(), 'YYYY-MM-DD HH:mm') }
          : t
      )
    }));
    get().persistToStorage();
    console.log('[Store] Task completed:', taskId);
  },
  uncompleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: false, completedAt: undefined }
          : t
      )
    }));
    get().persistToStorage();
  },
  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId)
    }));
    get().persistToStorage();
  },

  setRecords: (records) => {
    set({ records });
    get().persistToStorage();
  },
  addRecord: (record) => {
    const newRecord: Record = {
      ...record,
      id: `r_${Date.now()}`
    };
    set((state) => ({ records: [...state.records, newRecord] }));
    get().persistToStorage();
    console.log('[Store] Record added:', newRecord.plantName, newRecord.type);
  },

  setSelectedPlantId: (id) => set({ selectedPlantId: id }),
  setCurrentDate: (date) => set({ currentDate: date }),

  getTodayTasks: () => {
    const today = formatDate(new Date());
    return get().tasks
      .filter((t) => t.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  },

  getPendingTasks: () => {
    return get().tasks
      .filter((t) => !t.completed)
      .sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);
        if (dateCmp !== 0) return dateCmp;
        return a.time.localeCompare(b.time);
      });
  },

  getCompletedTasks: () => {
    return get().tasks
      .filter((t) => t.completed)
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  },

  getDueTasks: () => {
    return get().tasks
      .filter((t) => checkTaskDue(t))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  },

  getOverdueTasks: () => {
    return get().tasks
      .filter((t) => checkTaskOverdue(t))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
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
    return get().tasks
      .filter((t) => t.plantId === plantId)
      .sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);
        if (dateCmp !== 0) return dateCmp;
        return a.time.localeCompare(b.time);
      });
  },

  getRecordsByPlant: (plantId) => {
    return get().records
      .filter((r) => r.plantId === plantId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getTasksByDate: (date) => {
    return get().tasks
      .filter((t) => t.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  },

  isTaskDue: (task) => checkTaskDue(task),
  isTaskOverdue: (task) => checkTaskOverdue(task),

  generateCareList: (plantId?: string) => {
    const { plants, getTasksByPlant, getRecordsByPlant, isTaskDue, isTaskOverdue } = get();
    const plantList = plantId ? plants.filter(p => p.id === plantId) : plants;
    const lines: string[] = [];

    const now = formatDate(new Date(), 'YYYY-MM-DD HH:mm');
    lines.push('🌿 家庭园艺养护清单');
    lines.push(`生成时间：${now}`);
    if (plantId) {
      const plant = get().getPlantById(plantId);
      if (plant) {
        lines.push(`植物：${plant.name}（${plant.species}）`);
      }
    }
    lines.push('═'.repeat(25));

    let totalPending = 0;
    let totalCompleted = 0;
    let totalRecords = 0;

    plantList.forEach((plant, idx) => {
      if (idx > 0) lines.push('');
      lines.push(`\n【${plant.name}】${plant.species}`);
      lines.push(`  📍 位置：${plant.location}`);
      lines.push(`  ☀️ 光照：${plant.lightLevel === 'full' ? '全日照' : plant.lightLevel === 'partial' ? '半日照' : '耐阴'}`);
      lines.push(`  🪴 换盆：${plant.repotDate}`);
      if (plant.notes) {
        lines.push(`  📝 备注：${plant.notes}`);
      }

      const plantTasks = getTasksByPlant(plant.id);
      const pending = plantTasks.filter(t => !t.completed);
      const completed = plantTasks.filter(t => t.completed);
      const records = getRecordsByPlant(plant.id);

      totalPending += pending.length;
      totalCompleted += completed.length;
      totalRecords += records.length;

      if (pending.length > 0) {
        lines.push(`  📋 待办任务（${pending.length}项）：`);
        pending.forEach(t => {
          const typeMap: Record<TaskType, string> = { water: '浇水', fertilize: '施肥', prune: '修剪', pest: '驱虫' };
          const dueMark = isTaskOverdue(t) ? '❗️逾期' : isTaskDue(t) ? '⏰到期' : '  ';
          const typeIcon = t.type === 'water' ? '💧' : t.type === 'fertilize' ? '🌱' : t.type === 'prune' ? '✂️' : '🐛';
          lines.push(`    ${dueMark}${typeIcon} ${t.date} ${t.time} ${typeMap[t.type]}${t.notes ? ' - ' + t.notes : ''}`);
        });
      }

      if (completed.length > 0) {
        lines.push(`  ✅ 已完成任务（${completed.length}项）：`);
        completed.slice(0, 5).forEach(t => {
          const typeMap: Record<TaskType, string> = { water: '浇水', fertilize: '施肥', prune: '修剪', pest: '驱虫' };
          const typeIcon = t.type === 'water' ? '💧' : t.type === 'fertilize' ? '🌱' : t.type === 'prune' ? '✂️' : '🐛';
          lines.push(`    ${typeIcon} ${t.completedAt || t.date} ${typeMap[t.type]}✅`);
        });
        if (completed.length > 5) {
          lines.push(`    ...共${completed.length}项已完成`);
        }
      }

      if (records.length > 0) {
        lines.push(`  📷 生长记录（${records.length}条）：`);
        records.slice(0, 3).forEach(r => {
          const typeMap: Record<string, string> = { growth: '🌱生长', pest: '🐛病虫害', leaf: '🍂叶片' };
          lines.push(`    ${typeMap[r.type] || r.type} ${r.date}${r.notes ? ' - ' + r.notes : ''}`);
        });
        if (records.length > 3) {
          lines.push(`    ...共${records.length}条记录`);
        }
      }
    });

    lines.push('\n' + '═'.repeat(25));
    lines.push(`📊 汇总：`);
    lines.push(`  植物数量：${plantList.length} 盆`);
    lines.push(`  待办任务：${totalPending} 项`);
    lines.push(`  已完成：${totalCompleted} 项`);
    lines.push(`  生长记录：${totalRecords} 条`);

    return lines.join('\n');
  },

  resetAllData: () => {
    try {
      Taro.removeStorageSync(STORAGE_KEY);
      console.log('[Store] Storage cleared');
    } catch (e) {
      console.error('[Store] Failed to clear storage:', e);
    }
    set({
      plants: mockPlants,
      tasks: mockTasks,
      records: mockRecords,
      selectedPlantId: null,
      isInitialized: true
    });
    get().persistToStorage();
  }
}));
