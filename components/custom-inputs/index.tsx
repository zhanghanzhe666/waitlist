"use client"
import { useRef } from "react"
import type React from "react"

import { gsap } from "gsap"
import clsx from "clsx"

interface CustomRadioProps {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function CustomRadio({ name, value, checked, onChange, children, className }: CustomRadioProps) {
  const radioRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    onChange(value)

    // 点击动画
    if (radioRef.current) {
      gsap.to(radioRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      })
    }
  }

  return (
    <label
      className={clsx(
        "flex items-center space-x-3 cursor-pointer group p-3 rounded-xl transition-all duration-200",
        "hover:bg-slate-2 dark:hover:bg-slate-3/50",
        checked && "bg-slate-2 dark:bg-slate-3/30",
        className,
      )}
      onClick={handleClick}
    >
      <div
        ref={radioRef}
        className={clsx(
          "relative w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
          checked ? "border-slate-12 bg-slate-12" : "border-slate-6 bg-transparent hover:border-slate-8",
        )}
      >
        <div
          className={clsx(
            "w-2 h-2 rounded-full bg-slate-1 transition-all duration-200",
            checked ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        />
      </div>
      <span className="text-sm text-slate-11 group-hover:text-slate-12 transition-colors duration-200">{children}</span>
    </label>
  )
}

interface CustomCheckboxProps {
  value: string
  checked: boolean
  onChange: (value: string, checked: boolean) => void
  children: React.ReactNode
  className?: string
}

export function CustomCheckbox({ value, checked, onChange, children, className }: CustomCheckboxProps) {
  const checkboxRef = useRef<HTMLDivElement>(null)
  const checkmarkRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    onChange(value, !checked)

    // 点击动画
    if (checkboxRef.current) {
      gsap.to(checkboxRef.current, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      })
    }

    // 选中状态动画
    if (checkmarkRef.current && !checked) {
      gsap.fromTo(
        checkmarkRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.3, ease: "back.out(1.7)" },
      )
    }
  }

  return (
    <label
      className={clsx(
        "flex items-center space-x-3 cursor-pointer group p-3 rounded-xl transition-all duration-200",
        "hover:bg-slate-2 dark:hover:bg-slate-3/50",
        checked && "bg-slate-2 dark:bg-slate-3/30",
        className,
      )}
      onClick={handleClick}
    >
      <div
        ref={checkboxRef}
        className={clsx(
          "relative w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center",
          checked ? "border-slate-12 bg-slate-12" : "border-slate-6 bg-transparent hover:border-slate-8",
        )}
      >
        {checked && (
          <div ref={checkmarkRef} className="text-slate-1 text-xs font-bold">
            ✓
          </div>
        )}
      </div>
      <span className="text-sm text-slate-11 group-hover:text-slate-12 transition-colors duration-200">{children}</span>
    </label>
  )
}
