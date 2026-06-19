import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Image, RefreshControl } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import RecordCard from '@/components/RecordCard';
import EmptyState from '@/components/EmptyState';
import { RecordType, RecordTypeLabel } from '@/types';
import styles from './index.module.scss';

const RecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RecordType | 'all'>('all');
  const [selectedPlant, setSelectedPlant] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const records = useAppStore((state) => state.records);
  const plants = useAppStore((state) => state.plants);

  const filteredRecords = useMemo(() => {
    let result = [...records].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (activeTab !== 'all') {
      result = result.filter(r => r.type === activeTab);
    }
    
    if (selectedPlant !== 'all') {
      result = result.filter(r => r.plantId === selectedPlant);
    }
    
    return result;
  }, [records, activeTab, selectedPlant]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  };

  const handleAddRecord = () => {
    Taro.navigateTo({ url: '/pages/add-record/index' });
  };

  const getTypeCount = (type: RecordType | 'all') => {
    if (type === 'all') return records.length;
    return records.filter(r => r.type === type).length;
  };

  return (
    <View className={styles.recordsPage}>
      <View className={styles.header}>
        <View className={styles.tabs}>
          <Text
            className={classnames(styles.tabItem, activeTab === 'all' && styles.active)}
            onClick={() => setActiveTab('all')}
          >
            全部 ({getTypeCount('all')})
          </Text>
          <Text
            className={classnames(styles.tabItem, activeTab === 'growth' && styles.active)}
            onClick={() => setActiveTab('growth')}
          >
            生长 ({getTypeCount('growth')})
          </Text>
          <Text
            className={classnames(styles.tabItem, activeTab === 'pest' && styles.active)}
            onClick={() => setActiveTab('pest')}
          >
            病虫害 ({getTypeCount('pest')})
          </Text>
          <Text
            className={classnames(styles.tabItem, activeTab === 'leaf' && styles.active)}
            onClick={() => setActiveTab('leaf')}
          >
            叶片 ({getTypeCount('leaf')})
          </Text>
        </View>

        <ScrollView scrollX className={styles.plantFilter}>
          <Text
            className={classnames(styles.plantChip, selectedPlant === 'all' && styles.active)}
            onClick={() => setSelectedPlant('all')}
          >
            全部植物
          </Text>
          {plants.map(plant => (
            <Text
              key={plant.id}
              className={classnames(styles.plantChip, selectedPlant === plant.id && styles.active)}
              onClick={() => setSelectedPlant(plant.id)}
            >
              <Image className={styles.plantChipAvatar} src={plant.avatar} mode="aspectFill" />
              {plant.name}
            </Text>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className={styles.content}
        scrollY
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRecords.length === 0 ? (
          <EmptyState
            title="还没有记录"
            description="点击右下角按钮记录植物的生长变化吧"
            icon="📷"
            actionText="添加记录"
            onAction={handleAddRecord}
          />
        ) : (
          filteredRecords.map(record => (
            <RecordCard key={record.id} record={record} />
          ))
        )}
      </ScrollView>

      <Button className={styles.addFab} onClick={handleAddRecord}>
        <Text className={styles.addIcon}>+</Text>
      </Button>
    </View>
  );
};

export default RecordsPage;
