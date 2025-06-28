import { basehub } from "basehub"
import { WaitlistWrapper } from "@/components/box"
import { Alex_Brush } from "next/font/google"
import clsx from "clsx"
import type { Metadata } from "next"
import { AnimatedText, AnimatedHeading } from "@/components/animated-text"
import { ManifestoContent } from "@/components/manifesto-content"
import "../../basehub.config"

const font = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: "400",
})

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
    title: "关于我们 | " + data.settings.metadata.defaultTitle,
    description: "了解我们的使命、愿景和团队故事",
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

export default async function Manifesto() {
  const { manifesto } = await basehub().query({
    manifesto: {
      body: {
        json: {
          content: true,
        },
      },
      author: {
        signatureName: true,
        name: true,
        role: true,
      },
    },
  })

  // 中文内容
  const chineseContent = {
    title: "关于我们",
    subtitle: "我们的使命与愿景",
    content: [
      {
        type: "heading",
        level: 2,
        text: "我们的使命",
      },
      {
        type: "paragraph",
        text: "我们致力于通过创新的技术解决方案，为用户创造更加便捷、高效的数字体验。我们相信技术应该服务于人，让每个人都能享受到科技进步带来的便利。",
      },
      {
        type: "heading",
        level: 2,
        text: "我们的愿景",
      },
      {
        type: "paragraph",
        text: "成为行业领先的产品和服务提供商，通过持续的创新和优质的用户体验，帮助个人和企业实现数字化转型，创造更美好的未来。",
      },
      {
        type: "heading",
        level: 2,
        text: "我们的价值观",
      },
      {
        type: "list",
        items: [
          "用户至上：始终将用户需求放在首位，持续改进产品体验",
          "创新驱动：拥抱新技术，勇于探索和尝试新的解决方案",
          "品质保证：严格把控产品质量，确保每一个细节都精益求精",
          "团队协作：相信团队的力量，共同创造卓越的成果",
          "社会责任：积极承担社会责任，为社会发展贡献力量",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "我们的团队",
      },
      {
        type: "paragraph",
        text: "我们拥有一支充满激情和创造力的团队，成员来自不同的专业背景，包括产品设计、技术开发、市场营销等各个领域。我们相信多元化的团队能够带来更丰富的视角和更创新的解决方案。",
      },
      {
        type: "paragraph",
        text: "每一位团队成员都秉承着对卓越的追求，我们不仅关注技术的先进性，更注重产品的实用性和用户体验。我们相信，只有真正理解用户需求，才能创造出真正有价值的产品。",
      },
    ],
    author: {
      name: "张伟",
      role: "创始人兼CEO",
      signatureName: "张伟",
      message: "感谢您对我们的关注和支持。我们将继续努力，为您提供更好的产品和服务。",
    },
  }

  return (
    <WaitlistWrapper>
      <div className="flex flex-col gap-10">
        {/* 标题区域 */}
        <div className="text-center space-y-4">
          <AnimatedHeading level={1} className="text-3xl sm:text-4xl font-bold text-slate-12 leading-tight">
            {chineseContent.title}
          </AnimatedHeading>
          <AnimatedText delay={0.3}>
            <p className="text-slate-10 text-lg">{chineseContent.subtitle}</p>
          </AnimatedText>
        </div>

        {/* 内容区域 */}
        <ManifestoContent content={chineseContent.content} />

        {/* 作者签名区域 */}
        <div className="flex flex-col gap-6 pt-8 border-t border-slate-6/50">
          <AnimatedText delay={1.2}>
            <div className="text-slate-11 text-center italic leading-relaxed">"{chineseContent.author.message}"</div>
          </AnimatedText>

          <div className="flex flex-col gap-2 items-center">
            <AnimatedText delay={1.4}>
              <p className={clsx("text-slate-12 text-4xl font-medium italic transform -rotate-2", font.className)}>
                {chineseContent.author.signatureName}
              </p>
            </AnimatedText>
            <AnimatedText delay={1.6}>
              <div className="text-center">
                <p className="text-slate-11 text-sm font-medium">{chineseContent.author.name}</p>
                <p className="text-slate-10 text-xs">{chineseContent.author.role}</p>
              </div>
            </AnimatedText>
          </div>
        </div>
      </div>
    </WaitlistWrapper>
  )
}
