import { Task } from '@/types';

const today = new Date();
const formatDate = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const mockTasks: Task[] = [
  {
    id: 't1',
    plantId: '1',
    plantName: '小绿萝',
    type: 'water',
    date: formatDate(today),
    time: '09:00',
    completed: false,
    notes: '浇透水'
  },
  {
    id: 't2',
    plantId: '4',
    plantName: '薄荷',
    type: 'water',
    date: formatDate(today),
    time: '08:30',
    completed: true,
    completedAt: formatDate(today) + ' 08:35',
    notes: ''
  },
  {
    id: 't3',
    plantId: '2',
    plantName: '多肉小可爱',
    type: 'water',
    date: formatDate(today),
    time: '18:00',
    completed: false,
    notes: '少量浇水'
  },
  {
    id: 't4',
    plantId: '5',
    plantName: '月季花',
    type: 'fertilize',
    date: formatDate(today),
    time: '10:00',
    completed: false,
    notes: '使用有机肥'
  },
  {
    id: 't5',
    plantId: '5',
    plantName: '月季花',
    type: 'pest',
    date: formatDate(today),
    time: '16:00',
    completed: false,
    notes: '检查蚜虫'
  },
  {
    id: 't6',
    plantId: '3',
    plantName: '发财树',
    type: 'prune',
    date: formatDate(new Date(today.getTime() + 86400000)),
    time: '14:00',
    completed: false,
    notes: '修剪黄叶'
  },
  {
    id: 't7',
    plantId: '6',
    plantName: '吊兰',
    type: 'water',
    date: formatDate(new Date(today.getTime() + 86400000)),
    time: '09:00',
    completed: false,
    notes: ''
  },
  {
    id: 't8',
    plantId: '1',
    plantName: '小绿萝',
    type: 'fertilize',
    date: formatDate(new Date(today.getTime() + 86400000 * 2)),
    time: '10:00',
    completed: false,
    notes: '稀释营养液'
  },
  {
    id: 't9',
    plantId: '4',
    plantName: '薄荷',
    type: 'prune',
    date: formatDate(new Date(today.getTime() + 86400000 * 2)),
    time: '15:00',
    completed: false,
    notes: '促进分枝'
  },
  {
    id: 't10',
    plantId: '2',
    plantName: '多肉小可爱',
    type: 'pest',
    date: formatDate(new Date(today.getTime() + 86400000 * 3)),
    time: '11:00',
    completed: false,
    notes: '检查介壳虫'
  }
];
