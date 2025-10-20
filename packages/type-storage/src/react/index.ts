import { useState, useEffect, useRef } from "react";

const STORAGE_CHANGE_EVENT = "local-storage-change";

export const dispatchStorageChange = (key: string) => {
  window.dispatchEvent(
    new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } })
  );
};

export const useLiveStorage = <T>(
  queryFn: () => { data: T; error: any; storageKey: string }
) => {
  const [state, setState] = useState(queryFn());

  const queryFnRef = useRef(queryFn);

  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      if (e instanceof StorageEvent) {
        if (e.key === state.storageKey) {
          const newValue = queryFnRef.current();
          if (diffQueryChanges(state.data, newValue.data)) {
            setState(queryFnRef.current());
          }
        }
        return;
      }

      if (e instanceof CustomEvent) {
        const changedKey = e.detail?.key;
        if (changedKey === state.storageKey) {
          const newValue = queryFnRef.current();
          if (diffQueryChanges(state.data, newValue.data)) {
            setState(queryFnRef.current());
          }
        }
        return;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, [queryFn]);

  return state;
};

const diffQueryChanges = <T>(oldData: T, newData: T) => {
  if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
    return true;
  }
  return false;
};
