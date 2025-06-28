"use client"
import { useRef, useEffect, useState } from "react"
import type React from "react"

import { gsap } from "gsap"
import type { JSX } from "react"

interface AnimatedTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  stagger?: boolean
  once?: boolean // 只执行一次动画
}

export function AnimatedText({
  children,
  className,
  delay = 0,
  direction = "up",
  stagger = false,
  once = true,
}: AnimatedTextProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (textRef.current && (!once || !hasAnimated)) {
      const element = textRef.current

      if (stagger && typeof children === "string") {
        // 为每个字符添加动画
        const chars = children
          .split("")
          .map((char, index) => `<span style="display: inline-block;">${char === " " ? "&nbsp;" : char}</span>`)
          .join("")

        element.innerHTML = chars

        const charElements = element.querySelectorAll("span")

        gsap.fromTo(
          charElements,
          {
            opacity: 0,
            y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
            x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.03,
            delay,
          },
        )
      } else {
        // 整体动画
        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
            x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
            delay,
          },
        )
      }

      if (once) {
        setHasAnimated(true)
      }
    }
  }, [children, delay, direction, stagger, once, hasAnimated])

  return (
    <div ref={textRef} className={className}>
      {!stagger && children}
    </div>
  )
}

interface AnimatedHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  className?: string
  delay?: number
  once?: boolean
}

export function AnimatedHeading({ level, children, className, delay = 0, once = true }: AnimatedHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <Tag className={className}>
      <AnimatedText delay={delay} stagger={true} once={once}>
        {children}
      </AnimatedText>
    </Tag>
  )
}
