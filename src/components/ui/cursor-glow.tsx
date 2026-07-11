"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export const CursorGlow = () => {
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Multiple springs with different physical properties to create the trail lag
  const trail1X = useSpring(cursorX, { damping: 20, stiffness: 300, mass: 0.5 });
  const trail1Y = useSpring(cursorY, { damping: 20, stiffness: 300, mass: 0.5 });

  const trail2X = useSpring(cursorX, { damping: 25, stiffness: 200, mass: 0.8 });
  const trail2Y = useSpring(cursorY, { damping: 25, stiffness: 200, mass: 0.8 });

  const trail3X = useSpring(cursorX, { damping: 30, stiffness: 150, mass: 1.2 });
  const trail3Y = useSpring(cursorY, { damping: 30, stiffness: 150, mass: 1.2 });

  const trail4X = useSpring(cursorX, { damping: 40, stiffness: 100, mass: 1.5 });
  const trail4Y = useSpring(cursorY, { damping: 40, stiffness: 100, mass: 1.5 });

  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia("(hover: none)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.3s ease" }}
    >
      <motion.div
        className="absolute w-3 h-3 bg-red-500 rounded-full mix-blend-screen"
        style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        className="absolute w-2.5 h-2.5 bg-red-500/80 rounded-full mix-blend-screen shadow-[0_0_8px_rgba(239,68,68,0.8)]"
        style={{ x: trail1X, y: trail1Y, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        className="absolute w-2 h-2 bg-red-500/60 rounded-full mix-blend-screen shadow-[0_0_8px_rgba(239,68,68,0.6)]"
        style={{ x: trail2X, y: trail2Y, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        className="absolute w-1.5 h-1.5 bg-red-500/40 rounded-full mix-blend-screen"
        style={{ x: trail3X, y: trail3Y, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        className="absolute w-1 h-1 bg-red-500/20 rounded-full mix-blend-screen"
        style={{ x: trail4X, y: trail4Y, translateX: "-50%", translateY: "-50%" }}
      />
    </div>
  );
};
