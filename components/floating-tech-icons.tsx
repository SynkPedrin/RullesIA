"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useMemo } from "react"
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Lock, 
  Cpu, 
  Globe, 
  Database, 
  Code2, 
  Terminal, 
  Activity 
} from "lucide-react"

const icons = [Cpu, Globe, Database, Code2, Terminal, Activity, Sparkles, Zap, Shield, Lock]

export function FloatingTechIcons() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const iconParticles = useMemo(() => {
    return icons.map((Icon, i) => ({
      Icon,
      id: i,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 5,
      scale: 0.8 + Math.random() * 0.6,
    }))
  }, [])

  const circleParticles = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      id: i,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: 10 + Math.random() * 20,
      size: 200 + Math.random() * 300,
    }))
  }, [])

  if (!mounted) return null
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <AnimatePresence>
        {iconParticles.map((p) => (
          <motion.div
            key={`icon-${p.id}`}
            initial={{ 
              x: `${p.initialX}vw`, 
              y: `${p.initialY}vh`,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              x: [
                `${p.initialX}vw`, 
                `${(p.initialX + 15) % 100}vw`, 
                `${(p.initialX - 15 + 100) % 100}vw`, 
                `${p.initialX}vw`
              ],
              y: [
                `${p.initialY}vh`, 
                `${(p.initialY - 20 + 100) % 100}vh`, 
                `${(p.initialY + 20) % 100}vh`, 
                `${p.initialY}vh`
              ],
              opacity: [0, 0.3, 0.4, 0.3, 0],
              scale: [p.scale * 0.5, p.scale, p.scale * 0.8, p.scale],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay
            }}
            className="absolute flex items-center justify-center"
          >
            <div className="p-3 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm">
              <p.Icon className="w-5 h-5 text-white/20" />
            </div>
          </motion.div>
        ))}

        {circleParticles.map((c) => (
          <motion.div
            key={`circle-${c.id}`}
            initial={{ 
              x: `${c.initialX}vw`, 
              y: `${c.initialY}vh`,
              opacity: 0 
            }}
            animate={{ 
              x: [
                `${c.initialX}vw`, 
                `${(c.initialX - 10 + 100) % 100}vw`, 
                `${c.initialX}vw`
              ],
              y: [
                `${c.initialY}vh`, 
                `${(c.initialY + 30) % 100}vh`, 
                `${c.initialY}vh`
              ],
              opacity: [0, 0.08, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: c.duration, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            style={{ 
              width: c.size, 
              height: c.size,
              filter: "blur(80px)"
            }}
            className="absolute rounded-full bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.03]"
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
