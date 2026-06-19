import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { getMonthDays, isSameDay, isToday, formatDate } from '@/utils/date';
import { TaskTypeColor } from '@/types';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate = new Date(), onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const getTasksByDate = useAppStore((state) => state.getTasksByDate);
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
  };

  const getTaskIndicators = (date: Date) => {
    const dateStr = formatDate(date);
    const tasks = getTasksByDate(dateStr);
    const types = [...new Set(tasks.map(t => t.type))];
    return types.slice(0, 3);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  return (
    <View className={styles.calendar}>
      <View className={styles.calendarHeader}>
        <Text className={styles.navBtn} onClick={handlePrevMonth}>‹</Text>
        <Text className={styles.monthTitle}>{year}年{month + 1}月</Text>
        <Text className={styles.navBtn} onClick={handleNextMonth}>›</Text>
      </View>
      
      <View className={styles.weekDayRow}>
        {weekDays.map((day, index) => (
          <Text key={index} className={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View className={styles.daysGrid}>
        {days.map((date, index) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          const isCurMonth = isCurrentMonth(date);
          const indicators = getTaskIndicators(date);

          return (
            <View
              key={index}
              className={classnames(
                styles.dayCell,
                !isCurMonth && styles.otherMonth,
                isSelected && styles.selected,
                isTodayDate && styles.today
              )}
              onClick={() => handleDateClick(date)}
            >
              <Text className={styles.dayNumber}>{date.getDate()}</Text>
              {indicators.length > 0 && (
                <View className={styles.indicators}>
                  {indicators.map((type, i) => (
                    <View
                      key={i}
                      className={styles.indicator}
                      style={{ backgroundColor: TaskTypeColor[type] }}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default Calendar;
