/**
 * 利用 $prefs 进行数据初始化
 * @param key string 缓存 key
 * @param value string 缓存值
 * @returns string 缓存值
 */
export const cacheInit = (key: string, value?: string): { value: string; reset?: boolean } => {
  const res = $prefs.valueForKey(key) || '';
  if (value && value !== res) {
    $prefs.setValueForKey(value, key);
    return { value, reset: true };
  } else {
    return { value: res };
  }
};
