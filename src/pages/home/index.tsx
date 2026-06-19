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
  const isInitialized = useAppStore((state) => state.isInitialized);
  const hydrateFromStorage = useAppStore((state) => state.hydrateFromStorage);
  const getTodayTasks = useAppStore((state) => state.getTodayTasks);
  const getWeeklyStats = useAppStore((state) => state.getWeeklyStats);
  const getDueTasks = useAppStore((state) => state.getDueTasks);
  const getOverdueTasks = useAppStore((state) => state.getOverdueTasks);
  const completeTask = useAppStore((state) => state.completeTask);
  const isTaskDue = useAppStore((state) => state.isTaskDue);
  const isTaskOverdue = useAppStore((state) => state.isTaskOverdue);

  const todayTasks = useMemo(() => getTodayTasks(), [tasks, isInitialized]);
  const weeklyStats = useMemo(() => getWeeklyStats(), [tasks, isInitialized]);
  const dueTasks = useMemo(() => getDueTasks(), [tasks, isInitialized]);
  const overdueTasks = useMemo(() => getOverdueTasks(), [tasks, isInitialized]);
  const pendingToday = todayTasks.filter(t => !t.completed);
  const completedToday = todayTasks.filter(t => t.completed);

  const alertPlants = useMemo(() => {
    return plants.filter(p => p.healthStatus !== 'good');
  }, [plants]);

  const hasUrgent = overdueTasks.length > 0 || dueTasks.length > 0;
  const urgentCount = overdueTasks.length + dueTasks.length;

  const onRefresh = () => {
    setRefreshing(true);
    hydrateFromStorage();
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

  const scrollToTasks = () => {
    const query = Taro.createSelectorQuery();
    query.select('#tasks-section').scrollOffset();
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
          <View className={classnames(styles.statItem, urgentCount > 0 && styles.statItemUrgent)}>
            <Text className={classnames(styles.statNumber, urgentCount > 0 && styles.statNumberUrgent)}>
              {urgentCount}
            </Text>
            <Text className={styles.statLabel}>需立即处理</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{pendingToday.length}</Text>
            <Text className={styles.statLabel}>今日待办</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{plants.length}</Text>
            <Text className={styles.statLabel}>我的植物</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {hasUrgent && (
          <View className={classnames(styles.section, styles.urgentSection)}>
            <View className={classnames(styles.urgentBanner, overdueTasks.length > 0 && styles.urgentBannerDanger)}>
              <View className={styles.urgentBannerHeader}>
                <Text className={styles.urgentBannerIcon}>
                  {overdueTasks.length > 0 ? '🚨' : '⏰'}
                </Text>
                <Text className={styles.urgentBannerTitle}>
                  {overdueTasks.length > 0
                    ? `有 ${overdueTasks.length} 项任务已逾期！`
                    : `有 ${dueTasks.length} 项任务到期待处理`}
                </Text>
              </View>
              <Button className={styles.urgentBannerBtn} onClick={scrollToTasks}>
                立即处理 →
              </Button>
            </View>

            {overdueTasks.length > 0 && (
              <View className={styles.urgentSubSection}>
                <View className={styles.sectionTitle}>
                  <Text className={styles.overdueTitle}>❗️ 已逾期任务</Text>
                  <Text className={styles.overdueCount}>{overdueTasks.length}</Text>
                </View>
                {overdueTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    showDate
                    onComplete={() => handleCompleteTask(task.id)}
                  />
                ))}
              </View>
            )}

            {dueTasks.filter(t => !overdueTasks.includes(t)).length > 0 && (
              <View className={styles.urgentSubSection}>
                <View className={styles.sectionTitle}>
                  <Text className={styles.dueTitle}>⏰ 刚刚到期</Text>
                  <Text className={styles.dueCount}>
                    {dueTasks.filter(t => !overdueTasks.includes(t)).length}
                  </Text>
                </View>
                {dueTasks.filter(t => !overdueTasks.includes(t)).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    showDate
                    onComplete={() => handleCompleteTask(task.id)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

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
                onClick={() => Taro.navigateTo({ url: `/pages/plant-detail/index?id=${plant.id}` })}
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
                <Text className={styles.alertArrow}>→</Text>
              </View>
            ))}
          </View>
        )}

        <View className={styles.section} id="tasks-section">
          <View className={styles.sectionTitle}>
            <Text>今日待办</Text>
            <Text className={styles.taskSummary}>
              已完成 {completedToday.length}/{todayTasks.length}
            </Text>
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
              {pendingToday.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => handleCompleteTask(task.id)}
                />
              ))}
              {pendingToday.length === 0 && completedToday.length > 0 && (
                <View className={styles.allDoneCard}>
                  <Text className={styles.allDoneIcon}>🎉</Text>
                  <Text className={styles.allDoneText}>太棒了！今天的任务全部完成</Text>
                </View>
              )}
              {completedToday.length > 0 && (
                <>
                  <Text className={styles.completedSectionTitle}>
                    ✓ 已完成 ({completedToday.length})
                  </Text>
                  {completedToday.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      showComplete={false}
                    />
                  ))}
                </>
              )}
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
            <Text
              className={styles.seeAll}
              onClick={() => Taro.switchTab({ url: '/pages/plants/index' })}
            >
              查看全部
            </Text>
          </View>
          <ScrollView scrollX className={styles.plantsGrid}>
            {plants.map(plant => (
              <View
                key={plant.id}
                className={styles.plantMiniCard}
                onClick={() => Taro.navigateTo({ url: `/pages/plant-detail/index?id=${plant.id}` })}
              >
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
