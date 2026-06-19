export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

export const getWeekDays = (date: Date = new Date()): Date[] => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const temp = new Date(monday);
    temp.setDate(monday.getDate() + i);
    weekDays.push(temp);
  }
  return weekDays;
};

export const getMonthDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days: Date[] = [];

  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(d);
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return formatDate(date, 'MM-DD');
};

export const getDayName = (date: Date): string => {
  const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return names[date.getDay()];
};

export const getWeekRange = (date: Date = new Date()): { start: Date; end: Date } => {
  const weekDays = getWeekDays(date);
  return {
    start: weekDays[0],
    end: weekDays[6]
  };
};

export const getPreviousWeekRange = (weeksAgo: number = 0, baseDate: Date = new Date()): { start: Date; end: Date } => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - weeksAgo * 7);
  return getWeekRange(d);
};

export const getRecentWeeks = (count: number = 4, baseDate: Date = new Date()): Array<{ start: Date; end: Date; label: string }> => {
  const weeks = [];
  const now = new Date(baseDate);
  
  for (let i = 0; i < count; i++) {
    const range = getPreviousWeekRange(i, now);
    const startStr = formatDate(range.start, 'MM/DD');
    const endStr = formatDate(range.end, 'MM/DD');
    let label = `${startStr} - ${endStr}`;
    if (i === 0) label += ' (本周)';
    else if (i === 1) label += ' (上周)';
    weeks.push({ ...range, label });
  }
  
  return weeks;
};

export const getDaysDiff = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : new Date(date1);
  const d2 = typeof date2 === 'string' ? new Date(date2) : new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
