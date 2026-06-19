import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { RecordType, RecordTypeLabel } from '@/types';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

const AddRecordPage: React.FC = () => {
  const router = useRouter();
  const addRecord = useAppStore((state) => state.addRecord);
  const plants = useAppStore((state) => state.plants);
  const getPlantById = useAppStore((state) => state.getPlantById);

  const urlPlantId = router.params.plantId as string;

  const [plantId, setPlantId] = useState<string>(urlPlantId || '');
  const [type, setType] = useState<RecordType>('growth');
  const [date, setDate] = useState<string>(formatDate(new Date()));
  const [image, setImage] = useState<string>('https://picsum.photos/id/120/600/600');
  const [notes, setNotes] = useState<string>('');
  const [treatment, setTreatment] = useState<string>('');

  useEffect(() => {
    if (urlPlantId) {
      const plant = getPlantById(urlPlantId);
      if (plant) {
        console.log('[Record] Pre-selected plant:', plant.name);
      }
    }
  }, [urlPlantId, getPlantById]);

  const typeOptions: { value: RecordType; label: string; icon: string }[] = [
    { value: 'growth', label: '生长记录', icon: '🌱' },
    { value: 'pest', label: '病虫害', icon: '🐛' },
    { value: 'leaf', label: '叶片异常', icon: '🍂' }
  ];

  const handleChangeImage = () => {
    const randomId = 110 + Math.floor(Math.random() * 15);
    setImage(`https://picsum.photos/id/${randomId}/600/600`);
    Taro.showToast({ title: '已更换图片', icon: 'none' });
  };

  const handleSubmit = () => {
    if (!plantId) {
      Taro.showToast({ title: '请选择植物', icon: 'none' });
      return;
    }
    if (!notes.trim() && type !== 'growth') {
      Taro.showToast({ title: '请填写情况说明', icon: 'none' });
      return;
    }

    const plant = getPlantById(plantId);
    if (!plant) {
      Taro.showToast({ title: '植物不存在', icon: 'none' });
      return;
    }

    addRecord({
      plantId,
      plantName: plant.name,
      type,
      date,
      image,
      notes: notes.trim() || undefined,
      treatment: treatment.trim() || undefined
    });

    console.log('[Record] New record added:', {
      plant: plant.name,
      type: RecordTypeLabel[type],
      date
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  const isFormValid = plantId && image;
  const showTreatment = type === 'pest' || type === 'leaf';

  return (
    <View className={styles.page}>
      <View className={styles.content}>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            记录照片<Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.imageSection}>
            <View className={styles.imagePreview}>
              <Image className={styles.previewImage} src={image} mode="aspectFill" />
            </View>
            <Button className={styles.imageBtn} onClick={handleChangeImage}>
              🔄 换一张图片
            </Button>
          </View>
        </View>

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
            记录类型<Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.typeOptions}>
            {typeOptions.map(opt => (
              <View
                key={opt.value}
                className={classnames(styles.typeOption, type === opt.value && styles.active)}
                onClick={() => setType(opt.value)}
              >
                <Text className={styles.typeIcon}>{opt.icon}</Text>
                <Text className={styles.typeName}>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            记录日期<Text className={styles.required}>*</Text>
          </Text>
          <Input
            type="date"
            className={styles.formInput}
            value={date}
            onChange={(e) => setDate(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            情况说明
            {type !== 'growth' && <Text className={styles.required}>*</Text>}
          </Text>
          <Textarea
            className={styles.formTextarea}
            placeholder={type === 'growth' 
              ? '记录一下植物的生长变化...' 
              : '请详细描述发现的问题...'}
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
            maxlength={200}
            autoHeight
          />
        </View>

        {showTreatment && (
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>处理措施</Text>
            <Textarea
              className={styles.formTextarea}
              placeholder="记录已采取或计划采取的处理措施..."
              value={treatment}
              onInput={(e) => setTreatment(e.detail.value)}
              maxlength={200}
              autoHeight
            />
            <Text className={styles.hint}>
              例如：喷洒多菌灵、移到通风处、减少浇水等
            </Text>
          </View>
        )}
      </View>

      <Button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={!isFormValid}
      >
        保存记录
      </Button>
    </View>
  );
};

export default AddRecordPage;
