import React, { useEffect, useRef } from "react";

function usePoller(callback, delay) {
  const ref = useRef();
  // 先将callback缓存起来
  useEffect(() => {
    console.log("重新声明");
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      ref.current && ref.current();
    }
    let id = setInterval(tick, delay);
    return () => {
      console.log("clearInterval...");
      clearInterval(id);
    };
  }, [delay]);

  useEffect(() => {
    callback();
    // eslint-disable-next-line
  }, []);
}

export default usePoller;
