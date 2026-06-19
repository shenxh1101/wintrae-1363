export type TaskType = 'water' | 'fertilize' | 'prune' | 'pest';

export type RecordType = 'growth' | 'pest' | 'leaf';

export type LightLevel = 'full' | 'partial' | 'shade';

export interface Plant {
  id: string;
  name: string;
  species: string;
  location: string;
  lightLevel: LightLevel;
  repotDate: string;
  avatar: string;
  notes?: string;
  createdAt: string;
  healthStatus: 'good' | 'warning' | 'danger';
}

export interface Task {
  id: string;
  plantId: string;
  plantName: string;
  type: TaskType;
  date: string;
  time: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface Record {
  id: string;
  plantId: string;
  plantName: string;
  type: RecordType;
  date: string;
  image: string;
  notes?: string;
  treatment?: string;
}

export interface PlantLibraryItem {
  id: string;
  name: string;
  species: string;
  image: string;
  waterFrequency: string;
  lightNeed: string;
  temperature: string;
  tips: string[];
}

export interface WeeklyStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasksByType: Record<TaskType, number>;
}

export const TaskTypeLabel: Record<TaskType, string> = {
  water: '浇水',
  fertilize: '施肥',
  prune: '修剪',
  pest: '驱虫'
};

export const TaskTypeColor: Record<TaskType, string> = {
  water: '#3B82F6',
  fertilize: '#A855F7',
  prune: '#EC4899',
  pest: '#F97316'
};

export const RecordTypeLabel: Record<RecordType, string> = {
  growth: '生长记录',
  pest: '病虫害',
  leaf: '叶片异常'
};

export const LightLevelLabel: Record<LightLevel, string> = {
  full: '全日照',
  partial: '半日照',
  shade: '耐阴'
};
