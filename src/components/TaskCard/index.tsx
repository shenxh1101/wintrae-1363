import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import { Task, TaskTypeLabel, TaskTypeColor } from '@/types';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

interface TaskCardProps {
  task: Task;
  showComplete?: boolean;
  onComplete?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, showComplete = true, onComplete }) => {
  const completeTask = useAppStore((state) => state.completeTask);
  const typeColor = TaskTypeColor[task.type];
  const typeLabel = TaskTypeLabel[task.type];

  const handleComplete = () => {
    if (!task.completed) {
      completeTask(task.id);
      onComplete?.();
    }
  };

  return (
    <View className={classnames(styles.taskCard, task.completed && styles.completed)}>
      <View className={styles.taskHeader}>
        <View className={styles.typeTag} style={{ backgroundColor: `${typeColor}15`, color: typeColor }}>
          <Text className={styles.typeText}>{typeLabel}</Text>
        </View>
        <Text className={styles.time}>{task.time}</Text>
      </View>
      <View className={styles.taskBody}>
        <View className={styles.plantInfo}>
          <Text className={styles.plantName}>{task.plantName}</Text>
          {task.notes && <Text className={styles.notes}>{task.notes}</Text>}
        </View>
        {showComplete && !task.completed && (
          <Button className={styles.completeBtn} onClick={handleComplete}>
            完成
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
