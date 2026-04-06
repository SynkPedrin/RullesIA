"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

// ─── LANDO SCROLL REVEAL SECTION ───
export function LandoSection({ children, id, className }: { children: React.ReactNode; id?: string; className?: string }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  })

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [100, 0])

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ scale, opacity, y }}
      className={cn("relative z-10", className)}
    >
      {children}
    </motion.section>
  )
}

// ─── REVEAL COMPONENT ───
export function Reveal({ children, className, delay = 0, y = 80 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
