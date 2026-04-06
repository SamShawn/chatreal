/**
 * 格式化时间戳为相对时间
 * @param timestamp - Unix 时间戳
 * @returns 格式化后的时间字符串
 */
export const formatTime = (timestamp: number | undefined): string => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }

  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}天前`;
  }

  // 超过7天，显示具体日期
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}`;
};

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的大小字符串
 */
export const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * 生成随机颜色
 * @returns 随机颜色代码
 */
export const generateRandomColor = (): string => {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#30cfd0', '#330867',
  ];
  return colors[Math.floor(Math.random() * colors.length)] ?? colors[0];
};

/**
 * 检查是否为图片文件
 * @param fileName - 文件名
 * @returns 是否为图片
 */
export const isImageFile = (fileName: string | undefined): boolean => {
  if (!fileName) return false;

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = fileName.split('.').pop()?.toLowerCase();

  return extension ? imageExtensions.includes(extension) : false;
};

/**
 * 验证文件大小
 * @param fileSize - 文件大小（字节）
 * @param maxSize - 最大允许大小（字节），默认 10MB
 * @returns 是否在允许范围内
 */
export const validateFileSize = (fileSize: number, maxSize = 10 * 1024 * 1024): boolean => {
  return fileSize <= maxSize;
};

/**
 * 截断长文本
 * @param text - 原始文本
 * @param maxLength - 最大长度
 * @returns 截断后的文本
 */
export const truncateText = (text: string | undefined, maxLength = 50): string => {
  if (!text) return '';

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + '...';
};