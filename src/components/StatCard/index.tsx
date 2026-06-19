import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color = '#22C55E', icon }) => {
  return (
    <View className={styles.statCard} style={{ borderTopColor: color }}>
      <View className={styles.statHeader}>
        <Text className={styles.title}>{title}</Text>
        {icon && <Text className={styles.icon}>{icon}</Text>}
      </View>
      <Text className={styles.value} style={{ color }}>{value}</Text>
      {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

export default StatCard;
