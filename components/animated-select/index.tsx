"use client"
import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import clsx from "clsx"

interface AnimatedSelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
}

export function AnimatedSelect({
  value,
  onChange,
  options,
  placeholder = "请选择...",
  className,
}: AnimatedSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const selected = options.find((option) => option === value)
    setSelectedLabel(selected || "")
  }, [value, options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const openDropdown = () => {
    if (isOpen) return

    setIsOpen(true)

    // 箭头旋转动画
    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        rotation: 180,
        duration: 0.3,
        ease: "power2.out",
      })
    }

    // 下拉框弹出动画
    if (optionsRef.current) {
      gsap.fromTo(
        optionsRef.current,
        {
          opacity: 0,
          y: -10,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)",
        },
      )
    }
  }

  const closeDropdown = () => {
    if (!isOpen) return

    // 箭头复位动画
    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      })
    }

    // 下拉框收起动画
    if (optionsRef.current) {
      gsap.to(optionsRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => setIsOpen(false),
      })
    } else {
      setIsOpen(false)
    }
  }

  const handleOptionClick = (option: string) => {
    onChange(option)
    closeDropdown()
  }

  return (
    <div ref={dropdownRef} className={clsx("relative z-[9998]", className)}>
      {/* 选择框 */}
      <button
        type="button"
        onClick={isOpen ? closeDropdown : openDropdown}
        className={clsx(
          "w-full px-4 py-4 bg-white dark:bg-slate-1 border border-slate-4 rounded-xl text-slate-12",
          "transition-all duration-200 shadow-sm cursor-pointer text-left",
          "hover:border-slate-6 hover:shadow-md",
          "focus:outline-none",
          isOpen && "border-slate-8 shadow-lg",
          "pr-12", // 为箭头留出空间
        )}
      >
        <span className={clsx(selectedLabel ? "text-slate-12" : "text-slate-9")}>{selectedLabel || placeholder}</span>
      </button>

      {/* 箭头图标 */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <svg ref={arrowRef} className="w-5 h-5 text-slate-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* 下拉选项 */}
      {isOpen && (
        <div
          ref={optionsRef}
          className={clsx(
            "absolute top-full left-0 right-0 mt-2 z-[9999]",
            "bg-white dark:bg-slate-1 border border-slate-4 rounded-xl shadow-xl",
            "backdrop-blur-xl bg-white/95 dark:bg-slate-1/95",
            "max-h-60 overflow-y-auto",
          )}
          style={{ opacity: 0 }}
        >
          <div className="py-2">
            {options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => handleOptionClick(option)}
                className={clsx(
                  "w-full px-4 py-3 text-left text-sm transition-all duration-150",
                  "hover:bg-slate-2 dark:hover:bg-slate-3/50",
                  "focus:outline-none focus:bg-slate-2 dark:focus:bg-slate-3/50",
                  value === option
                    ? "text-slate-12 bg-slate-2 dark:bg-slate-3/30 font-medium"
                    : "text-slate-11 hover:text-slate-12",
                  index === 0 && "rounded-t-xl",
                  index === options.length - 1 && "rounded-b-xl",
                )}
                style={{
                  animationDelay: `${index * 30}ms`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {value === option && (
                    <svg className="w-4 h-4 text-slate-12" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
