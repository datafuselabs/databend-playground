export const pow1024 = (num: number): number => {
  return Math.pow(1024, num)
}
export const filterSize = (size: number): string => {
  if (size <= 0) return '0b';
  if (!size) return '';
  if (size < pow1024(1)) return size + 'b';
  if (size < pow1024(2)) return (size / pow1024(1)).toFixed(2) + 'kb';
  if (size < pow1024(3)) return (size / pow1024(2)).toFixed(2) + 'mb';
  if (size < pow1024(4)) return (size / pow1024(3)).toFixed(2) + 'gb';
  return (size / pow1024(4)).toFixed(2) + 'tb'
}