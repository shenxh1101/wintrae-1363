import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { TaskType, TaskTypeLabel, TaskTypeColor } from '@/types';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

const AddTaskPage: React.FC = () => {
  const router = useRouter();
  const addTask = useAppStore((state) => state.addTask);
  const plants = useAppStore((state) => state.plants);
  const getPlantById = useAppStore((state) => state.getPlantById);

  const urlPlantId = router.params.plantId as string;
  const urlDate = router.params.date as string;

  const [plantId, setPlantId] = useState<string>(urlPlantId || '');
  const [type, setType] = useState<TaskType>('water');
  const [date, setDate] = useState<string>(urlDate || formatDate(new Date()));
  const [time, setTime] = useState<string>('09:00');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (urlPlantId) {
      const plant = getPlantById(urlPlantId);
      if (plant) {
        console.log('[Task] Pre-selected plant:', plant.name);
      }
    }
  }, [urlPlantId, getPlantById]);

  const typeOptions: { value: TaskType; label: string; icon: string }[] = [
    { value: 'water', label: '浇水', icon: '💧' },
    { value: 'fertilize', label: '施肥', icon: '🌱' },
    { value: 'prune', label: '修剪', icon: '✂️' },
    { value: 'pest', label: '驱虫', icon: '🐛' }
  ];

  const handleSubmit = () => {
    if (!plantId) {
      Taro.showToast({ title: '请选择植物', icon: 'none' });
      return;
    }

    const plant = getPlantById(plantId);
    if (!plant) {
      Taro.showToast({ title: '植物不存在', icon: 'none' });
      return;
    }

    addTask({
      plantId,
      plantName: plant.name,
      type,
      date,
      time,
      notes: notes.trim() || undefined
    });

    console.log('[Task] New task added:', {
      plant: plant.name,
      type: TaskTypeLabel[type],
      date,
      time
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  const isFormValid = plantId && date && time;

  return (
    <View className={styles.page}>
      <View className={styles.content}>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            选择植物<Text className={styles.required}>*</Text>
          </Text>
          <ScrollView scrollX className={styles.plantSelector}>
            {plants.map(plant => (
              <View
                key={plant.id}
                className={classnames(styles.plantChip, plantId === plant.id && styles.active)}
                onClick={() => setPlantId(plant.id)}
              >
                <Image className={styles.plantAvatar} src={plant.avatar} mode="aspectFill" />
                <Text className={styles.plantName}>{plant.name}</Text>
                <Text className={styles.plantSpecies}>{plant.species}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            任务类型<Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.typeOptions}>
            {typeOptions.map(opt => (
              <View
                key={opt.value}
                className={classnames(styles.typeOption, type === opt.value && styles.active)}
                onClick={() => setType(opt.value)}
                style={type === opt.value ? { backgroundColor: TaskTypeColor[opt.value] } : {}}
              >
                <Text className={styles.typeIcon}>{opt.icon}</Text>
                <Text className={styles.typeName}>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            任务时间<Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.inputRow}>
            <View className={styles.inputItem}>
              <Input
                type="date"
                className={styles.formInput}
                value={date}
                onChange={(e) => setDate(e.detail.value)}
              />
            </View>
            <View className={styles.inputItem}>
              <Input
                type="time"
                className={styles.formInput}
                value={time}
                onChange={(e) => setTime(e.detail.value)}
              />
            </View>
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>备注说明</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="记录一些养护注意事项..."
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
            maxlength={200}
            autoHeight
          />
        </View>
      </View>

      <Button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={!isFormValid}
      >
        保存任务
      </Button>
    </View>
  );
};

export default AddTaskPage;
