import {useCallback, useState} from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Hook quản lý state được lưu trong localStorage
  const [state, setState] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    }
    return initialValue;
  });

  // Hàm cập nhật state và localStorage cùng lúc
  const setStateAndStorage = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(newValue);
    const valueToStore = newValue instanceof Function ? newValue(state) : newValue;
    localStorage.setItem(key, JSON.stringify(valueToStore));
  }, [key, state]);

  return [state, setStateAndStorage] as const;
}