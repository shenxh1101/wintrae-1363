import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = '🌱', actionText, onAction }) => {
  return (
    <View className={styles.emptyState}>
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.title}>{title}</Text>
      {description && <Text className={styles.description}>{description}</Text>}
      {actionText && onAction && (
        <Button className={styles.actionBtn} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </View>
  );
};

export default EmptyState;
