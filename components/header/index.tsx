import { basehub } from "basehub"
import { NavbarLink, NavbarLinkBackground } from "./link"
import { AnimatedText } from "../animated-text"
import clsx from "clsx"

export const Header = async () => {
  const {
    header: { navbar },
  } = await basehub().query({
    header: {
      navbar: {
        items: {
          href: true,
          _title: true,
        },
      },
    },
  })

  // 中文导航项映射
  const chineseNavItems = navbar.items.map((item) => ({
    ...item,
    _title: item._title === "Waitlist" ? "候补名单" : item._title === "Manifesto" ? "我们的愿景" : item._title,
  }))

  return (
    <div className="flex flex-col items-center justify-center">
      <AnimatedText delay={0.2}>
        <nav className="bg-slate-1/80 dark:bg-slate-2/80 backdrop-blur-xl rounded-2xl border border-slate-6/50">
          <div
            className={clsx(
              "bg-slate-1/80 dark:bg-slate-2/80 backdrop-blur-xl rounded-2xl p-1.5 flex relative items-center",
              "shadow-lg shadow-slate-12/5 dark:shadow-slate-1/5",
            )}
          >
            {/* 动画背景 */}
            <NavbarLinkBackground links={chineseNavItems.map((item) => item.href!)} />

            {/* 导航项 */}
            {chineseNavItems.map(({ href, _title }) => (
              <NavbarLink key={href} href={href ?? "/"}>
                {_title}
              </NavbarLink>
            ))}
          </div>
        </nav>
      </AnimatedText>
    </div>
  )
}
