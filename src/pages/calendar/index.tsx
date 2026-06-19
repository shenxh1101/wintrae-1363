import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import Calendar from '@/components/Calendar';
import TaskCard from '@/components/TaskCard';
import EmptyState from '@/components/EmptyState';
import { TaskTypeLabel, TaskTypeColor, TaskType, Task } from '@/types';
import { formatDate, getDayName } from '@/utils/date';
import styles from './index.module.scss';

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<TaskType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const tasks = useAppStore((state) => state.tasks);
  const getTasksByDate = useAppStore((state) => state.getTasksByDate);
  const completeTask = useAppStore((state) => state.completeTask);
  const isTaskDue = useAppStore((state) => state.isTaskDue);
  const isTaskOverdue = useAppStore((state) => state.isTaskOverdue);
  const hydrateFromStorage = useAppStore((state) => state.hydrateFromStorage);

  const selectedDateStr = formatDate(selectedDate);
  const dayTasks = useMemo(() => getTasksByDate(selectedDateStr), [tasks, selectedDateStr]);

  const filteredTasks = useMemo(() => {
    if (filterType === 'all') return dayTasks;
    return dayTasks.filter(t => t.type === filterType);
  }, [dayTasks, filterType]);

  const { overdueTasks, dueTasks, pendingTasks, completedTasks } = useMemo(() => {
    const overdue: Task[] = [];
    const due: Task[] = [];
    const pending: Task[] = [];
    const completed: Task[] = [];
    
    filteredTasks.forEach(task => {
      if (task.completed) {
        completed.push(task);
      } else if (isTaskOverdue(task)) {
        overdue.push(task);
      } else if (isTaskDue(task)) {
        due.push(task);
      } else {
        pending.push(task);
      }
    });
    
    return {
      overdueTasks: overdue,
      dueTasks: due,
      pendingTasks: pending,
      completedTasks: completed
    };
  }, [filteredTasks, isTaskDue, isTaskOverdue]);

  const onRefresh = () => {
    setRefreshing(true);
    hydrateFromStorage();
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
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
  const overdueCount = dayTasks.filter(t => !t.completed && isTaskOverdue(t)).length;
  const dueCount = dayTasks.filter(t => !t.completed && !isTaskOverdue(t) && isTaskDue(t)).length;

  const renderTaskGroup = (title: string, tasks: Task[], variant: 'overdue' | 'due' | 'pending' | 'completed') => {
    if (tasks.length === 0) return null;
    return (
      <View className={styles.taskGroup} key={variant}>
        <View className={classnames(
          styles.taskGroupHeader,
          variant === 'overdue' && styles.groupOverdue,
          variant === 'due' && styles.groupDue,
          variant === 'pending' && styles.groupPending,
          variant === 'completed' && styles.groupCompleted
        )}>
          <Text className={styles.taskGroupTitle}>
            {variant === 'overdue' && '❗️ '}
            {variant === 'due' && '⏰ '}
            {variant === 'completed' && '✅ '}
            {title}
          </Text>
          <View className={classnames(
            styles.taskGroupCount,
            variant === 'overdue' && styles.countOverdue,
            variant === 'due' && styles.countDue,
            variant === 'completed' && styles.countCompleted
          )}>
            {tasks.length}
          </View>
        </View>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={() => handleCompleteTask(task.id)}
            showDate={false}
          />
        ))}
      </View>
    );
  };

  const hasAnyTask = filteredTasks.length > 0;

  useDidShow(() => {
    console.log('[Calendar] useDidShow - hydrating storage');
    hydrateFromStorage();
  });

  return (
    <ScrollView
      className={styles.calendarPage}
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={onRefresh}
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
        <View className={styles.taskStatsRow}>
          {overdueCount > 0 && (
            <View className={classnames(styles.statBadge, styles.statOverdue)}>
              <Text className={styles.statBadgeText}>逾期 {overdueCount}</Text>
            </View>
          )}
          {dueCount > 0 && (
            <View className={classnames(styles.statBadge, styles.statDue)}>
              <Text className={styles.statBadgeText}>到期 {dueCount}</Text>
            </View>
          )}
          <View className={classnames(styles.statBadge, styles.statPending)}>
            <Text className={styles.statBadgeText}>待办 {pendingCount}</Text>
          </View>
          <View className={classnames(styles.statBadge, styles.statDone)}>
            <Text className={styles.statBadgeText}>已完成 {completedCount}</Text>
          </View>
        </View>
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

        {!hasAnyTask ? (
          <EmptyState
            title="当天没有任务"
            description="点击上方按钮添加一个养护任务吧"
            icon="📅"
            actionText="添加任务"
            onAction={handleAddTask}
          />
        ) : (
          <View>
            {renderTaskGroup('已逾期', overdueTasks, 'overdue')}
            {renderTaskGroup('已到期', dueTasks, 'due')}
            {renderTaskGroup('待处理', pendingTasks, 'pending')}
            {renderTaskGroup('已完成', completedTasks, 'completed')}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CalendarPage;
