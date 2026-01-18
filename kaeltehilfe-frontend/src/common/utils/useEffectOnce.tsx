import React from "react";

export const useEffectOnce = (fn: () => void) => {
  const ref = React.useRef(true);
  React.useEffect(() => {
    if (ref.current) {
      fn();
      ref.current = false;
    }
    return () => {
      ref.current = false;
    };
  }, [fn]);
};

// export const useMemoOnce = <T,>(fn: () => T) => {
//   const [result, setResult] = React.useState<T>();
//   useEffectOnce(() => {
//     setResult(fn());
//   });

//   return result;
// };

// export const useMemoOnce = <T,>(fn: () => T) => {
//   const result = React.useRef<T>();

//   return React.useMemo(() => {
//     if (result.current) return result.current;
//     else {
//       result.current = fn();
//       return result.current;
//     }
//   }, []);
// };

export const useMemoOnce = <T,>(fn: () => T): T => {
  const result = React.useRef<T | null>(null);

  if (result.current === null) {
    result.current = fn();
  }

  return result.current;
};
