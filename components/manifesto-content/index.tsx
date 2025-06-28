"use client"
import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import clsx from "clsx"
import type { JSX } from "react" // Import JSX to declare HeadingTag

type ContentItem = {
  type: "heading" | "paragraph" | "list"
  level?: number
  text?: string
  items?: string[]
}

interface ManifestoContentProps {
  content: ContentItem[]
}

export function ManifestoContent({ content }: ManifestoContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (contentRef.current && itemRefs.current.length > 0) {
      // 为每个内容项添加进入动画
      itemRefs.current.forEach((item, index) => {
        if (item) {
          gsap.fromTo(
            item,
            {
              opacity: 0,
              y: 30,
              scale: 0.98,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "power2.out",
              delay: 0.5 + index * 0.1, // 递增延迟创建瀑布效果
            },
          )
        }
      })
    }
  }, [content])

  const renderContentItem = (item: ContentItem, index: number) => {
    const baseDelay = 0.5 + index * 0.1

    switch (item.type) {
      case "heading":
        const HeadingTag = `h${item.level || 2}` as keyof JSX.IntrinsicElements
        return (
          <HeadingTag
            key={index}
            ref={(el) => (itemRefs.current[index] = el)}
            className={clsx(
              "font-bold text-slate-12 leading-tight",
              item.level === 2 && "text-2xl mt-8 mb-4",
              item.level === 3 && "text-xl mt-6 mb-3",
              "opacity-0", // 初始隐藏，等待动画
            )}
          >
            {item.text}
          </HeadingTag>
        )

      case "paragraph":
        return (
          <p
            key={index}
            ref={(el) => (itemRefs.current[index] = el)}
            className="text-slate-11 leading-relaxed mb-4 opacity-0"
          >
            {item.text}
          </p>
        )

      case "list":
        return (
          <div key={index} ref={(el) => (itemRefs.current[index] = el)} className="mb-6 opacity-0">
            <ul className="space-y-3">
              {item.items?.map((listItem, listIndex) => (
                <li key={listIndex} className="flex items-start gap-3 text-slate-11 leading-relaxed">
                  <span className="w-2 h-2 bg-slate-8 rounded-full flex-shrink-0 mt-2"></span>
                  <span>{listItem}</span>
                </li>
              ))}
            </ul>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div ref={contentRef} className="text-left space-y-2 max-w-none">
      {content.map((item, index) => renderContentItem(item, index))}
    </div>
  )
}
