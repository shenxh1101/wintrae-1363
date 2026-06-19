import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store';
import { LightLevelLabel, TaskTypeLabel } from '@/types';
import TaskCard from '@/components/TaskCard';
import RecordCard from '@/components/RecordCard';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

const PlantDetailPage: React.FC = () => {
  const router = useRouter();
  const plantId = router.params.id as string;
  
  const getPlantById = useAppStore((state) => state.getPlantById);
  const getTasksByPlant = useAppStore((state) => state.getTasksByPlant);
  const getRecordsByPlant = useAppStore((state) => state.getRecordsByPlant);
  const completeTask = useAppStore((state) => state.completeTask);
  const isTaskDue = useAppStore((state) => state.isTaskDue);
  const isTaskOverdue = useAppStore((state) => state.isTaskOverdue);
  
  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'records'>('info');
  const plant = getPlantById(plantId);
  const tasks = getTasksByPlant(plantId);
  const records = getRecordsByPlant(plantId);

  useEffect(() => {
    if (!plant) {
      Taro.showToast({ title: '植物不存在', icon: 'error' });
      setTimeout(() => Taro.navigateBack(), 1500);
    }
  }, [plant]);

  if (!plant) return null;

  const statusConfig = {
    good: { label: '健康', color: '#10B981', bg: '#ECFDF5' },
    warning: { label: '需关注', color: '#F59E0B', bg: '#FFFBEB' },
    danger: { label: '需处理', color: '#EF4444', bg: '#FEF2F2' }
  };
  const status = statusConfig[plant.healthStatus];

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    Taro.showToast({ title: '任务完成', icon: 'success' });
  };

  const handleEdit = () => {
    Taro.showToast({ title: '编辑功能开发中', icon: 'none' });
  };

  const handleAddTask = () => {
    Taro.navigateTo({ url: `/pages/add-task/index?plantId=${plantId}` });
  };

  const handleAddRecord = () => {
    Taro.navigateTo({ url: `/pages/add-record/index?plantId=${plantId}` });
  };

  const pendingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      const aOverdue = isTaskOverdue(a) ? 2 : isTaskDue(a) ? 1 : 0;
      const bOverdue = isTaskOverdue(b) ? 2 : isTaskDue(b) ? 1 : 0;
      if (bOverdue !== aOverdue) return bOverdue - aOverdue;
      return `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);
    });

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Image className={styles.avatar} src={plant.avatar} mode="aspectFill" />
        <View className={styles.headerInfo}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{plant.name}</Text>
            <View className={styles.statusBadge} style={{ backgroundColor: status.bg }}>
              <Text className={styles.statusText} style={{ color: status.color }}>
                {status.label}
              </Text>
            </View>
          </View>
          <Text className={styles.species}>{plant.species}</Text>
          {plant.notes && <Text className={styles.notes}>{plant.notes}</Text>}
        </View>
      </View>

      <View className={styles.actionRow}>
        <Button className={styles.actionBtn} onClick={handleAddTask}>
          <Text className={styles.actionIcon}>📋</Text>
          <Text className={styles.actionText}>添加任务</Text>
        </Button>
        <Button className={styles.actionBtn} onClick={handleAddRecord}>
          <Text className={styles.actionIcon}>📷</Text>
          <Text className={styles.actionText}>添加记录</Text>
        </Button>
        <Button className={styles.actionBtn} onClick={handleEdit}>
          <Text className={styles.actionIcon}>✏️</Text>
          <Text className={styles.actionText}>编辑</Text>
        </Button>
      </View>

      <View className={styles.tabs}>
        <Text
          className={`${styles.tabItem} ${activeTab === 'info' ? styles.active : ''}`}
          onClick={() => setActiveTab('info')}
        >
          基本信息
        </Text>
        <Text
          className={`${styles.tabItem} ${activeTab === 'tasks' ? styles.active : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          养护任务 ({pendingTasks.length})
        </Text>
        <Text
          className={`${styles.tabItem} ${activeTab === 'records' ? styles.active : ''}`}
          onClick={() => setActiveTab('records')}
        >
          生长记录 ({records.length})
        </Text>
      </View>

      <View className={styles.content}>
        {activeTab === 'info' && (
          <View className={styles.infoSection}>
            <View className={styles.infoCard}>
              <View className={styles.infoRow}>
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>📍 位置</Text>
                  <Text className={styles.infoValue}>{plant.location}</Text>
                </View>
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>☀️ 光照</Text>
                  <Text className={styles.infoValue}>{LightLevelLabel[plant.lightLevel]}</Text>
                </View>
              </View>
              <View className={styles.infoRow}>
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>🪴 换盆日期</Text>
                  <Text className={styles.infoValue}>{plant.repotDate}</Text>
                </View>
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>📅 加入时间</Text>
                  <Text className={styles.infoValue}>{plant.createdAt}</Text>
                </View>
              </View>
            </View>

            <View className={styles.statsRow}>
              <View className={styles.statCard}>
                <Text className={styles.statValue}>{tasks.length}</Text>
                <Text className={styles.statLabel}>总任务</Text>
              </View>
              <View className={styles.statCard}>
                <Text className={styles.statValue}>{tasks.filter(t => t.completed).length}</Text>
                <Text className={styles.statLabel}>已完成</Text>
              </View>
              <View className={styles.statCard}>
                <Text className={styles.statValue}>{records.length}</Text>
                <Text className={styles.statLabel}>记录</Text>
              </View>
            </View>

            {tasks.length > 0 && (
              <View className={styles.taskTypeStats}>
                <Text className={styles.sectionTitle}>任务类型分布</Text>
                <View className={styles.typeStats}>
                  {Object.entries(
                    tasks.reduce((acc, t) => {
                      acc[t.type] = (acc[t.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <View key={type} className={styles.typeStat}>
                      <Text className={styles.typeName}>{TaskTypeLabel[type as keyof typeof TaskTypeLabel]}</Text>
                      <Text className={styles.typeCount}>{count}次</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'tasks' && (
          <View className={styles.tasksSection}>
            {pendingTasks.length === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>✅</Text>
                <Text className={styles.emptyText}>太棒了！没有待完成的任务</Text>
                <Button className={styles.emptyBtn} onClick={handleAddTask}>
                  添加新任务
                </Button>
              </View>
            ) : (
              pendingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => handleCompleteTask(task.id)}
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'records' && (
          <View className={styles.recordsSection}>
            {records.length === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📷</Text>
                <Text className={styles.emptyText}>还没有记录，拍张照片记录一下吧</Text>
                <Button className={styles.emptyBtn} onClick={handleAddRecord}>
                  添加记录
                </Button>
              </View>
            ) : (
              records
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(record => (
                  <RecordCard key={record.id} record={record} />
                ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PlantDetailPage;
