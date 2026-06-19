import { Record } from '@/types';

const today = new Date();
const formatDate = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const mockRecords: Record[] = [
  {
    id: 'r1',
    plantId: '1',
    plantName: '小绿萝',
    type: 'growth',
    date: formatDate(today),
    image: 'https://picsum.photos/id/110/600/600',
    notes: '今天又长出了新叶子，长势喜人！'
  },
  {
    id: 'r2',
    plantId: '5',
    plantName: '月季花',
    type: 'leaf',
    date: formatDate(new Date(today.getTime() - 86400000)),
    image: 'https://picsum.photos/id/114/600/600',
    notes: '叶片有黄斑，边缘卷曲',
    treatment: '喷洒多菌灵，移到通风处'
  },
  {
    id: 'r3',
    plantId: '2',
    plantName: '多肉小可爱',
    type: 'growth',
    date: formatDate(new Date(today.getTime() - 86400000 * 2)),
    image: 'https://picsum.photos/id/111/600/600',
    notes: '开始出状态了，颜色变粉'
  },
  {
    id: 'r4',
    plantId: '5',
    plantName: '月季花',
    type: 'pest',
    date: formatDate(new Date(today.getTime() - 86400000 * 3)),
    image: 'https://picsum.photos/id/114/600/600',
    notes: '发现蚜虫，叶子背面有很多',
    treatment: '用肥皂水喷洒，连续3天'
  },
  {
    id: 'r5',
    plantId: '4',
    plantName: '薄荷',
    type: 'growth',
    date: formatDate(new Date(today.getTime() - 86400000 * 3)),
    image: 'https://picsum.photos/id/113/600/600',
    notes: '越来越茂盛了，剪了一些泡茶'
  },
  {
    id: 'r6',
    plantId: '3',
    plantName: '发财树',
    type: 'leaf',
    date: formatDate(new Date(today.getTime() - 86400000 * 5)),
    image: 'https://picsum.photos/id/112/600/600',
    notes: '部分叶片发黄',
    treatment: '减少浇水，检查根部'
  },
  {
    id: 'r7',
    plantId: '6',
    plantName: '吊兰',
    type: 'growth',
    date: formatDate(new Date(today.getTime() - 86400000 * 7)),
    image: 'https://picsum.photos/id/115/600/600',
    notes: '长出了很多小吊兰'
  },
  {
    id: 'r8',
    plantId: '1',
    plantName: '小绿萝',
    type: 'growth',
    date: formatDate(new Date(today.getTime() - 86400000 * 10)),
    image: 'https://picsum.photos/id/110/600/600',
    notes: '换盆后恢复得很好'
  }
];
