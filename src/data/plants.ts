import { Plant, PlantLibraryItem } from '@/types';

export const mockPlants: Plant[] = [
  {
    id: '1',
    name: '小绿萝',
    species: '绿萝',
    location: '客厅阳台',
    lightLevel: 'partial',
    repotDate: '2025-03-15',
    avatar: 'https://picsum.photos/id/110/300/300',
    notes: '喜欢湿润环境，避免阳光直射',
    createdAt: '2025-03-15',
    healthStatus: 'good'
  },
  {
    id: '2',
    name: '多肉小可爱',
    species: '吉娃娃',
    location: '书房窗台',
    lightLevel: 'full',
    repotDate: '2025-02-20',
    avatar: 'https://picsum.photos/id/111/300/300',
    notes: '少浇水，多晒太阳',
    createdAt: '2025-02-20',
    healthStatus: 'good'
  },
  {
    id: '3',
    name: '发财树',
    species: '马拉巴栗',
    location: '玄关',
    lightLevel: 'partial',
    repotDate: '2024-12-01',
    avatar: 'https://picsum.photos/id/112/300/300',
    notes: '耐旱，每月浇一次水',
    createdAt: '2024-12-01',
    healthStatus: 'warning'
  },
  {
    id: '4',
    name: '薄荷',
    species: '留兰香薄荷',
    location: '厨房窗台',
    lightLevel: 'full',
    repotDate: '2025-04-10',
    avatar: 'https://picsum.photos/id/113/300/300',
    notes: '经常浇水，可食用',
    createdAt: '2025-04-10',
    healthStatus: 'good'
  },
  {
    id: '5',
    name: '月季花',
    species: '粉色达芬奇',
    location: '小院围栏',
    lightLevel: 'full',
    repotDate: '2025-03-01',
    avatar: 'https://picsum.photos/id/114/300/300',
    notes: '每周施肥一次，注意防虫',
    createdAt: '2025-03-01',
    healthStatus: 'danger'
  },
  {
    id: '6',
    name: '吊兰',
    species: '金边吊兰',
    location: '卧室飘窗',
    lightLevel: 'partial',
    repotDate: '2025-01-15',
    avatar: 'https://picsum.photos/id/115/300/300',
    notes: '净化空气，好养',
    createdAt: '2025-01-15',
    healthStatus: 'good'
  }
];

export const mockPlantLibrary: PlantLibraryItem[] = [
  {
    id: 'lib1',
    name: '绿萝',
    species: 'Epipremnum aureum',
    image: 'https://picsum.photos/id/110/400/300',
    waterFrequency: '每周2-3次',
    lightNeed: '散射光',
    temperature: '15-30°C',
    tips: [
      '喜欢温暖湿润的环境',
      '避免阳光直射',
      '定期喷水保持叶片翠绿',
      '每月施一次薄肥'
    ]
  },
  {
    id: 'lib2',
    name: '多肉植物',
    species: 'Echeveria',
    image: 'https://picsum.photos/id/111/400/300',
    waterFrequency: '每2周1次',
    lightNeed: '全日照',
    temperature: '10-28°C',
    tips: [
      '宁干勿湿，避免积水',
      '充足阳光才能出状态',
      '夏季高温时注意遮阴',
      '使用透气排水好的土壤'
    ]
  },
  {
    id: 'lib3',
    name: '发财树',
    species: 'Pachira aquatica',
    image: 'https://picsum.photos/id/112/400/300',
    waterFrequency: '每月1次',
    lightNeed: '散射光',
    temperature: '18-30°C',
    tips: [
      '耐旱性强，浇水不宜过多',
      '叶片发黄可能是浇水过多',
      '定期转动保持株型匀称',
      '冬季注意保温'
    ]
  },
  {
    id: 'lib4',
    name: '薄荷',
    species: 'Mentha',
    image: 'https://picsum.photos/id/113/400/300',
    waterFrequency: '每2天1次',
    lightNeed: '全日照',
    temperature: '15-28°C',
    tips: [
      '喜欢湿润，土壤保持微湿',
      '经常修剪促进分枝',
      '可泡茶、烹饪使用',
      '根系发达，定期换盆'
    ]
  },
  {
    id: 'lib5',
    name: '月季',
    species: 'Rosa chinensis',
    image: 'https://picsum.photos/id/114/400/300',
    waterFrequency: '每天1次',
    lightNeed: '全日照6小时以上',
    temperature: '10-28°C',
    tips: [
      '喜肥，每周施一次薄肥',
      '注意防治白粉病和蚜虫',
      '花后及时修剪促开花',
      '保证通风良好'
    ]
  },
  {
    id: 'lib6',
    name: '吊兰',
    species: 'Chlorophytum comosum',
    image: 'https://picsum.photos/id/115/400/300',
    waterFrequency: '每周2次',
    lightNeed: '散射光',
    temperature: '15-28°C',
    tips: [
      '适应性强，非常好养',
      '能有效净化室内空气',
      '叶尖干枯可能是空气太干',
      '定期喷水增湿'
    ]
  }
];
