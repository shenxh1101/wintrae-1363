import React, { useState } from 'react';
import { View, Text, Input, Textarea, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { LightLevel } from '@/types';
import { formatDate } from '@/utils/date';
import styles from './index.module.scss';

const AddPlantPage: React.FC = () => {
  const addPlant = useAppStore((state) => state.addPlant);
  
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');
  const [lightLevel, setLightLevel] = useState<LightLevel>('partial');
  const [repotDate, setRepotDate] = useState(formatDate(new Date()));
  const [notes, setNotes] = useState('');
  const [avatar, setAvatar] = useState('https://picsum.photos/id/116/300/300');

  const lightOptions: { value: LightLevel; label: string }[] = [
    { value: 'full', label: '全日照' },
    { value: 'partial', label: '半日照' },
    { value: 'shade', label: '耐阴' }
  ];

  const locationSuggestions = ['客厅阳台', '书房窗台', '卧室飘窗', '厨房窗台', '玄关', '小院围栏', '露台', '卫生间'];

  const speciesSuggestions = ['绿萝', '多肉', '发财树', '薄荷', '月季', '吊兰', '仙人掌', '龟背竹', '虎皮兰', '茉莉花'];

  const handleChooseAvatar = () => {
    const randomId = 110 + Math.floor(Math.random() * 10);
    setAvatar(`https://picsum.photos/id/${randomId}/300/300`);
    Taro.showToast({ title: '已更换图片', icon: 'none' });
  };

  const handleDateChange = (e: any) => {
    setRepotDate(e.detail.value);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入植物名称', icon: 'none' });
      return;
    }
    if (!species.trim()) {
      Taro.showToast({ title: '请输入植物品种', icon: 'none' });
      return;
    }
    if (!location.trim()) {
      Taro.showToast({ title: '请输入摆放位置', icon: 'none' });
      return;
    }

    addPlant({
      name: name.trim(),
      species: species.trim(),
      location: location.trim(),
      lightLevel,
      repotDate,
      avatar,
      notes: notes.trim() || undefined
    });

    console.log('[Plant] New plant added:', name);
    
    Taro.showToast({ title: '添加成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  return (
    <View className={styles.page}>
      <View className={styles.content}>
        <View className={styles.avatarSection}>
          <View className={styles.avatarPreview}>
            <Image className={styles.avatarImage} src={avatar} mode="aspectFill" />
          </View>
          <Button className={styles.avatarBtn} onClick={handleChooseAvatar}>
            🔄 换一张图片
          </Button>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            植物名称<Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={styles.formInput}
            placeholder="给你的植物起个名字"
            value={name}
            onInput={(e) => setName(e.detail.value)}
            maxlength={20}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            植物品种<Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={styles.formInput}
            placeholder="如：绿萝、多肉、月季等"
            value={species}
            onInput={(e) => setSpecies(e.detail.value)}
            maxlength={30}
          />
          <View className={styles.optionsRow} style={{ marginTop: '16rpx' }}>
            {speciesSuggestions.map(s => (
              <Text
                key={s}
                className={classnames(styles.optionItem, species === s && styles.active)}
                onClick={() => setSpecies(s)}
              >
                {s}
              </Text>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            摆放位置<Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={styles.formInput}
            placeholder="如：客厅阳台、书房窗台等"
            value={location}
            onInput={(e) => setLocation(e.detail.value)}
            maxlength={30}
          />
          <View className={styles.optionsRow} style={{ marginTop: '16rpx' }}>
            {locationSuggestions.map(l => (
              <Text
                key={l}
                className={classnames(styles.optionItem, location === l && styles.active)}
                onClick={() => setLocation(l)}
              >
                {l}
              </Text>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            光照需求<Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.optionsRow}>
            {lightOptions.map(opt => (
              <Text
                key={opt.value}
                className={classnames(styles.optionItem, lightLevel === opt.value && styles.active)}
                onClick={() => setLightLevel(opt.value)}
              >
                {opt.label}
              </Text>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.formLabel}>
            换盆日期<Text className={styles.required}>*</Text>
          </Text>
          <Input
            type="date"
            className={styles.formInput}
            value={repotDate}
            onChange={handleDateChange}
          />
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
        disabled={!name.trim() || !species.trim() || !location.trim()}
      >
        保存植物
      </Button>
    </View>
  );
};

export default AddPlantPage;
