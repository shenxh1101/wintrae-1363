import React, { useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import { Task, TaskTypeLabel, TaskTypeColor } from '@/types';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

interface TaskCardProps {
  task: Task;
  showComplete?: boolean;
  onComplete?: () => void;
  showDate?: boolean;
}

type TaskStatus = 'pending' | 'due' | 'overdue' | 'completed';

const TaskCard: React.FC<TaskCardProps> = ({ task, showComplete = true, onComplete, showDate = false }) => {
  const completeTask = useAppStore((state) => state.completeTask);
  const isTaskDue = useAppStore((state) => state.isTaskDue);
  const isTaskOverdue = useAppStore((state) => state.isTaskOverdue);

  const typeColor = TaskTypeColor[task.type];
  const typeLabel = TaskTypeLabel[task.type];

  const status: TaskStatus = useMemo(() => {
    if (task.completed) return 'completed';
    if (isTaskOverdue(task)) return 'overdue';
    if (isTaskDue(task)) return 'due';
    return 'pending';
  }, [task, isTaskDue, isTaskOverdue]);

  const statusLabel = {
    pending: '待处理',
    due: '⏰ 到期',
    overdue: '❗️ 逾期',
    completed: '已完成'
  }[status];

  const handleComplete = () => {
    if (!task.completed) {
      completeTask(task.id);
      onComplete?.();
    }
  };

  return (
    <View
      className={classnames(
        styles.taskCard,
        task.completed && styles.completed,
        status === 'due' && styles.due,
        status === 'overdue' && styles.overdue
      )}
    >
      <View className={styles.taskHeader}>
        <View className={styles.typeTag} style={{ backgroundColor: `${typeColor}15`, color: typeColor }}>
          <Text className={styles.typeText}>{typeLabel}</Text>
        </View>
        <View className={styles.timeRow}>
          {showDate && (
            <Text className={styles.dateText}>{task.date}</Text>
          )}
          <Text className={styles.time}>{task.time}</Text>
          <View
            className={classnames(
              styles.statusBadge,
              status === 'due' && styles.statusBadgeDue,
              status === 'overdue' && styles.statusBadgeOverdue,
              status === 'completed' && styles.statusBadgeCompleted
            )}
          >
            <Text className={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>
      </View>
      <View className={styles.taskBody}>
        <View className={styles.plantInfo}>
          <Text className={styles.plantName}>{task.plantName}</Text>
          {task.notes && <Text className={styles.notes}>{task.notes}</Text>}
        </View>
        {showComplete && !task.completed && (
          <Button
            className={classnames(
              styles.completeBtn,
              status === 'overdue' && styles.completeBtnOverdue,
              status === 'due' && styles.completeBtnDue
            )}
            onClick={handleComplete}
          >
            ✓ 完成
          </Button>
        )}
        {task.completed && (
          <View className={styles.completedBadge}>
            <Text className={styles.completedText}>已完成</Text>
          </View>
        )}
      </View>
      {task.completedAt && (
        <Text className={styles.completedAt}>完成于 {task.completedAt}</Text>
      )}
    </View>
  );
};

export default TaskCard;
