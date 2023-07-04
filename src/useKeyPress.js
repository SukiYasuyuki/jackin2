import { useEffect, useRef } from "react";

const useKeyPress = (targetKey, fn) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = fn;
  }, [fn]);

  useEffect(() => {
    function downHandler({ key }) {
      if (Array.isArray(targetKey)) {
        if (targetKey.includes(key)) {
          savedCallback.current();
        }
      } else {
        if (key === targetKey) {
          savedCallback.current();
        }
      }
    }
    window.addEventListener("keydown", downHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  }, []);
};

export function useNext(fn) {
  useKeyPress(["ArrowDown", "PageDown"], fn);
}

export function usePrev(fn) {
  useKeyPress(["ArrowUp", "PageUp"], fn);
}

export default useKeyPress;
