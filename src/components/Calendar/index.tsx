import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { getMonthDays, isSameDay, isToday, formatDate } from '@/utils/date';
import { TaskTypeColor, Task } from '@/types';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

type DayStatus = 'none' | 'allDone' | 'pending' | 'due' | 'overdue';

const Calendar: React.FC<CalendarProps> = ({ selectedDate = new Date(), onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const getTasksByDate = useAppStore((state) => state.getTasksByDate);
  const isTaskDue = useAppStore((state) => state.isTaskDue);
  const isTaskOverdue = useAppStore((state) => state.isTaskOverdue);
  
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

  const getDayStatus = (date: Date): DayStatus => {
    const dateStr = formatDate(date);
    const tasks = getTasksByDate(dateStr);
    if (tasks.length === 0) return 'none';
    
    const hasOverdue = tasks.some(t => isTaskOverdue(t));
    if (hasOverdue) return 'overdue';
    
    const hasDue = tasks.some(t => isTaskDue(t));
    if (hasDue) return 'due';
    
    const allDone = tasks.every(t => t.completed);
    if (allDone) return 'allDone';
    
    return 'pending';
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

      <View className={styles.calendarLegend}>
        <View className={styles.legendDotRow}>
          <View className={classnames(styles.legendSquare, styles.legendOverdue)} />
          <Text className={styles.legendText}>逾期</Text>
        </View>
        <View className={styles.legendDotRow}>
          <View className={classnames(styles.legendSquare, styles.legendDue)} />
          <Text className={styles.legendText}>到期</Text>
        </View>
        <View className={styles.legendDotRow}>
          <View className={classnames(styles.legendSquare, styles.legendPending)} />
          <Text className={styles.legendText}>待办</Text>
        </View>
        <View className={styles.legendDotRow}>
          <View className={classnames(styles.legendSquare, styles.legendAllDone)} />
          <Text className={styles.legendText}>完成</Text>
        </View>
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
          const dayStatus = getDayStatus(date);

          return (
            <View
              key={index}
              className={classnames(
                styles.dayCell,
                !isCurMonth && styles.otherMonth,
                isSelected && styles.selected,
                isTodayDate && styles.today,
                !isSelected && dayStatus === 'overdue' && styles.hasOverdue,
                !isSelected && dayStatus === 'due' && styles.hasDue,
                !isSelected && dayStatus === 'allDone' && styles.allDone
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
              {dayStatus === 'overdue' && !isSelected && (
                <View className={styles.cornerBadge}>!</View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default Calendar;
