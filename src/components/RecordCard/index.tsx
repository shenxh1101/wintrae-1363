import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import { Record, RecordTypeLabel } from '@/types';
import { getRelativeTime } from '@/utils/date';
import styles from './index.module.scss';

interface RecordCardProps {
  record: Record;
}

const RecordCard: React.FC<RecordCardProps> = ({ record }) => {
  const typeConfig = {
    growth: { color: '#22C55E', bg: '#ECFDF5' },
    pest: { color: '#EF4444', bg: '#FEF2F2' },
    leaf: { color: '#F59E0B', bg: '#FFFBEB' }
  };

  const config = typeConfig[record.type];

  return (
    <View className={styles.recordCard}>
      <Image className={styles.recordImage} src={record.image} mode="aspectFill" />
      <View className={styles.recordContent}>
        <View className={styles.recordHeader}>
          <View className={styles.typeTag} style={{ backgroundColor: config.bg, color: config.color }}>
            <Text className={styles.typeText}>{RecordTypeLabel[record.type]}</Text>
          </View>
          <Text className={styles.time}>{getRelativeTime(record.date)}</Text>
        </View>
        <Text className={styles.plantName}>{record.plantName}</Text>
        {record.notes && <Text className={styles.notes}>{record.notes}</Text>}
        {record.treatment && (
          <View className={styles.treatment}>
            <Text className={styles.treatmentLabel}>处理：</Text>
            <Text className={styles.treatmentText}>{record.treatment}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RecordCard;
