import { useEffect, useState } from "react";

interface IMouse {
  x: number,
  y: number
}
export const useMousePosition = (): IMouse => {
  const [position, setPosition] = useState<IMouse>({ x: 0, y: 0 });

  useEffect(() => {
    const setFromEvent = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", setFromEvent);

    return () => {
      window.removeEventListener("mousemove", setFromEvent);
    };
  }, []);

  return position;
};
