import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, RefreshControl, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import TaskCard from '@/components/TaskCard';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { TaskTypeLabel, TaskTypeColor } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const plants = useAppStore((state) => state.plants);
  const tasks = useAppStore((state) => state.tasks);
  const getTodayTasks = useAppStore((state) => state.getTodayTasks);
  const getWeeklyStats = useAppStore((state) => state.getWeeklyStats);
  const completeTask = useAppStore((state) => state.completeTask);

  const todayTasks = useMemo(() => getTodayTasks(), [tasks]);
  const weeklyStats = useMemo(() => getWeeklyStats(), [tasks]);
  const pendingToday = todayTasks.filter(t => !t.completed);
  const completedToday = todayTasks.filter(t => t.completed);

  const alertPlants = useMemo(() => {
    return plants.filter(p => p.healthStatus !== 'good');
  }, [plants]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  };

  const handleAddPlant = () => {
    Taro.navigateTo({ url: '/pages/add-plant/index' });
  };

  const handleAddTask = () => {
    Taro.navigateTo({ url: '/pages/add-task/index' });
  };

  const handleAddRecord = () => {
    Taro.navigateTo({ url: '/pages/add-record/index' });
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    Taro.showToast({ title: '任务完成', icon: 'success' });
  };

  return (
    <ScrollView
      className={styles.homePage}
      scrollY
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className={styles.header}>
        <Text className={styles.greeting}>早上好 🌿</Text>
        <Text className={styles.subGreeting}>今天也要好好照顾你的植物哦</Text>
        <View className={styles.todayStats}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{pendingToday.length}</Text>
            <Text className={styles.statLabel}>待办任务</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{completedToday.length}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{plants.length}</Text>
            <Text className={styles.statLabel}>我的植物</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <View className={styles.quickActions}>
            <Button className={styles.actionBtn} onClick={handleAddPlant}>
              <Text className={styles.actionIcon}>🪴</Text>
              <Text className={styles.actionText}>添加植物</Text>
            </Button>
            <Button className={styles.actionBtn} onClick={handleAddTask}>
              <Text className={styles.actionIcon}>📋</Text>
              <Text className={styles.actionText}>添加任务</Text>
            </Button>
            <Button className={styles.actionBtn} onClick={handleAddRecord}>
              <Text className={styles.actionIcon}>📷</Text>
              <Text className={styles.actionText}>拍照记录</Text>
            </Button>
          </View>
        </View>

        {alertPlants.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>需要关注</Text>
            {alertPlants.map(plant => (
              <View
                key={plant.id}
                className={classnames(
                  styles.alertCard,
                  plant.healthStatus === 'danger' && styles.danger
                )}
              >
                <Text className={styles.alertIcon}>
                  {plant.healthStatus === 'danger' ? '🚨' : '⚠️'}
                </Text>
                <View className={styles.alertContent}>
                  <Text className={styles.alertTitle}>{plant.name}</Text>
                  <Text className={styles.alertDesc}>
                    {plant.healthStatus === 'danger' ? '需要立即处理！' : '建议关注一下'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>今日待办</Text>
            <Text className={styles.seeAll}>全部</Text>
          </View>
          {todayTasks.length === 0 ? (
            <EmptyState
              title="今天没有任务"
              description="给植物们安排一些养护任务吧"
              actionText="添加任务"
              onAction={handleAddTask}
            />
          ) : (
            <View className={styles.tasksList}>
              {todayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => handleCompleteTask(task.id)}
                />
              ))}
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>本周统计</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'row', gap: '24rpx', marginBottom: '24rpx' }}>
            <StatCard
              title="任务完成率"
              value={`${weeklyStats.completionRate}%`}
              subtitle={`${weeklyStats.completedTasks}/${weeklyStats.totalTasks} 个任务`}
              color="#22C55E"
            />
          </View>
          <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16rpx' }}>
            {Object.entries(weeklyStats.tasksByType).map(([type, count]) => (
              <View
                key={type}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  background: '#fff',
                  padding: '16rpx 24rpx',
                  borderRadius: '16rpx',
                  boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.06)'
                }}
              >
                <View
                  style={{
                    width: '16rpx',
                    height: '16rpx',
                    borderRadius: '50%',
                    background: TaskTypeColor[type as keyof typeof TaskTypeColor],
                    marginRight: '12rpx'
                  }}
                />
                <Text style={{ fontSize: '24rpx', color: '#6B7280', marginRight: '8rpx' }}>
                  {TaskTypeLabel[type as keyof typeof TaskTypeLabel]}
                </Text>
                <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#1F2937' }}>
                  {count}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>我的植物</Text>
            <Text className={styles.seeAll}>查看全部</Text>
          </View>
          <ScrollView scrollX className={styles.plantsGrid}>
            {plants.map(plant => (
              <View key={plant.id} className={styles.plantMiniCard}>
                <Image className={styles.plantMiniAvatar} src={plant.avatar} mode="aspectFill" />
                <Text className={styles.plantMiniName}>{plant.name}</Text>
                <Text className={classnames(
                  styles.plantMiniStatus,
                  plant.healthStatus === 'good' && styles.statusGood,
                  plant.healthStatus === 'warning' && styles.statusWarning,
                  plant.healthStatus === 'danger' && styles.statusDanger
                )}>
                  {plant.healthStatus === 'good' ? '健康' : plant.healthStatus === 'warning' ? '需关注' : '需处理'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
