import { basehub } from "basehub"
import clsx from "clsx"
import type { PropsWithChildren } from "react"
import { AnimatedThemeSwitcher } from "../animated-theme-switcher"
import { DarkLightImage, darkLightImageFragment } from "../dark-light-image"
import { AnimatedText } from "../animated-text"

export async function WaitlistWrapper({ children }: PropsWithChildren) {
  const [
    {
      settings: { logo },
    },
    {
      footer: { copyright, showThemeSwitcher },
    },
    {
      settings: { forcedTheme },
    },
  ] = await Promise.all([
    basehub().query({ settings: { logo: darkLightImageFragment } }),
    basehub().query({
      footer: {
        copyright: {
          json: {
            content: true,
            blocks: {
              __typename: true,
              on_SocialLinkComponent: {
                _id: true,
                url: true,
              },
            },
          },
        },
        showThemeSwitcher: true,
      },
    }),
    basehub().query({ settings: { forcedTheme: true } }),
  ])

  return (
    <div
      className={clsx(
        "w-full mx-auto max-w-[600px] flex flex-col justify-center items-center",
        "bg-slate-1/90 dark:bg-slate-2/90 backdrop-blur-xl border border-slate-6/50",
        "pb-0 overflow-hidden rounded-3xl shadow-2xl",
        "shadow-slate-12/10 dark:shadow-slate-1/10",
      )}
    >
      <div className="flex flex-col items-center gap-6 flex-1 text-center w-full p-8 pb-4">
        <AnimatedText delay={0.1}>
          <div>
            {logo && (
              <div className="flex justify-center w-32 h-auto items-center mx-auto">
                <DarkLightImage dark={logo.dark} light={logo.light} priority />
              </div>
            )}
          </div>
        </AnimatedText>
        <div className="flex flex-col gap-12 w-full">{children}</div>
      </div>
      <footer className="flex justify-between items-center w-full self-stretch px-8 py-4 text-sm bg-slate-3/30 dark:bg-slate-4/30 backdrop-blur-sm border-t border-slate-6/50">
        <AnimatedText delay={0.6}>
          <div className="text-xs text-slate-10">© 2024 我们的产品. 保留所有权利.</div>
        </AnimatedText>
        {Boolean(showThemeSwitcher && !forcedTheme) ? (
          <AnimatedText delay={0.7}>
            <AnimatedThemeSwitcher />
          </AnimatedText>
        ) : null}
      </footer>
    </div>
  )
}
