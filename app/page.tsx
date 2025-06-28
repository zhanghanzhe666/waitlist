import { basehub } from "basehub"
import { sendEvent, parseFormData } from "basehub/events"
import { MultiQuestionForm } from "@/components/multi-question-form"
import { WaitlistWrapper } from "@/components/box"
import { AnimatedHeading, AnimatedText } from "@/components/animated-text"
import type { Metadata } from "next"
import "../basehub.config"

export const dynamic = "force-static"
export const revalidate = 30

export const generateMetadata = async (): Promise<Metadata> => {
  const data = await basehub().query({
    settings: {
      metadata: {
        titleTemplate: true,
        defaultTitle: true,
        defaultDescription: true,
        favicon: {
          url: true,
        },
        ogImage: {
          url: true,
        },
      },
    },
  })
  return {
    title: "加入候补名单 | " + data.settings.metadata.defaultTitle,
    description: "成为首批体验我们产品的用户，获得独家访问权限和特别优惠",
    openGraph: {
      type: "website",
      images: [data.settings.metadata.ogImage.url],
    },
    twitter: {
      card: "summary_large_image",
      images: [data.settings.metadata.ogImage.url],
    },
    icons: [data.settings.metadata.favicon.url],
  }
}

// 定义问题
const questions = [
  {
    id: "email",
    type: "email" as const,
    label: "您的邮箱地址",
    placeholder: "请输入您的邮箱地址",
    required: true,
  },
  {
    id: "name",
    type: "text" as const,
    label: "您的姓名",
    placeholder: "请输入您的真实姓名",
    required: true,
  },
  {
    id: "company",
    type: "text" as const,
    label: "公司或组织名称",
    placeholder: "请输入您所在的公司或组织（可选）",
    required: false,
  },
  {
    id: "role",
    type: "select" as const,
    label: "您的职位或角色",
    required: true,
    options: [
      "产品经理",
      "前端开发工程师",
      "后端开发工程师",
      "全栈开发工程师",
      "UI/UX设计师",
      "市场营销专员",
      "创始人/CEO",
      "学生",
      "自由职业者",
      "其他",
    ],
  },
  {
    id: "interests",
    type: "checkbox" as const,
    label: "您对哪些功能特性感兴趣？（可多选）",
    required: true,
    options: [
      "内容管理系统",
      "API接口集成",
      "团队协作工具",
      "数据分析仪表板",
      "工作流自动化",
      "移动端应用",
      "第三方集成",
      "自定义开发",
    ],
  },
  {
    id: "usage_frequency",
    type: "radio" as const,
    label: "您预计多久使用一次我们的产品？",
    required: true,
    options: ["每天多次", "每天一次", "每周几次", "每月几次", "偶尔使用"],
  },
  {
    id: "team_size",
    type: "radio" as const,
    label: "您的团队规模大概是多少人？",
    required: false,
    options: ["个人用户", "2-5人小团队", "6-20人中型团队", "21-100人大团队", "100人以上企业"],
  },
  {
    id: "feedback",
    type: "textarea" as const,
    label: "您还有什么想法、建议或期望吗？",
    placeholder: "请分享您的想法，这将帮助我们更好地改进产品...",
    required: false,
  },
]

export default async function Home() {
  const { waitlist } = await basehub().query({
    waitlist: {
      title: true,
      subtitle: {
        json: {
          content: true,
        },
      },
      input: {
        ingestKey: true,
        schema: true,
      },
      button: {
        idleCopy: true,
        successCopy: true,
        submittingCopy: true,
      },
    },
  })

  return (
    <WaitlistWrapper>
      {/* 标题区域 */}
      <div className="space-y-4 text-center">
        <AnimatedHeading level={1} className="text-3xl sm:text-4xl font-bold text-slate-12 leading-tight">
          加入我们的候补名单
        </AnimatedHeading>
        <AnimatedText delay={0.3}>
          <div className="text-slate-10 text-lg leading-relaxed max-w-md mx-auto">
            成为首批体验我们产品的用户，获得独家访问权限、特别优惠和优先技术支持。
          </div>
        </AnimatedText>
        <AnimatedText delay={0.5}>
          <div className="text-sm text-slate-9 bg-slate-2/50 backdrop-blur-sm px-4 py-2 rounded-full inline-block border border-slate-6">
            ✨ 限时开放，仅限前1000名用户
          </div>
        </AnimatedText>
      </div>

      {/* 多问题表单 */}
      <div className="w-full">
        <MultiQuestionForm
          questions={questions}
          buttonCopy={{
            idle: "提交申请",
            success: "申请提交成功！",
            loading: "正在提交中...",
          }}
          formAction={async (data) => {
            "use server"
            try {
              const email = data.get("email") as string
              const name = data.get("name") as string
              const company = data.get("company") as string
              const role = data.get("role") as string
              const interests = data.getAll("interests")
              const usageFrequency = data.get("usage_frequency") as string
              const teamSize = data.get("team_size") as string
              const feedback = data.get("feedback") as string

              // 验证必填字段
              if (!email || !name || !role || interests.length === 0 || !usageFrequency) {
                return {
                  success: false,
                  error: "请填写所有必填字段",
                }
              }

              // 验证邮箱格式
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!emailRegex.test(email)) {
                return {
                  success: false,
                  error: "请输入有效的邮箱地址",
                }
              }

              // 创建包含所有信息的数据对象
              const formattedData = {
                email,
                name,
                company: company || "未填写",
                role,
                interests: interests.join(", "),
                usage_frequency: usageFrequency,
                team_size: teamSize || "未填写",
                feedback: feedback || "无",
                submitted_at: new Date().toLocaleString("zh-CN", {
                  timeZone: "Asia/Shanghai",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
                user_agent: "Web Application",
              }

              // 使用BaseHub事件系统
              const emailFormData = new FormData()
              emailFormData.set("email", email)

              const emailParsedData = parseFormData(waitlist.input.ingestKey, waitlist.input.schema, emailFormData)

              if (!emailParsedData.success) {
                console.error("邮箱验证失败:", emailParsedData.errors)
                return {
                  success: false,
                  error: "邮箱格式验证失败，请检查后重试",
                }
              }

              // 发送事件到BaseHub
              await sendEvent(waitlist.input.ingestKey, {
                ...emailParsedData.data,
                metadata: JSON.stringify(formattedData),
              })

              return { success: true }
            } catch (error) {
              console.error("提交错误:", error)
              return {
                success: false,
                error: "提交时发生网络错误，请检查网络连接后重试",
              }
            }
          }}
        />
      </div>

      {/* 额外信息 */}
      <AnimatedText delay={0.8}>
        <div className="text-center space-y-2">
          <div className="text-xs text-slate-9">我们承诺保护您的隐私，不会向第三方分享您的个人信息</div>
          <div className="text-xs text-slate-8">预计产品将在 2024 年第二季度正式发布</div>
        </div>
      </AnimatedText>
    </WaitlistWrapper>
  )
}
