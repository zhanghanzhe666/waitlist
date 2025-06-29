"use client"
import clsx from "clsx"
import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import { CustomRadio, CustomCheckbox } from "@/components/custom-inputs"
import { AnimatedSelect } from "@/components/animated-select"
import { AnimatedText } from "@/components/animated-text"

type QuestionType = "text" | "email" | "select" | "radio" | "checkbox" | "textarea"

type Question = {
  id: string
  type: QuestionType
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  multiple?: boolean
}

type MultiQuestionFormProps = {
  questions: Question[]
  formAction?: (data: FormData) => Promise<{ success: true } | { success: false; error: string }>
  buttonCopy: {
    success: string
    idle: string
    loading: string
  }
}

type State = "idle" | "loading" | "success" | "error"

const STATES: Record<State, State> = {
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error",
}

export function MultiQuestionForm({ questions, formAction, buttonCopy }: MultiQuestionFormProps) {
  const [state, setState] = useState<State>(STATES.idle)
  const [error, setError] = useState<string>()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const questionRefs = useRef<(HTMLDivElement | null)[]>([])
  const successRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const errorTimeout = useRef<NodeJS.Timeout | null>(null)

  // 总步数包括成功页面
  const totalSteps = questions.length + 1
  const isSuccessStep = currentStep === questions.length

  // 初始化动画，只在组件首次加载时执行
  useEffect(() => {
    if (!isInitialized) {
      // 进度条初始化动画
      if (progressBarRef.current && progressRef.current) {
        // 设置初始进度
        const initialProgress = ((currentStep + 1) / totalSteps) * 100
        gsap.set(progressRef.current, { width: `${initialProgress}%` })

        gsap.fromTo(
          progressBarRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.3 },
        )
      }

      // 第一个问题的初始化动画
      if (questionRefs.current[0]) {
        gsap.fromTo(
          questionRefs.current[0],
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out", delay: 0.5 },
        )
      }

      setIsInitialized(true)
    }
  }, [isInitialized, currentStep, totalSteps])

  // 内容高度变化动画 - 只处理高度，不处理内容显示动画
  useEffect(() => {
    if (isInitialized && contentRef.current) {
      // 获取当前内容的实际高度
      const currentElement = isSuccessStep ? successRef.current : questionRefs.current[currentStep]

      if (currentElement) {
        // 临时显示元素以测量高度
        const wasHidden = currentElement.style.display === "none" || currentElement.classList.contains("hidden")
        if (wasHidden) {
          currentElement.style.visibility = "hidden"
          currentElement.style.display = "block"
          currentElement.classList.remove("hidden")
        }

        const newHeight = currentElement.scrollHeight

        if (wasHidden) {
          currentElement.style.display = "none"
          currentElement.style.visibility = "visible"
          currentElement.classList.add("hidden")
        }

        // 只动画高度变化
        gsap.to(contentRef.current, {
          height: newHeight + "px",
          duration: 0.5,
          ease: "power2.out",
        })
      }
    }
  }, [currentStep, isInitialized, isSuccessStep])

  // 单独处理进度条动画
  useEffect(() => {
    if (isInitialized && progressRef.current) {
      const progress = ((currentStep + 1) / totalSteps) * 100
      gsap.to(progressRef.current, {
        width: `${progress}%`,
        duration: 0.8,
        ease: "power2.out",
      })
    }
  }, [currentStep, totalSteps, isInitialized])

  const handleNext = () => {
    if (isSuccessStep) return

    const currentQuestion = questions[currentStep]
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      setError("请完成此问题后再继续")
      setTimeout(() => setError(undefined), 2000)
      return
    }

    // 隐藏当前内容
    const currentElement = questionRefs.current[currentStep]
    if (currentElement) {
      gsap.to(currentElement, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          currentElement.classList.add("hidden")
          if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1)
            // 显示下一个问题
            setTimeout(() => {
              const nextElement = questionRefs.current[currentStep + 1]
              if (nextElement) {
                nextElement.classList.remove("hidden")
                gsap.fromTo(nextElement, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
              }
            }, 100)
          } else {
            handleSubmit()
          }
        },
      })
    }
  }

  const handlePrevious = () => {
    const currentElement = isSuccessStep ? successRef.current : questionRefs.current[currentStep]

    if (currentElement) {
      gsap.to(currentElement, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          currentElement.classList.add("hidden")
          if (isSuccessStep) {
            setState(STATES.idle)
            setCurrentStep(currentStep - 1)
            // 显示上一个问题
            setTimeout(() => {
              const prevElement = questionRefs.current[currentStep - 1]
              if (prevElement) {
                prevElement.classList.remove("hidden")
                gsap.fromTo(prevElement, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
              }
            }, 100)
          } else if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
            // 显示上一个问题
            setTimeout(() => {
              const prevElement = questionRefs.current[currentStep - 1]
              if (prevElement) {
                prevElement.classList.remove("hidden")
                gsap.fromTo(prevElement, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
              }
            }, 100)
          }
        },
      })
    }
  }

  const handleSubmit = async () => {
    if (state === STATES.loading) return

    if (errorTimeout.current) {
      clearTimeout(errorTimeout.current)
      setError(undefined)
      setState(STATES.idle)
    }

    if (formAction && typeof formAction === "function") {
      try {
        setState(STATES.loading)

        const formData = new FormData()
        Object.entries(answers).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v))
          } else {
            formData.append(key, value)
          }
        })

        const data = await formAction(formData)

        if (data.success) {
          setState(STATES.success)
          // 隐藏当前问题并切换到成功页面
          const currentElement = questionRefs.current[currentStep]
          if (currentElement) {
            gsap.to(currentElement, {
              opacity: 0,
              y: -20,
              duration: 0.3,
              ease: "power2.in",
              onComplete: () => {
                currentElement.classList.add("hidden")
                setCurrentStep(questions.length)
                // 显示成功页面
                setTimeout(() => {
                  if (successRef.current) {
                    successRef.current.classList.remove("hidden")
                    gsap.fromTo(
                      successRef.current,
                      { opacity: 0, y: 20 },
                      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
                    )
                  }
                }, 100)
              },
            })
          }
        } else {
          setState(STATES.error)
          setError(data.error)
          errorTimeout.current = setTimeout(() => {
            setError(undefined)
            setState(STATES.idle)
          }, 3000)
        }
      } catch (error) {
        setState(STATES.error)
        setError("提交时发生错误，请稍后重试")
        console.error(error)
        errorTimeout.current = setTimeout(() => {
          setError(undefined)
          setState(STATES.idle)
        }, 3000)
      }
    }
  }

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const renderQuestion = (question: Question, index: number) => {
    const isVisible = index === currentStep && !isSuccessStep

    return (
      <div
        key={question.id}
        ref={(el) => (questionRefs.current[index] = el)}
        className={clsx("w-full", !isVisible && "hidden")}
      >
        <div className="mb-6">
          <label className="block text-lg font-medium text-slate-12 mb-4">
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {question.type === "text" && (
            <input
              type="text"
              placeholder={question.placeholder}
              value={answers[question.id] || ""}
              onChange={(e) => {
                updateAnswer(question.id, e.target.value)
              }}
              className={clsx(
                "w-full px-4 py-4 bg-white dark:bg-slate-1 border border-slate-4 rounded-xl text-slate-12 placeholder:text-slate-9",
                "focus:outline-none focus:border-slate-8",
                "transition-all duration-200 shadow-sm",
              )}
            />
          )}

          {question.type === "email" && (
            <input
              type="email"
              placeholder={question.placeholder}
              value={answers[question.id] || ""}
              onChange={(e) => {
                updateAnswer(question.id, e.target.value)
              }}
              className={clsx(
                "w-full px-4 py-4 bg-white dark:bg-slate-1 border border-slate-4 rounded-xl text-slate-12 placeholder:text-slate-9",
                "focus:outline-none focus:border-slate-8",
                "transition-all duration-200 shadow-sm",
              )}
            />
          )}

          {question.type === "textarea" && (
            <textarea
              placeholder={question.placeholder}
              value={answers[question.id] || ""}
              onChange={(e) => {
                updateAnswer(question.id, e.target.value)
              }}
              rows={4}
              className={clsx(
                "w-full px-4 py-4 bg-white dark:bg-slate-1 border border-slate-4 rounded-xl text-slate-12 placeholder:text-slate-9",
                "focus:outline-none focus:border-slate-8",
                "transition-all duration-200 shadow-sm resize-none",
              )}
            />
          )}

          {question.type === "select" && (
            <AnimatedSelect
              value={answers[question.id] || ""}
              onChange={(value) => updateAnswer(question.id, value)}
              options={question.options || []}
              placeholder="请选择..."
            />
          )}

          {question.type === "radio" && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <CustomRadio
                  key={option}
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(value) => updateAnswer(question.id, value)}
                >
                  {option}
                </CustomRadio>
              ))}
            </div>
          )}

          {question.type === "checkbox" && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <CustomCheckbox
                  key={option}
                  value={option}
                  checked={(answers[question.id] || []).includes(option)}
                  onChange={(value, checked) => {
                    const currentValues = answers[question.id] || []
                    if (checked) {
                      updateAnswer(question.id, [...currentValues, value])
                    } else {
                      updateAnswer(
                        question.id,
                        currentValues.filter((v: string) => v !== value),
                      )
                    }
                  }}
                >
                  {option}
                </CustomCheckbox>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // 渲染成功页面 - 按照截图设计
  const renderSuccessPage = () => {
    return (
      <div ref={successRef} className={clsx("w-full", !isSuccessStep && "hidden")}>
        <div className="text-center space-y-6 p-8 bg-slate-12/90 dark:bg-slate-12/95 rounded-2xl backdrop-blur-sm border border-slate-6">
          {/* 庆祝图标 */}
          <div className="text-6xl">🎉</div>

          {/* 标题 */}
          <h2 className="text-2xl font-bold text-slate-1">申请提交成功！</h2>

          {/* 感谢文字 */}
          <p className="text-slate-3 text-lg">感谢您的申请！我们已收到您的信息。</p>

          {/* 时间说明 */}
          <p className="text-slate-4 text-sm">
            我们会在 <span className="font-medium text-slate-2">24-48小时内</span> 通过邮件与您联系，
            请注意查收邮箱（包括垃圾邮件文件夹）。
          </p>

          {/* 获得权益 */}
          <div className="text-left bg-slate-11/20 p-6 rounded-xl">
            <p className="text-slate-3 text-sm mb-4 font-medium">接下来您将获得：</p>
            <ul className="text-slate-4 text-sm space-y-2">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-slate-4 rounded-full flex-shrink-0"></span>
                产品早期访问权限
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-slate-4 rounded-full flex-shrink-0"></span>
                专属优惠和折扣
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-slate-4 rounded-full flex-shrink-0"></span>
                优先技术支持
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-slate-4 rounded-full flex-shrink-0"></span>
                产品更新通知
              </li>
            </ul>
          </div>

          {/* 底部说明 */}
          <div className="text-xs text-slate-5 space-y-1">
            <p>我们承诺保护您的隐私，不会向第三方分享您的个人信息</p>
            <p>预计产品将在 2024 年第二季度正式发布</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form ref={formRef} className="w-full space-y-8">
      {/* 进度条 */}
      <div className="w-full">
        <div ref={progressBarRef} className="w-full bg-slate-3/50 rounded-full h-2 backdrop-blur-sm">
          <div
            ref={progressRef}
            className="bg-gradient-to-r from-slate-12 to-slate-10 h-2 rounded-full transition-all duration-300"
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="text-center">
        <span className="text-sm text-slate-10 bg-slate-2/50 px-4 py-2 rounded-full backdrop-blur-sm">
          {isSuccessStep ? "完成" : `第 ${currentStep + 1} 步，共 ${questions.length} 步`}
        </span>
      </div>

      {/* 动态高度容器 */}
      <div ref={contentRef} className="overflow-hidden" style={{ height: "auto" }}>
        {questions.map((question, index) => renderQuestion(question, index))}
        {renderSuccessPage()}
      </div>

      {/* 错误信息 */}
      {error && (
        <AnimatedText>
          <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-xl backdrop-blur-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        </AnimatedText>
      )}

      {/* 按钮 */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={clsx(
            "px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200",
            "bg-slate-2/50 backdrop-blur-sm border border-slate-6",
            "focus:outline-none",
            currentStep === 0
              ? "text-slate-9 cursor-not-allowed opacity-50"
              : "text-slate-11 hover:text-slate-12 hover:bg-slate-3/50 hover:border-slate-8",
          )}
        >
          {isSuccessStep ? "返回编辑" : "上一步"}
        </button>

        {!isSuccessStep && (
          <button
            type="button"
            onClick={handleNext}
            disabled={state === "loading"}
            className={clsx(
              "px-8 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              "bg-slate-12 text-slate-1 hover:bg-slate-11 shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none",
              "transform hover:scale-105 active:scale-95",
            )}
          >
            {state === "loading" ? (
              <div className="flex items-center gap-2">
                {buttonCopy.loading}
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              </div>
            ) : currentStep === questions.length - 1 ? (
              buttonCopy.idle
            ) : (
              "下一步"
            )}
          </button>
        )}

        {isSuccessStep && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={clsx(
              "px-8 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              "bg-slate-1 text-slate-12 hover:bg-slate-2 shadow-lg border border-slate-6",
              "focus:outline-none",
              "transform hover:scale-105 active:scale-95",
            )}
          >
            重新申请
          </button>
        )}
      </div>
    </form>
  )
}
