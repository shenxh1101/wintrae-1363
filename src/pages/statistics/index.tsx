import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Image, RefreshControl } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { TaskTypeLabel, TaskTypeColor, TaskType } from '@/types';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

const StatisticsPage: React.FC = () => {
  const [selectedPlant, setSelectedPlant] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const plants = useAppStore((state) => state.plants);
  const tasks = useAppStore((state) => state.tasks);
  const records = useAppStore((state) => state.records);
  const getWeeklyStats = useAppStore((state) => state.getWeeklyStats);
  const getTasksByPlant = useAppStore((state) => state.getTasksByPlant);
  const getRecordsByPlant = useAppStore((state) => state.getRecordsByPlant);

  const weeklyStats = useMemo(() => getWeeklyStats(), [tasks]);

  const plantHistory = useMemo(() => {
    if (selectedPlant === 'all') {
      return {
        tasks: tasks,
        records: records
      };
    }
    return {
      tasks: getTasksByPlant(selectedPlant),
      records: getRecordsByPlant(selectedPlant)
    };
  }, [selectedPlant, tasks, records, getTasksByPlant, getRecordsByPlant]);

  const plantTaskStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {};
    tasks.forEach(t => {
      if (!stats[t.plantId]) {
        stats[t.plantId] = { total: 0, completed: 0 };
      }
      stats[t.plantId].total++;
      if (t.completed) stats[t.plantId].completed++;
    });
    return stats;
  }, [tasks]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  };

  const handleExport = () => {
    const plant = selectedPlant === 'all' ? null : plants.find(p => p.id === selectedPlant);
    const plantName = plant ? plant.name : '所有植物';
    
    let content = `🌿 ${plantName} 养护清单\n`;
    content += `生成时间：${formatDate(new Date(), 'YYYY-MM-DD HH:mm')}\n\n`;
    
    if (plant) {
      content += `📋 植物信息\n`;
      content += `名称：${plant.name}\n`;
      content += `品种：${plant.species}\n`;
      content += `位置：${plant.location}\n`;
      content += `光照：${plant.lightLevel === 'full' ? '全日照' : plant.lightLevel === 'partial' ? '半日照' : '耐阴'}\n`;
      content += `换盆日期：${plant.repotDate}\n\n`;
    }
    
    const pendingTasks = plantHistory.tasks.filter(t => !t.completed);
    if (pendingTasks.length > 0) {
      content += `⏰ 待完成任务 (${pendingTasks.length})\n`;
      pendingTasks.forEach((t, i) => {
        content += `${i + 1}. [${TaskTypeLabel[t.type]}] ${t.plantName} - ${t.date} ${t.time}`;
        if (t.notes) content += ` (${t.notes})`;
        content += '\n';
      });
      content += '\n';
    }
    
    const completedTasks = plantHistory.tasks.filter(t => t.completed);
    if (completedTasks.length > 0) {
      content += `✅ 已完成任务 (${completedTasks.length})\n`;
      completedTasks.forEach((t, i) => {
        content += `${i + 1}. [${TaskTypeLabel[t.type]}] ${t.plantName} - ${t.completedAt || t.date}\n`;
      });
      content += '\n';
    }
    
    if (plantHistory.records.length > 0) {
      content += `📷 养护记录 (${plantHistory.records.length})\n`;
      plantHistory.records.forEach((r, i) => {
        content += `${i + 1}. ${r.date} - ${r.plantName}`;
        if (r.notes) content += `：${r.notes}`;
        if (r.treatment) content += ` [处理：${r.treatment}]`;
        content += '\n';
      });
    }

    Taro.setClipboardData({
      data: content,
      success: () => {
        Taro.showModal({
          title: '导出成功',
          content: '养护清单已复制到剪贴板，可粘贴分享给家人',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });
    console.log('[Export] Care list exported for:', plantName);
  };

  const recentHistory = useMemo(() => {
    const allItems = [
      ...plantHistory.tasks.map(t => ({
        id: t.id,
        type: 'task' as const,
        taskType: t.type,
        title: `${TaskTypeLabel[t.type]} - ${t.plantName}`,
        date: t.date,
        completed: t.completed
      })),
      ...plantHistory.records.map(r => ({
        id: r.id,
        type: 'record' as const,
        taskType: null,
        title: `📷 ${r.plantName} - ${r.type === 'growth' ? '生长记录' : r.type === 'pest' ? '病虫害' : '叶片异常'}`,
        date: r.date,
        completed: true
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, 10);
    
    return allItems;
  }, [plantHistory]);

  const typeIcons: Record<TaskType, { icon: string; bg: string }> = {
    water: { icon: '💧', bg: 'rgba(59, 130, 246, 0.1)' },
    fertilize: { icon: '🌱', bg: 'rgba(168, 85, 247, 0.1)' },
    prune: { icon: '✂️', bg: 'rgba(236, 72, 153, 0.1)' },
    pest: { icon: '🐛', bg: 'rgba(249, 115, 22, 0.1)' }
  };

  return (
    <ScrollView
      className={styles.statisticsPage}
      scrollY
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>本周统计</Text>
          </View>
          <View className={styles.statsGrid}>
            <StatCard
              title="完成率"
              value={`${weeklyStats.completionRate}%`}
              subtitle={`${weeklyStats.completedTasks}/${weeklyStats.totalTasks} 个任务`}
              color="#22C55E"
            />
            <StatCard
              title="总任务"
              value={weeklyStats.totalTasks}
              subtitle="本周安排"
              color="#3B82F6"
            />
          </View>

          <View className={styles.chartContainer}>
            <Text className={styles.chartTitle}>任务完成进度</Text>
            <View className={styles.progressBar}>
              <View className={styles.progressLabel}>
                <Text className={styles.progressText}>整体完成率</Text>
                <Text className={styles.progressValue}>{weeklyStats.completionRate}%</Text>
              </View>
              <View className={styles.progressTrack}>
                <View
                  className={styles.progressFill}
                  style={{ width: `${weeklyStats.completionRate}%` }}
                />
              </View>
            </View>
          </View>

          <Text className={styles.chartTitle}>任务类型分布</Text>
          <View className={styles.typeStats}>
            {(Object.keys(TaskTypeLabel) as TaskType[]).map(type => (
              <View key={type} className={styles.typeStatItem}>
                <View
                  className={styles.typeIcon}
                  style={{ backgroundColor: typeIcons[type].bg }}
                >
                  <Text>{typeIcons[type].icon}</Text>
                </View>
                <View className={styles.typeInfo}>
                  <Text className={styles.typeName}>{TaskTypeLabel[type]}</Text>
                  <Text className={styles.typeCount} style={{ color: TaskTypeColor[type] }}>
                    {weeklyStats.tasksByType[type]}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>历史记录</Text>
            <Button className={styles.exportBtn} onClick={handleExport}>
              📤 导出清单
            </Button>
          </View>

          <ScrollView scrollX className={styles.plantSelector}>
            <Text
              className={classnames(styles.plantChip, selectedPlant === 'all' && styles.active)}
              onClick={() => setSelectedPlant('all')}
            >
              全部植物
            </Text>
            {plants.map(plant => {
              const stats = plantTaskStats[plant.id] || { total: 0, completed: 0 };
              const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              return (
                <Text
                  key={plant.id}
                  className={classnames(styles.plantChip, selectedPlant === plant.id && styles.active)}
                  onClick={() => setSelectedPlant(plant.id)}
                >
                  <Image className={styles.plantChipAvatar} src={plant.avatar} mode="aspectFill" />
                  {plant.name} ({rate}%)
                </Text>
              );
            })}
          </ScrollView>

          {recentHistory.length === 0 ? (
            <EmptyState
              title="暂无历史记录"
              description="完成一些养护任务后就会有记录啦"
              icon="📊"
            />
          ) : (
            <View className={styles.historyList}>
              {recentHistory.map(item => (
                <View key={item.id} className={styles.historyItem}>
                  <View
                    className={styles.historyIcon}
                    style={{
                      backgroundColor: item.type === 'task' && item.taskType
                        ? `${TaskTypeColor[item.taskType]}20`
                        : '#ECFDF5'
                    }}
                  >
                    <Text>
                      {item.type === 'task' && item.taskType ? typeIcons[item.taskType].icon : '📷'}
                    </Text>
                  </View>
                  <View className={styles.historyInfo}>
                    <Text className={styles.historyTitle}>{item.title}</Text>
                    <Text className={styles.historyDate}>{item.date}</Text>
                  </View>
                  {item.type === 'task' && (
                    <Text className={classnames(
                      styles.historyStatus,
                      item.completed ? styles.statusCompleted : styles.statusPending
                    )}>
                      {item.completed ? '已完成' : '待完成'}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default StatisticsPage;
