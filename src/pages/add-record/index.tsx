import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { RecordType, RecordTypeLabel } from '@/types';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

const DEFAULT_HINT_IMAGE = 'https://picsum.photos/id/110/600/600';

const AddRecordPage: React.FC = () => {
  const router = useRouter();
  const addRecord = useAppStore((state) => state.addRecord);
  const saveImagePermanently = useAppStore((state) => state.saveImagePermanently);
  const plants = useAppStore((state) => state.plants);
  const getPlantById = useAppStore((state) => state.getPlantById);

  const urlPlantId = router.params.plantId as string;

  const [plantId, setPlantId] = useState<string>(urlPlantId || '');
  const [type, setType] = useState<RecordType>('growth');
  const [date, setDate] = useState<string>(formatDate(new Date()));
  const [image, setImage] = useState<string>('');
  const [hasRealImage, setHasRealImage] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [treatment, setTreatment] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

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

  const handleChooseImage = async (source: 'camera' | 'album') => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sourceType: source === 'camera' ? ['camera'] : ['album'],
        sizeType: ['compressed'],
      });

      if (res.tempFiles && res.tempFiles.length > 0) {
        const tempPath = res.tempFiles[0].path || (res.tempFilePaths && res.tempFilePaths[0]);
        if (tempPath) {
          setImage(tempPath);
          setHasRealImage(true);
          Taro.showToast({ title: '已选择照片', icon: 'success' });
          console.log('[Record] Image selected from', source, ':', tempPath);
        }
      }
    } catch (err: any) {
      console.error('[Record] Failed to choose image:', err);
      if (err.errMsg && err.errMsg.includes('cancel')) {
        return;
      }
      Taro.showToast({ title: '选择照片失败，请重试', icon: 'none' });
    }
  };

  const handlePreviewImage = () => {
    if (!image) return;
    Taro.previewImage({
      urls: [image],
      current: image
    });
  };

  const handleRemoveImage = () => {
    setImage('');
    setHasRealImage(false);
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    
    if (!plantId) {
      Taro.showToast({ title: '请选择植物', icon: 'none' });
      return;
    }
    if (!image) {
      Taro.showToast({ title: '请选择或拍摄照片', icon: 'none' });
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

    setIsSaving(true);
    Taro.showLoading({ title: '保存中...', mask: true });

    try {
      console.log('[Record] Saving image permanently, temp path:', image.substring(0, 60));
      const permanentImagePath = await saveImagePermanently(image);
      console.log('[Record] Image saved permanently:', permanentImagePath.substring(0, 60));

      addRecord({
        plantId,
        plantName: plant.name,
        type,
        date,
        image: permanentImagePath,
        notes: notes.trim() || undefined,
        treatment: treatment.trim() || undefined
      });

      console.log('[Record] New record saved with permanent image:', {
        plant: plant.name,
        type: RecordTypeLabel[type],
        date,
        hasRealImage
      });

      Taro.hideLoading();
      Taro.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } catch (err) {
      console.error('[Record] Save failed:', err);
      Taro.hideLoading();
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' });
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = plantId && image;
  const showTreatment = type === 'pest' || type === 'leaf';
  const displayImage = image || DEFAULT_HINT_IMAGE;

  return (
    <View className={styles.page}>
      <View className={styles.content}>
        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            记录照片<Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.imageSection}>
            <View
              className={classnames(styles.imagePreview, !hasRealImage && styles.imagePreviewHint)}
              onClick={handlePreviewImage}
            >
              <Image className={styles.previewImage} src={displayImage} mode="aspectFill" />
              {!hasRealImage && (
                <View className={styles.imageHintOverlay}>
                  <Text className={styles.imageHintIcon}>📷</Text>
                  <Text className={styles.imageHintText}>请拍摄或选择植物照片</Text>
                </View>
              )}
              {hasRealImage && (
                <View className={styles.imageBadge}>
                  <Text className={styles.imageBadgeText}>✓ 已选择</Text>
                </View>
              )}
            </View>
            <View className={styles.imageBtnRow}>
              <Button
                className={classnames(styles.imageBtn, styles.imageBtnPrimary)}
                onClick={() => handleChooseImage('camera')}
              >
                📷 拍照
              </Button>
              <Button
                className={styles.imageBtn}
                onClick={() => handleChooseImage('album')}
              >
                🖼 相册
              </Button>
              {hasRealImage && (
                <Button
                  className={classnames(styles.imageBtn, styles.imageBtnDanger)}
                  onClick={handleRemoveImage}
                >
                  ❌ 移除
                </Button>
              )}
            </View>
            <Text className={styles.hint}>
              建议：近距离拍摄清晰的叶片和整体照片，便于后续对比生长变化
            </Text>
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
              ? '记录一下植物的生长变化，例如：新长了3片叶子，长出花苞等...'
              : '请详细描述发现的问题，例如：叶片发黄、有虫洞、有白粉等...'}
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
            maxlength={500}
            autoHeight
          />
        </View>

        {showTreatment && (
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>处理措施</Text>
            <Textarea
              className={styles.formTextarea}
              placeholder="记录已采取或计划采取的处理措施，例如：喷洒多菌灵稀释液、移到通风处、减少浇水频率、摘除病叶等..."
              value={treatment}
              onInput={(e) => setTreatment(e.detail.value)}
              maxlength={500}
              autoHeight
            />
            <Text className={styles.hint}>
              完整的处理记录有助于后续判断处理措施是否有效
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
