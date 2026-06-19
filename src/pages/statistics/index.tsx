import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Image, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { TaskTypeLabel, TaskTypeColor, TaskType, Record as AppRecord, WeeklyReview } from '@/types';
import { formatDate, getRecentWeeks } from '@/utils/date';
import styles from './index.module.scss';

const StatisticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'review' | 'history'>('overview');
  const [selectedPlant, setSelectedPlant] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<TaskType[]>([]);
  const [defaultAssignee, setDefaultAssignee] = useState('家人');
  const [plantAssignees, setPlantAssignees] = useState<Record<string, string>>({});

  const plants = useAppStore((state) => state.plants);
  const tasks = useAppStore((state) => state.tasks);
  const records = useAppStore((state) => state.records);
  const getWeeklyStats = useAppStore((state) => state.getWeeklyStats);
  const getWeeklyReview = useAppStore((state) => state.getWeeklyReview);
  const getTasksByPlant = useAppStore((state) => state.getTasksByPlant);
  const getRecordsByPlant = useAppStore((state) => state.getRecordsByPlant);
  const generateCareList = useAppStore((state) => state.generateCareList);
  const generateAssignmentList = useAppStore((state) => state.generateAssignmentList);
  const hydrateFromStorage = useAppStore((state) => state.hydrateFromStorage);
  const isTaskDue = useAppStore((state) => state.isTaskDue);
  const isTaskOverdue = useAppStore((state) => state.isTaskOverdue);

  const recentWeeks = useMemo(() => getRecentWeeks(4), []);
  const weeklyStats = useMemo(() => getWeeklyStats(), [tasks, getWeeklyStats]);
  const weeklyReview = useMemo(() => getWeeklyReview(selectedWeek), [tasks, selectedWeek, getWeeklyReview]);

  const plantHistory = useMemo(() => {
    if (selectedPlant === 'all') {
      return {
        tasks: tasks,
        records: records
      };
    }
    return {
      tasks: getTasksByPlant(selectedPlant),
      records: getRecordsByPlant(selectedPlant)
    };
  }, [selectedPlant, tasks, records, getTasksByPlant, getRecordsByPlant]);

  const plantTaskStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; overdue: number; due: number }> = {};
    tasks.forEach(t => {
      if (!stats[t.plantId]) {
        stats[t.plantId] = { total: 0, completed: 0, overdue: 0, due: 0 };
      }
      stats[t.plantId].total++;
      if (t.completed) {
        stats[t.plantId].completed++;
      } else if (isTaskOverdue(t)) {
        stats[t.plantId].overdue++;
      } else if (isTaskDue(t)) {
        stats[t.plantId].due++;
      }
    });
    return stats;
  }, [tasks, isTaskDue, isTaskOverdue]);

  const onRefresh = () => {
    setRefreshing(true);
    hydrateFromStorage();
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleAssignment = () => {
    setSelectedPlantIds([]);
    setSelectedTaskTypes([]);
    setPlantAssignees({});
    setShowAssignmentModal(true);
  };

  const confirmExport = (scope: 'current' | 'all') => {
    const plantId = scope === 'current' && selectedPlant !== 'all' ? selectedPlant : undefined;
    const plant = plantId ? plants.find(p => p.id === plantId) : null;
    const exportName = plant ? plant.name : '所有植物';
    
    const content = generateCareList(plantId);
    
    Taro.setClipboardData({
      data: content,
      success: () => {
        setShowExportModal(false);
        Taro.showModal({
          title: '导出成功 ✅',
          content: `【${exportName}】的养护清单已复制到剪贴板，包含最新数据和完成状态。\n可直接粘贴发送给家人！`,
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#10B981'
        });
      },
      fail: () => {
        setShowExportModal(false);
        Taro.showToast({ title: '导出失败，请重试', icon: 'none' });
      }
    });
    console.log('[Export] Care list exported for:', exportName, ', plantId:', plantId || 'all');
  };

  const togglePlantSelection = (plantId: string) => {
    setSelectedPlantIds(prev => 
      prev.includes(plantId) 
        ? prev.filter(id => id !== plantId)
        : [...prev, plantId]
    );
  };

  const toggleTypeSelection = (type: TaskType) => {
    setSelectedTaskTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const selectAllPlants = () => {
    if (selectedPlantIds.length === plants.length) {
      setSelectedPlantIds([]);
    } else {
      setSelectedPlantIds(plants.map(p => p.id));
    }
  };

  const selectAllTypes = () => {
    const allTypes: TaskType[] = ['water', 'fertilize', 'prune', 'pest'];
    if (selectedTaskTypes.length === allTypes.length) {
      setSelectedTaskTypes([]);
    } else {
      setSelectedTaskTypes(allTypes);
    }
  };

  const handleGenerateAssignment = () => {
    const assignees: Record<string, string> = {
      _default: defaultAssignee || '待分配',
      ...plantAssignees
    };

    const content = generateAssignmentList({
      plantIds: selectedPlantIds.length > 0 ? selectedPlantIds : undefined,
      taskTypes: selectedTaskTypes.length > 0 ? selectedTaskTypes : undefined,
      assignees
    });

    Taro.setClipboardData({
      data: content,
      success: () => {
        setShowAssignmentModal(false);
        Taro.showModal({
          title: '分工单生成成功 ✅',
          content: '养护分工单已复制到剪贴板，包含负责人、日期和完成状态。\n可直接粘贴发送到家庭群！',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#10B981'
        });
      },
      fail: () => {
        Taro.showToast({ title: '生成失败，请重试', icon: 'none' });
      }
    });
  };

  const recentHistory = useMemo(() => {
    const allItems: Array<{
      id: string;
      type: 'task' | 'record';
      taskType: TaskType | null;
      title: string;
      date: string;
      completed: boolean;
      image?: string;
      status?: 'pending' | 'due' | 'overdue' | 'completed';
    }> = [
      ...plantHistory.tasks.map(t => {
        let status: 'pending' | 'due' | 'overdue' | 'completed' = 'pending';
        if (t.completed) {
          status = 'completed';
        } else if (isTaskOverdue(t)) {
          status = 'overdue';
        } else if (isTaskDue(t)) {
          status = 'due';
        }
        return {
          id: t.id,
          type: 'task' as const,
          taskType: t.type,
          title: `${TaskTypeLabel[t.type]} - ${t.plantName}`,
          date: t.date,
          completed: t.completed,
          status
        };
      }),
      ...plantHistory.records.map((r: AppRecord) => ({
        id: r.id,
        type: 'record' as const,
        taskType: null,
        title: `📷 ${r.plantName} - ${r.type === 'growth' ? '生长记录' : r.type === 'pest' ? '病虫害' : '叶片异常'}${r.notes ? '：' + r.notes.slice(0, 20) + (r.notes.length > 20 ? '...' : '') : ''}`,
        date: r.date,
        completed: true,
        image: r.image,
        status: 'completed' as const
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, 15);
    
    return allItems;
  }, [plantHistory, isTaskDue, isTaskOverdue]);

  const typeIcons: Record<TaskType, { icon: string; bg: string }> = {
    water: { icon: '💧', bg: 'rgba(59, 130, 246, 0.1)' },
    fertilize: { icon: '🌱', bg: 'rgba(168, 85, 247, 0.1)' },
    prune: { icon: '✂️', bg: 'rgba(236, 72, 153, 0.1)' },
    pest: { icon: '🐛', bg: 'rgba(249, 115, 22, 0.1)' }
  };

  const selectedPlantInfo = selectedPlant !== 'all' ? plants.find(p => p.id === selectedPlant) : null;
  const selectedPlantStats = selectedPlant !== 'all' ? (plantTaskStats[selectedPlant] || { total: 0, completed: 0, overdue: 0, due: 0 }) : null;

  useDidShow(() => {
    console.log('[Statistics] useDidShow - hydrating storage');
    hydrateFromStorage();
  });

  const renderOverview = () => (
    <>
      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>本周统计</Text>
        </View>
        <View className={styles.statsGrid}>
          <StatCard
            title="完成率"
            value={`${weeklyStats.completionRate}%`}
            subtitle={`${weeklyStats.completedTasks}/${weeklyStats.totalTasks} 个任务`}
            color="#22C55E"
          />
          <StatCard
            title="总任务"
            value={weeklyStats.totalTasks}
            subtitle="本周安排"
            color="#3B82F6"
          />
        </View>

        <View className={styles.chartContainer}>
          <Text className={styles.chartTitle}>任务完成进度</Text>
          <View className={styles.progressBar}>
            <View className={styles.progressLabel}>
              <Text className={styles.progressText}>整体完成率</Text>
              <Text className={styles.progressValue}>{weeklyStats.completionRate}%</Text>
            </View>
            <View className={styles.progressTrack}>
              <View
                className={styles.progressFill}
                style={{ width: `${weeklyStats.completionRate}%` }}
              />
            </View>
          </View>
        </View>

        <Text className={styles.chartTitle}>任务类型分布</Text>
        <View className={styles.typeStats}>
          {(Object.keys(TaskTypeLabel) as TaskType[]).map(type => (
            <View key={type} className={styles.typeStatItem}>
              <View
                className={styles.typeIcon}
                style={{ backgroundColor: typeIcons[type].bg }}
              >
                <Text>{typeIcons[type].icon}</Text>
              </View>
              <View className={styles.typeInfo}>
                <Text className={styles.typeName}>{TaskTypeLabel[type]}</Text>
                <Text className={styles.typeCount} style={{ color: TaskTypeColor[type] }}>
                  {weeklyStats.tasksByType[type]}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>历史记录</Text>
          <View style={{ display: 'flex', flexDirection: 'row', gap: '16rpx' }}>
            <Button className={styles.exportBtn} onClick={handleAssignment}>
              📋 分工单
            </Button>
            <Button className={styles.exportBtn} onClick={handleExport}>
              📤 导出清单
            </Button>
          </View>
        </View>

        {selectedPlantInfo && selectedPlantStats && (
          <View className={styles.plantSummaryCard}>
            <View className={styles.plantSummaryHeader}>
              <Image className={styles.plantSummaryAvatar} src={selectedPlantInfo.avatar} mode="aspectFill" />
              <View className={styles.plantSummaryInfo}>
                <Text className={styles.plantSummaryName}>{selectedPlantInfo.name}</Text>
                <Text className={styles.plantSummarySpecies}>{selectedPlantInfo.species} · {selectedPlantInfo.location}</Text>
              </View>
            </View>
            <View className={styles.plantSummaryStats}>
              <View className={styles.summaryStatItem}>
                <Text className={classnames(styles.summaryStatNum, styles.summaryStatBlue)}>{selectedPlantStats.total}</Text>
                <Text className={styles.summaryStatLabel}>总任务</Text>
              </View>
              {selectedPlantStats.overdue > 0 && (
                <View className={styles.summaryStatItem}>
                  <Text className={classnames(styles.summaryStatNum, styles.summaryStatRed)}>{selectedPlantStats.overdue}</Text>
                  <Text className={styles.summaryStatLabel}>逾期</Text>
                </View>
              )}
              {selectedPlantStats.due > 0 && (
                <View className={styles.summaryStatItem}>
                  <Text className={classnames(styles.summaryStatNum, styles.summaryStatYellow)}>{selectedPlantStats.due}</Text>
                  <Text className={styles.summaryStatLabel}>到期</Text>
                </View>
              )}
              <View className={styles.summaryStatItem}>
                <Text className={classnames(styles.summaryStatNum, styles.summaryStatGreen)}>{selectedPlantStats.completed}</Text>
                <Text className={styles.summaryStatLabel}>已完成</Text>
              </View>
            </View>
          </View>
        )}

        <ScrollView scrollX className={styles.plantSelector}>
          <Text
            className={classnames(styles.plantChip, selectedPlant === 'all' && styles.active)}
            onClick={() => setSelectedPlant('all')}
          >
            🌿 全部植物
          </Text>
          {plants.map(plant => {
            const stats = plantTaskStats[plant.id] || { total: 0, completed: 0, overdue: 0, due: 0 };
            const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            const hasUrgent = stats.overdue > 0 || stats.due > 0;
            return (
              <Text
                key={plant.id}
                className={classnames(
                  styles.plantChip,
                  selectedPlant === plant.id && styles.active,
                  hasUrgent && selectedPlant !== plant.id && styles.hasUrgent
                )}
                onClick={() => setSelectedPlant(plant.id)}
              >
                <Image className={styles.plantChipAvatar} src={plant.avatar} mode="aspectFill" />
                {plant.name} ({rate}%)
                {stats.overdue > 0 && <Text className={styles.chipUrgentDot}>●</Text>}
              </Text>
            );
          })}
        </ScrollView>

        {recentHistory.length === 0 ? (
          <EmptyState
            title="暂无历史记录"
            description="完成一些养护任务后就会有记录啦"
            icon="📊"
          />
        ) : (
          <View className={styles.historyList}>
            {recentHistory.map(item => (
              <View key={item.id} className={styles.historyItem}>
                {item.type === 'record' && item.image ? (
                  <Image
                    className={styles.historyImage}
                    src={item.image}
                    mode="aspectFill"
                    onClick={() => {
                      Taro.previewImage({
                        urls: [item.image!],
                        current: item.image
                      });
                    }}
                  />
                ) : (
                  <View
                    className={styles.historyIcon}
                    style={{
                      backgroundColor: item.type === 'task' && item.taskType
                        ? `${TaskTypeColor[item.taskType]}20`
                        : '#ECFDF5'
                    }}
                  >
                    <Text>
                      {item.type === 'task' && item.taskType ? typeIcons[item.taskType].icon : '📷'}
                    </Text>
                  </View>
                )}
                <View className={styles.historyInfo}>
                  <Text className={styles.historyTitle}>{item.title}</Text>
                  <Text className={styles.historyDate}>{item.date}</Text>
                </View>
                {item.type === 'task' && (
                  <Text className={classnames(
                    styles.historyStatus,
                    item.status === 'completed' && styles.statusCompleted,
                    item.status === 'pending' && styles.statusPending,
                    item.status === 'due' && styles.statusDue,
                    item.status === 'overdue' && styles.statusOverdue
                  )}>
                    {item.status === 'completed' ? '已完成' :
                     item.status === 'overdue' ? '❗逾期' :
                     item.status === 'due' ? '⏰到期' : '待处理'}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </>
  );

  const renderReview = () => (
    <View className={styles.section}>
      <View className={styles.sectionTitle}>
        <Text>周复盘</Text>
      </View>

      <ScrollView scrollX className={styles.weekSelector}>
        {recentWeeks.map((week, idx) => (
          <Text
            key={idx}
            className={classnames(styles.weekChip, selectedWeek === idx && styles.active)}
            onClick={() => setSelectedWeek(idx)}
          >
            {week.label}
          </Text>
        ))}
      </ScrollView>

      <View className={styles.reviewSection}>
        <View className={styles.reviewHeader}>
          <Text className={styles.reviewTitle}>本周表现</Text>
          <Text className={styles.reviewWeekLabel}>{weeklyReview.weekLabel}</Text>
        </View>

        <View className={styles.reviewStatsRow}>
          <View className={classnames(styles.reviewStatCard, styles.statSuccess)}>
            <Text className={styles.reviewStatValue}>{weeklyReview.completionRate}%</Text>
            <Text className={styles.reviewStatLabel}>完成率</Text>
          </View>
          <View className={classnames(styles.reviewStatCard, styles.statInfo)}>
            <Text className={styles.reviewStatValue}>{weeklyReview.totalTasks}</Text>
            <Text className={styles.reviewStatLabel}>总任务</Text>
          </View>
          <View className={classnames(styles.reviewStatCard, styles.statDanger)}>
            <Text className={styles.reviewStatValue}>{weeklyReview.overdueCount}</Text>
            <Text className={styles.reviewStatLabel}>逾期次数</Text>
          </View>
          <View className={classnames(styles.reviewStatCard, styles.statWarning)}>
            <Text className={styles.reviewStatValue}>{weeklyReview.avgDelayDays}</Text>
            <Text className={styles.reviewStatLabel}>平均拖延(天)</Text>
          </View>
        </View>

        {weeklyReview.mostDelayedType && (
          <View className={styles.delayedTypeCard}>
            <View className={styles.delayedTypeIcon}>
              <Text>{typeIcons[weeklyReview.mostDelayedType].icon}</Text>
            </View>
            <View className={styles.delayedTypeInfo}>
              <Text className={styles.delayedTypeLabel}>⚠️ 最常拖延的任务类型</Text>
              <Text className={styles.delayedTypeName}>{TaskTypeLabel[weeklyReview.mostDelayedType]}</Text>
            </View>
          </View>
        )}

        <Text className={styles.chartTitle}>各类型表现</Text>
        <View className={styles.reviewTypeGrid}>
          {(Object.keys(TaskTypeLabel) as TaskType[]).map(type => {
            const stats = weeklyReview.tasksByType[type];
            const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            return (
              <View key={type} className={styles.reviewTypeItem}>
                <View className={styles.reviewTypeHeader}>
                  <View
                    className={styles.reviewTypeIcon}
                    style={{ backgroundColor: typeIcons[type].bg }}
                  >
                    <Text>{typeIcons[type].icon}</Text>
                  </View>
                  <Text className={styles.reviewTypeName}>{TaskTypeLabel[type]}</Text>
                </View>
                <View className={styles.reviewTypeStats}>
                  <View className={styles.reviewTypeStat}>
                    <Text className={classnames(styles.reviewTypeStatNum, styles.statNumBlue)}>{stats.total}</Text>
                    <Text className={styles.reviewTypeStatLabel}>总数</Text>
                  </View>
                  <View className={styles.reviewTypeStat}>
                    <Text className={classnames(styles.reviewTypeStatNum, styles.statNumGreen)}>{stats.completed}</Text>
                    <Text className={styles.reviewTypeStatLabel}>完成</Text>
                  </View>
                  <View className={styles.reviewTypeStat}>
                    <Text className={classnames(styles.reviewTypeStatNum, styles.statNumRed)}>{stats.overdue}</Text>
                    <Text className={styles.reviewTypeStatLabel}>逾期</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView
      className={styles.statisticsPage}
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={onRefresh}
    >
      <View className={styles.content}>
        <View className={styles.tabs}>
          <Text
            className={classnames(styles.tabItem, activeTab === 'overview' && styles.active)}
            onClick={() => setActiveTab('overview')}
          >
            📊 总览
          </Text>
          <Text
            className={classnames(styles.tabItem, activeTab === 'review' && styles.active)}
            onClick={() => setActiveTab('review')}
          >
            📈 周复盘
          </Text>
          <Text
            className={classnames(styles.tabItem, activeTab === 'history' && styles.active)}
            onClick={() => setActiveTab('history')}
          >
            📋 历史
          </Text>
        </View>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'review' && renderReview()}
        {activeTab === 'history' && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text>历史记录</Text>
            </View>
            {recentHistory.length === 0 ? (
              <EmptyState
                title="暂无历史记录"
                description="完成一些养护任务后就会有记录啦"
                icon="📊"
              />
            ) : (
              <View className={styles.historyList}>
                {recentHistory.map(item => (
                  <View key={item.id} className={styles.historyItem}>
                    {item.type === 'record' && item.image ? (
                      <Image
                        className={styles.historyImage}
                        src={item.image}
                        mode="aspectFill"
                        onClick={() => {
                          Taro.previewImage({
                            urls: [item.image!],
                            current: item.image
                          });
                        }}
                      />
                    ) : (
                      <View
                        className={styles.historyIcon}
                        style={{
                          backgroundColor: item.type === 'task' && item.taskType
                            ? `${TaskTypeColor[item.taskType]}20`
                            : '#ECFDF5'
                        }}
                      >
                        <Text>
                          {item.type === 'task' && item.taskType ? typeIcons[item.taskType].icon : '📷'}
                        </Text>
                      </View>
                    )}
                    <View className={styles.historyInfo}>
                      <Text className={styles.historyTitle}>{item.title}</Text>
                      <Text className={styles.historyDate}>{item.date}</Text>
                    </View>
                    {item.type === 'task' && (
                      <Text className={classnames(
                        styles.historyStatus,
                        item.status === 'completed' && styles.statusCompleted,
                        item.status === 'pending' && styles.statusPending,
                        item.status === 'due' && styles.statusDue,
                        item.status === 'overdue' && styles.statusOverdue
                      )}>
                        {item.status === 'completed' ? '已完成' :
                         item.status === 'overdue' ? '❗逾期' :
                         item.status === 'due' ? '⏰到期' : '待处理'}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {showExportModal && (
        <View className={styles.modalOverlay} onClick={() => setShowExportModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>📤 导出养护清单</Text>
              <Text className={styles.modalClose} onClick={() => setShowExportModal(false)}>✕</Text>
            </View>
            
            <View className={styles.modalBody}>
              <View className={styles.modalSubtitle}>
                <Text>清单将包含：</Text>
              </View>
              <View className={styles.modalFeatures}>
                <View className={styles.featureItem}>
                  <Text className={styles.featureIcon}>✅</Text>
                  <Text className={styles.featureText}>最新保存的所有数据</Text>
                </View>
                <View className={styles.featureItem}>
                  <Text className={styles.featureIcon}>⏰</Text>
                  <Text className={styles.featureText}>任务到期/逾期状态标记</Text>
                </View>
                <View className={styles.featureItem}>
                  <Text className={styles.featureIcon}>📝</Text>
                  <Text className={styles.featureText}>待办+已完成任务+养护记录</Text>
                </View>
                <View className={styles.featureItem}>
                  <Text className={styles.featureIcon}>📋</Text>
                  <Text className={styles.featureText}>复制到剪贴板可直接分享</Text>
                </View>
              </View>

              <View className={styles.exportOptions}>
                <Text className={styles.exportOptionsTitle}>选择导出范围：</Text>
                
                <View
                  className={classnames(styles.exportOption, selectedPlant === 'all' && styles.exportOptionDisabled)}
                  onClick={() => selectedPlant !== 'all' && confirmExport('current')}
                >
                  <View className={styles.exportOptionLeft}>
                    <Text className={styles.exportOptionIcon}>🎯</Text>
                    <View>
                      <Text className={styles.exportOptionName}>
                        {selectedPlantInfo ? `仅 ${selectedPlantInfo.name}` : '选择某盆植物'}
                      </Text>
                      <Text className={styles.exportOptionDesc}>
                        {selectedPlantInfo 
                          ? `只包含 ${selectedPlantInfo.name} 的档案、待办、已完成任务和记录`
                          : '请先在下方选择一盆植物'}
                      </Text>
                    </View>
                  </View>
                  <Text className={classnames(
                    styles.exportOptionBadge,
                    selectedPlant === 'all' && styles.badgeDisabled
                  )}>
                    {selectedPlant === 'all' ? '请先选择' : '导出'}
                  </Text>
                </View>

                <View
                  className={styles.exportOption}
                  onClick={() => confirmExport('all')}
                >
                  <View className={styles.exportOptionLeft}>
                    <Text className={styles.exportOptionIcon}>🌿</Text>
                    <View>
                      <Text className={styles.exportOptionName}>全部植物</Text>
                      <Text className={styles.exportOptionDesc}>
                        包含所有 {plants.length} 盆植物的完整养护清单
                      </Text>
                    </View>
                  </View>
                  <Text className={styles.exportOptionBadge}>完整导出</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {showAssignmentModal && (
        <View className={styles.modalOverlay} onClick={() => setShowAssignmentModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>📋 生成分工单</Text>
              <Text className={styles.modalClose} onClick={() => setShowAssignmentModal(false)}>✕</Text>
            </View>
            
            <View className={styles.modalBody}>
              <View className={styles.assignmentModalSection}>
                <View className={styles.selectAllRow}>
                  <Text className={styles.assignmentSectionTitle}>选择植物</Text>
                  <Button className={styles.selectAllBtn} onClick={selectAllPlants}>
                    {selectedPlantIds.length === plants.length ? '取消全选' : '全选'}
                  </Button>
                </View>
                <View className={styles.checkboxGroup}>
                  {plants.map(plant => (
                    <View
                      key={plant.id}
                      className={classnames(styles.checkboxItem, selectedPlantIds.includes(plant.id) && styles.checked)}
                      onClick={() => togglePlantSelection(plant.id)}
                    >
                      <View className={styles.checkboxBox}>
                        {selectedPlantIds.includes(plant.id) && '✓'}
                      </View>
                      <View className={styles.checkboxContent}>
                        <Text className={styles.checkboxLabel}>{plant.name}</Text>
                        <Text className={styles.checkboxSubLabel}>{plant.species} · {plant.location}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.assignmentModalSection}>
                <View className={styles.selectAllRow}>
                  <Text className={styles.assignmentSectionTitle}>选择任务类型</Text>
                  <Button className={styles.selectAllBtn} onClick={selectAllTypes}>
                    {selectedTaskTypes.length === 4 ? '取消全选' : '全选'}
                  </Button>
                </View>
                <View className={styles.checkboxGroup}>
                  {(Object.keys(TaskTypeLabel) as TaskType[]).map(type => (
                    <View
                      key={type}
                      className={classnames(styles.checkboxItem, selectedTaskTypes.includes(type) && styles.checked)}
                      onClick={() => toggleTypeSelection(type)}
                    >
                      <View className={styles.checkboxBox}>
                        {selectedTaskTypes.includes(type) && '✓'}
                      </View>
                      <View className={styles.checkboxContent}>
                        <Text className={styles.checkboxLabel}>
                          {typeIcons[type].icon} {TaskTypeLabel[type]}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.assignmentModalSection}>
                <Text className={styles.assignmentSectionTitle}>分配负责人</Text>
                <View className={styles.assigneeInput}>
                  <Text className={styles.assigneeLabel}>默认负责人</Text>
                  <Input
                    className={styles.assigneeInputField}
                    placeholder="输入默认负责人名称"
                    value={defaultAssignee}
                    onInput={(e) => setDefaultAssignee(e.detail.value)}
                  />
                </View>
                <View className={styles.quickAssignees}>
                  {['爸爸', '妈妈', '爷爷', '奶奶', '我', '家人'].map(name => (
                    <Text
                      key={name}
                      className={styles.quickAssigneeChip}
                      onClick={() => setDefaultAssignee(name)}
                    >
                      {name}
                    </Text>
                  ))}
                </View>
              </View>

              <Button
                className={styles.generateBtn}
                onClick={handleGenerateAssignment}
                disabled={selectedPlantIds.length === 0 && selectedTaskTypes.length === 0 && plants.length === 0}
              >
                生成分工单并复制 📋
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default StatisticsPage;
