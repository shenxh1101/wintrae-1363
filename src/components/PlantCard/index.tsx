import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { Plant, LightLevelLabel } from '@/types';
import styles from './index.module.scss';

interface PlantCardProps {
  plant: Plant;
  onClick?: () => void;
  showStatus?: boolean;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, onClick, showStatus = true }) => {
  const statusConfig = {
    good: { label: '健康', color: '#10B981', bg: '#ECFDF5' },
    warning: { label: '需关注', color: '#F59E0B', bg: '#FFFBEB' },
    danger: { label: '需处理', color: '#EF4444', bg: '#FEF2F2' }
  };

  const status = statusConfig[plant.healthStatus];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/plant-detail/index?id=${plant.id}` });
    }
  };

  return (
    <View className={styles.plantCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <Image className={styles.avatar} src={plant.avatar} mode="aspectFill" />
        <View className={styles.info}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{plant.name}</Text>
            {showStatus && (
              <View className={classnames(styles.statusBadge, styles[`status${plant.healthStatus}`])}>
                <Text className={styles.statusText} style={{ color: status.color }}>
                  {status.label}
                </Text>
              </View>
            )}
          </View>
          <Text className={styles.species}>{plant.species}</Text>
        </View>
      </View>
      <View className={styles.cardBody}>
        <View className={styles.infoItem}>
          <Text className={styles.label}>位置</Text>
          <Text className={styles.value}>{plant.location}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.label}>光照</Text>
          <Text className={styles.value}>{LightLevelLabel[plant.lightLevel]}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.label}>换盆</Text>
          <Text className={styles.value}>{plant.repotDate}</Text>
        </View>
      </View>
    </View>
  );
};

export default PlantCard;
