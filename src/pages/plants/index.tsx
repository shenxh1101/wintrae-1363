import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Button, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import PlantCard from '@/components/PlantCard';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const PlantsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'library'>('my');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const plants = useAppStore((state) => state.plants);
  const plantLibrary = useAppStore((state) => state.plantLibrary);
  const hydrateFromStorage = useAppStore((state) => state.hydrateFromStorage);

  const filteredPlants = useMemo(() => {
    let result = [...plants];
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) ||
        p.species.toLowerCase().includes(lowerSearch)
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter(p => p.healthStatus === filterStatus);
    }
    return result;
  }, [plants, searchText, filterStatus]);

  const filteredLibrary = useMemo(() => {
    if (!searchText) return plantLibrary;
    const lowerSearch = searchText.toLowerCase();
    return plantLibrary.filter(p => 
      p.name.toLowerCase().includes(lowerSearch) ||
      p.species.toLowerCase().includes(lowerSearch)
    );
  }, [plantLibrary, searchText]);

  const handleAddPlant = () => {
    Taro.navigateTo({ url: '/pages/add-plant/index' });
  };

  const handlePlantClick = (plantId: string) => {
    Taro.navigateTo({ url: `/pages/plant-detail/index?id=${plantId}` });
  };

  const handleLibraryClick = (item: any) => {
    Taro.showModal({
      title: item.name,
      content: `浇水：${item.waterFrequency}\n光照：${item.lightNeed}\n温度：${item.temperature}\n\n养护要点：\n${item.tips.join('\n')}`,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  useDidShow(() => {
    console.log('[Plants] useDidShow - hydrating storage');
    hydrateFromStorage();
  });

  const onRefresh = () => {
    setRefreshing(true);
    hydrateFromStorage();
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  };

  return (
    <View className={styles.plantsPage}>
      <View className={styles.header}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索植物名称或品种"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
        <View className={styles.tabs}>
          <Text
            className={classnames(styles.tabItem, activeTab === 'my' && styles.active)}
            onClick={() => setActiveTab('my')}
          >
            我的植物 ({plants.length})
          </Text>
          <Text
            className={classnames(styles.tabItem, activeTab === 'library' && styles.active)}
            onClick={() => setActiveTab('library')}
          >
            养护知识
          </Text>
        </View>
      </View>

      <ScrollView
        className={styles.content}
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={onRefresh}
      >
        {activeTab === 'my' ? (
          <>
            <ScrollView scrollX className={styles.filterBar}>
              <Text
                className={classnames(styles.filterChip, filterStatus === 'all' && styles.active)}
                onClick={() => setFilterStatus('all')}
              >
                全部 ({plants.length})
              </Text>
              <Text
                className={classnames(styles.filterChip, filterStatus === 'good' && styles.active)}
                onClick={() => setFilterStatus('good')}
              >
                健康 ({plants.filter(p => p.healthStatus === 'good').length})
              </Text>
              <Text
                className={classnames(styles.filterChip, filterStatus === 'warning' && styles.active)}
                onClick={() => setFilterStatus('warning')}
              >
                需关注 ({plants.filter(p => p.healthStatus === 'warning').length})
              </Text>
              <Text
                className={classnames(styles.filterChip, filterStatus === 'danger' && styles.active)}
                onClick={() => setFilterStatus('danger')}
              >
                需处理 ({plants.filter(p => p.healthStatus === 'danger').length})
              </Text>
            </ScrollView>

            {filteredPlants.length === 0 ? (
              <EmptyState
                title="还没有植物"
                description="点击右下角按钮添加你的第一盆植物吧"
                icon="🪴"
                actionText="添加植物"
                onAction={handleAddPlant}
              />
            ) : (
              filteredPlants.map(plant => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onClick={() => handlePlantClick(plant.id)}
                />
              ))
            )}
          </>
        ) : (
          <>
            {filteredLibrary.length === 0 ? (
              <EmptyState
                title="没有找到相关植物"
                description="试试其他关键词搜索吧"
                icon="🌱"
              />
            ) : (
              <View className={styles.libraryGrid}>
                {filteredLibrary.map(item => (
                  <View
                    key={item.id}
                    className={styles.libraryCard}
                    onClick={() => handleLibraryClick(item)}
                  >
                    <Image className={styles.libraryImage} src={item.image} mode="aspectFill" />
                    <View className={styles.libraryInfo}>
                      <Text className={styles.libraryName}>{item.name}</Text>
                      <Text className={styles.librarySpecies}>{item.species}</Text>
                      <View className={styles.libraryMeta}>
                        <Text className={styles.metaTag}>💧 {item.waterFrequency}</Text>
                        <Text className={styles.metaTag}>☀️ {item.lightNeed}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {activeTab === 'my' && (
        <Button className={styles.addFab} onClick={handleAddPlant}>
          <Text className={styles.addIcon}>+</Text>
        </Button>
      )}
    </View>
  );
};

export default PlantsPage;
