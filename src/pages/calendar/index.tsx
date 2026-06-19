import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, RefreshControl } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import Calendar from '@/components/Calendar';
import TaskCard from '@/components/TaskCard';
import EmptyState from '@/components/EmptyState';
import { TaskTypeLabel, TaskTypeColor, TaskType } from '@/types';
import { formatDate, getDayName } from '@/utils/date';
import styles from './index.module.scss';

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<TaskType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const tasks = useAppStore((state) => state.tasks);
  const getTasksByDate = useAppStore((state) => state.getTasksByDate);
  const completeTask = useAppStore((state) => state.completeTask);

  const selectedDateStr = formatDate(selectedDate);
  const dayTasks = useMemo(() => getTasksByDate(selectedDateStr), [tasks, selectedDateStr]);

  const filteredTasks = useMemo(() => {
    if (filterType === 'all') return dayTasks;
    return dayTasks.filter(t => t.type === filterType);
  }, [dayTasks, filterType]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTask = () => {
    Taro.navigateTo({
      url: `/pages/add-task/index?date=${selectedDateStr}`
    });
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    Taro.showToast({ title: '任务完成', icon: 'success' });
  };

  const pendingCount = dayTasks.filter(t => !t.completed).length;
  const completedCount = dayTasks.filter(t => t.completed).length;

  return (
    <ScrollView
      className={styles.calendarPage}
      scrollY
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className={styles.content}>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      </View>

      <View className={styles.selectedDateInfo}>
        <Text className={styles.dateText}>
          {selectedDateStr} {getDayName(selectedDate)}
        </Text>
        <Text className={styles.tasksCount}>
          共 {dayTasks.length} 个任务 · 待完成 {pendingCount} · 已完成 {completedCount}
        </Text>
      </View>

      <View className={styles.legend}>
        {(Object.keys(TaskTypeLabel) as TaskType[]).map(type => (
          <View key={type} className={styles.legendItem}>
            <View
              className={styles.legendDot}
              style={{ backgroundColor: TaskTypeColor[type] }}
            />
            <Text>{TaskTypeLabel[type]}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollX className={styles.filterBar}>
        <Text
          className={classnames(styles.filterChip, filterType === 'all' && styles.active)}
          onClick={() => setFilterType('all')}
        >
          全部 ({dayTasks.length})
        </Text>
        {(Object.keys(TaskTypeLabel) as TaskType[]).map(type => {
          const count = dayTasks.filter(t => t.type === type).length;
          return (
            <Text
              key={type}
              className={classnames(styles.filterChip, filterType === type && styles.active)}
              onClick={() => setFilterType(type)}
            >
              <View
                className={styles.filterDot}
                style={{ backgroundColor: filterType === type ? '#fff' : TaskTypeColor[type] }}
              />
              {TaskTypeLabel[type]} ({count})
            </Text>
          );
        })}
      </ScrollView>

      <View className={styles.tasksSection}>
        <View className={styles.tasksTitle}>
          <Text>当天任务</Text>
          <Button className={styles.addTaskBtn} onClick={handleAddTask}>
            + 添加任务
          </Button>
        </View>

        {filteredTasks.length === 0 ? (
          <EmptyState
            title="当天没有任务"
            description="点击上方按钮添加一个养护任务吧"
            icon="📅"
            actionText="添加任务"
            onAction={handleAddTask}
          />
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={() => handleCompleteTask(task.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default CalendarPage;
