"use client"
import type React from "react"

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
  const handleClick = () => {
    onChange(value)
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
  const handleClick = () => {
    onChange(value, !checked)
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
        className={clsx(
          "relative w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center",
          checked ? "border-slate-12 bg-slate-12" : "border-slate-6 bg-transparent hover:border-slate-8",
        )}
      >
        {checked && <div className="text-slate-1 text-xs font-bold">✓</div>}
      </div>
      <span className="text-sm text-slate-11 group-hover:text-slate-12 transition-colors duration-200">{children}</span>
    </label>
  )
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
}

export function CustomSelect({ value, onChange, options, placeholder = "请选择...", className }: CustomSelectProps) {
  return (
    <div className={clsx("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          "w-full px-4 py-4 bg-white dark:bg-slate-1 border border-slate-4 rounded-xl text-slate-12",
          "transition-all duration-200 shadow-sm appearance-none cursor-pointer",
          "hover:border-slate-6 hover:shadow-md",
          "focus:outline-none focus:border-slate-8 focus:shadow-lg",
          "pr-12", // 为箭头留出空间
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {/* 自定义下拉箭头 */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <svg
          className="w-5 h-5 text-slate-9 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
