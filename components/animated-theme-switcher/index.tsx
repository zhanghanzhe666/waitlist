"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import clsx from "clsx"
import { AnimatedText } from "@/components/animated-text"

const options = [
  {
    value: "dark",
    label: "深色",
    icon: "🌙", // 月亮图标代表深色模式
    iconClass: "text-slate-12",
  },
  {
    value: "system",
    label: "跟随系统",
    icon: "💻", // 电脑图标代表跟随系统
    iconClass: "text-slate-10",
  },
  {
    value: "light",
    label: "浅色",
    icon: "☀️", // 太阳图标代表浅色模式
    iconClass: "text-slate-8",
  },
] as const

export function AnimatedThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && indicatorRef.current && theme) {
      const activeIndex = options.findIndex((option) => option.value === theme)
      if (activeIndex !== -1 && buttonsRef.current[activeIndex]) {
        const activeButton = buttonsRef.current[activeIndex]
        const containerRect = containerRef.current?.getBoundingClientRect()
        const buttonRect = activeButton?.getBoundingClientRect()

        if (containerRect && buttonRect) {
          const offsetLeft = buttonRect.left - containerRect.left

          gsap.to(indicatorRef.current, {
            x: offsetLeft,
            width: buttonRect.width,
            duration: 0.4,
            ease: "power2.out",
          })
        }
      }
    }
  }, [theme, mounted])

  const handleThemeChange = (newTheme: string) => {
    const activeIndex = options.findIndex((option) => option.value === newTheme)
    if (buttonsRef.current[activeIndex]) {
      // 点击动画
      gsap.to(buttonsRef.current[activeIndex], {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      })

      // 图标变化动画
      const icon = buttonsRef.current[activeIndex]?.querySelector(".theme-icon")
      if (icon) {
        gsap.to(icon, {
          scale: 1.2,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        })
      }
    }

    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <div className={clsx(className, "flex gap-1 opacity-0")}>
        {options.map((option, i) => (
          <React.Fragment key={option.value}>
            <button className="text-xs px-3 py-1">
              <span>{option.label}</span>
            </button>
            {i < options.length - 1 && <span className="text-xs">/</span>}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={clsx(className, "relative flex bg-slate-3/30 backdrop-blur-sm rounded-xl p-1 border border-slate-6")}
    >
      {/* 动画指示器 */}
      <div
        ref={indicatorRef}
        className="absolute top-1 bottom-1 bg-slate-12 rounded-lg shadow-lg transition-all duration-300 ease-out"
        style={{ left: 0, width: 0 }}
      />

      {/* 按钮 */}
      {options.map((option, i) => (
        <button
          key={option.value}
          ref={(el) => (buttonsRef.current[i] = el)}
          className={clsx(
            "relative z-10 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200",
            "flex items-center gap-1.5 min-w-[70px] justify-center",
            theme === option.value ? "text-slate-1" : "text-slate-10 hover:text-slate-12",
          )}
          onClick={() => handleThemeChange(option.value)}
        >
          <span className={clsx("text-sm theme-icon font-bold", option.iconClass)}>{option.icon}</span>
          <AnimatedText>
            <span>{option.label}</span>
          </AnimatedText>
        </button>
      ))}
    </div>
  )
}
