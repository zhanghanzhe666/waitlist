import { basehub } from "basehub"
import clsx from "clsx"
import type { PropsWithChildren } from "react"
import { ThemeSwitcher } from "../switch-theme"
import { DarkLightImage, darkLightImageFragment } from "../dark-light-image"

export async function WaitlistWrapper({ children }: PropsWithChildren) {
  const [
    {
      settings: { logo },
    },
    {
      footer: { showThemeSwitcher },
    },
    {
      settings: { forcedTheme },
    },
  ] = await Promise.all([
    basehub().query({ settings: { logo: darkLightImageFragment } }),
    basehub().query({
      footer: {
        showThemeSwitcher: true,
      },
    }),
    basehub().query({ settings: { forcedTheme: true } }),
  ])

  return (
    <div
      className={clsx(
        "w-full mx-auto max-w-[500px] flex flex-col justify-center items-center bg-gray-1/85 pb-0 overflow-hidden rounded-2xl",
        "shadow-[0px_170px_48px_0px_rgba(18,_18,_19,_0.00),_0px_109px_44px_0px_rgba(18,_18,_19,_0.01),_0px_61px_37px_0px_rgba(18,_18,_19,_0.05),_0px_27px_27px_0px_rgba(18,_18,_19,_0.09),_0px_7px_15px_0px_rgba(18,_18,_19,_0.10)]",
      )}
    >
      <div className="flex flex-col items-center gap-4 flex-1 text-center w-full p-8 pb-4">
        <div>
          {logo && (
            <div className="flex justify-center w-32 h-auto items-center mx-auto">
              <DarkLightImage dark={logo.dark} light={logo.light} priority />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-10">{children}</div>
      </div>
      <footer className="flex justify-between items-center w-full self-stretch px-8 py-3 text-sm bg-gray-12/[.07] overflow-hidden">
        <p className="text-xs text-slate-10">© 2024 版权所有</p>
        {Boolean(showThemeSwitcher && !forcedTheme) ? <ThemeSwitcher /> : null}
      </footer>
    </div>
  )
}
