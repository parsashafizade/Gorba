export type LocalDay = { id: string; date: Date };

export const generateLocalDays = (count = 14, start = new Date()): LocalDay[] => {
  const year = start.getFullYear();
  const month = start.getMonth();
  const date = start.getDate();
  return Array.from({ length: count }, (_, index) => {
    const localDate = new Date(year, month, date + index, 12, 0, 0, 0);
    const id = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
    return { id, date: localDate };
  });
};

export const hourlyTimes = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, '0')}:00`,
);

export const dateFromId = (id: string) => {
  const [year, month, day] = id.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};
