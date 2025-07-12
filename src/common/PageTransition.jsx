"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function PageTransition() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1600); // مدة الانيميشن
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className="page-transition-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9999,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#8b0000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {/* الباك جراوند بتنقسم */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="bg-left"
            style={{
              position: "absolute",
              left: 0,
              width: "50%",
              height: "100%",
              backgroundColor: "#000",
              zIndex: 1,
            }}
          />
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "100%" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="bg-right"
            style={{
              position: "absolute",
              right: 0,
              width: "50%",
              height: "100%",
              backgroundColor: "#000",
              zIndex: 1,
            }}
          />

          {/* اللوجو */}
          <motion.div
            initial={{ rotate: 180, scale: 1 }}
            animate={{ rotate: 0, scale: 1.2 }}
            exit={{ scale: 0 }}
            transition={{ duration: 1 }}
            style={{ zIndex: 2 }}
          >
            <Image src="/images/logo.png" alt="Logo" width={100} height={100} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
