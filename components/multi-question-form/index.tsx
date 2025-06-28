"use client"
import clsx from "clsx"
import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import { CustomRadio, CustomCheckbox } from "@/components/custom-inputs"
import { AnimatedText, AnimatedHeading } from "@/components/animated-text"

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
      if (progressBarRef.current) {
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
  }, [isInitialized])

  // 步骤切换时的动画
  useEffect(() => {
    if (isInitialized) {
      if (isSuccessStep && successRef.current) {
        // 成功页面动画
        gsap.fromTo(
          successRef.current,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" },
        )
      } else if (questionRefs.current[currentStep]) {
        // 问题页面动画
        gsap.fromTo(
          questionRefs.current[currentStep],
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" },
        )
      }

      // 进度条更新（直接更新，无动画，除了初始化）
      if (progressRef.current) {
        const progress = ((currentStep + 1) / totalSteps) * 100
        gsap.set(progressRef.current, { width: `${progress}%` })
      }
    }
  }, [currentStep, totalSteps, isInitialized, isSuccessStep])

  const handleNext = () => {
    if (isSuccessStep) return

    const currentQuestion = questions[currentStep]
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      setError("请完成此问题后再继续")
      setTimeout(() => setError(undefined), 2000)
      return
    }

    if (currentStep < questions.length - 1) {
      // 普通步骤切换
      gsap.to(questionRefs.current[currentStep], {
        opacity: 0,
        y: -30,
        scale: 0.95,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setCurrentStep(currentStep + 1)
        },
      })
    } else {
      // 最后一步，提交表单
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (isSuccessStep) {
      // 从成功页面返回到最后一个问题
      gsap.to(successRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setState(STATES.idle)
          setCurrentStep(currentStep - 1)
        },
      })
    } else if (currentStep > 0) {
      gsap.to(questionRefs.current[currentStep], {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setCurrentStep(currentStep - 1)
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
          // 切换到成功页面
          gsap.to(questionRefs.current[currentStep], {
            opacity: 0,
            y: -30,
            scale: 0.95,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
              setCurrentStep(questions.length) // 切换到成功步骤
            },
          })
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

  // 为输入控件添加动画效果
  const animateControl = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1.02,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    })
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
                animateControl(e.target)
              }}
              onFocus={(e) => {
                gsap.to(e.target, {
                  scale: 1.01,
                  duration: 0.2,
                  ease: "power2.out",
                })
              }}
              onBlur={(e) => {
                gsap.to(e.target, {
                  scale: 1,
                  duration: 0.2,
                  ease: "power2.out",
                })
              }}
              className={clsx(
                "w-full px-4 py-4 bg-slate-2/50 border border-slate-6 rounded-xl text-slate-12 placeholder:text-slate-9",
                "focus:outline-none focus:ring-2 focus:ring-slate-8 focus:border-transparent",
                "transition-all duration-200 backdrop-blur-sm",
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
                animateControl(e.target)
              }}
              onFocus={(e) => {
                gsap.to(e.target, {
                  scale: 1.01,
                  duration: 0.2,
                  ease: "power2.out",
                })
              }}
              onBlur={(e) => {
                gsap.to(e.target, {
                  scale: 1,
                  duration: 0.2,
                  ease: "power2.out",
                })
              }}
              className={clsx(
                "w-full px-4 py-4 bg-slate-2/50 border border-slate-6 rounded-xl text-slate-12 placeholder:text-slate-9",
                "focus:outline-none focus:ring-2 focus:ring-slate-8 focus:border-transparent",
                "transition-all duration-200 backdrop-blur-sm",
              )}
            />
          )}

          {question.type === "textarea" && (
            <textarea
              placeholder={question.placeholder}
              value={answers[question.id] || ""}
              onChange={(e) => {
                updateAnswer(question.id, e.target.value)
                animateControl(e.target)
              }}
              onFocus={(e) => {
                gsap.to(e.target, {
                  scale: 1.01,
                  duration: 0.2,
                  ease: "power2.out",
                })
              }}
              onBlur={(e) => {
                gsap.to(e.target, {
                  scale: 1,
                  duration: 0.2,
                  ease: "power2.out",
                })
              }}
              rows={4}
              className={clsx(
                "w-full px-4 py-4 bg-slate-2/50 border border-slate-6 rounded-xl text-slate-12 placeholder:text-slate-9",
                "focus:outline-none focus:ring-2 focus:ring-slate-8 focus:border-transparent",
                "transition-all duration-200 backdrop-blur-sm resize-none",
              )}
            />
          )}

          {question.type === "select" && (
            <select
              value={answers[question.id] || ""}
              onChange={(e) => {
                updateAnswer(question.id, e.target.value)
                animateControl(e.target)
              }}
              onFocus={(e) => {
                gsap.to(e.target, {
                  scale: 1.01,
                  duration: 0.2,
                  ease: "power2.out",
                })
              }}
              onBlur={(e) => {
                gsap.to(e.target, {
                  scale: 1,
                  duration: 0.2,
                  ease: "power2.out",
                })
              }}
              className={clsx(
                "w-full px-4 py-4 bg-slate-2/50 border border-slate-6 rounded-xl text-slate-12",
                "focus:outline-none focus:ring-2 focus:ring-slate-8 focus:border-transparent",
                "transition-all duration-200 backdrop-blur-sm",
              )}
            >
              <option value="">请选择...</option>
              {question.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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

  // 渲染成功页面
  const renderSuccessPage = () => {
    return (
      <div ref={successRef} className={clsx("w-full", !isSuccessStep && "hidden")}>
        <div className="text-center space-y-6 p-8 bg-green-50 dark:bg-green-900/20 rounded-xl backdrop-blur-sm border border-green-200 dark:border-green-800">
          <div className="text-6xl">🎉</div>
          <AnimatedHeading level={2} className="text-2xl font-bold text-green-600 dark:text-green-400">
            申请提交成功！
          </AnimatedHeading>
          <AnimatedText delay={0.2}>
            <div className="space-y-4">
              <p className="text-slate-11 text-lg">感谢您的申请！我们已收到您的信息。</p>
              <p className="text-sm text-slate-10">
                我们会在 <span className="font-medium text-slate-11">24-48小时内</span> 通过邮件与您联系，
                请注意查收邮箱（包括垃圾邮件文件夹）。
              </p>
              <div className="bg-slate-2/50 p-6 rounded-lg">
                <p className="text-sm text-slate-9 mb-3 font-medium">接下来您将获得：</p>
                <ul className="text-sm text-slate-10 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    产品早期访问权限
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    专属优惠和折扣
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    优先技术支持
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    产品更新通知
                  </li>
                </ul>
              </div>
              <div className="text-xs text-slate-9 bg-slate-2/30 p-4 rounded-lg">
                <p className="mb-1">
                  📧 邮件将从 <span className="font-mono">noreply@ourproduct.com</span> 发送
                </p>
                <p>🕒 预计产品将在 2024 年第二季度正式发布</p>
              </div>
            </div>
          </AnimatedText>
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
            className="bg-gradient-to-r from-slate-12 to-slate-10 h-2 rounded-full"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="text-center">
        <span className="text-sm text-slate-10 bg-slate-2/50 px-4 py-2 rounded-full backdrop-blur-sm">
          {isSuccessStep ? "完成" : `第 ${currentStep + 1} 步，共 ${questions.length} 步`}
        </span>
      </div>

      {/* 问题或成功页面 */}
      <div className="min-h-[300px] flex items-start justify-center">
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
              "bg-green-600 text-white hover:bg-green-700 shadow-lg",
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
