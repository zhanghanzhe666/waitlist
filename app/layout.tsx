import type React from "react"
import "../basehub.config"
import type { Viewport } from "next"
import { Geist } from "next/font/google"
import { Providers } from "@/context"
import { Header } from "@/components/header"
import { Toolbar } from "basehub/next-toolbar"
import { basehub } from "basehub"
import { MeshGradientComponent } from "@/components/mesh-gradient"
import { PlaygroundSetupModal } from "@/components/playground-notification"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: true,
})

export const dynamic = "force-static"
export const revalidate = 30

const envs: Record<string, { isValid: boolean; name: string; label: string }> = {}
const _vercel_url_env_name = "VERCEL_URL"
const isMainV0 = process.env[_vercel_url_env_name]?.startsWith("kzmksltmu7fad4zoa2wi")

let allValid = true
const subscribeEnv = ({
  name,
  label,
  value,
}: {
  name: string
  label: string
  value: string | undefined
}) => {
  const isValid = !!value
  if (!isValid) {
    allValid = false
  }
  envs[name] = {
    isValid,
    name,
    label,
  }
}

export const viewport: Viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { settings } = await basehub().query({
    settings: {
      defaultTheme: true,
      forcedTheme: true,
      background: {
        color1: { hex: true },
        color2: { hex: true },
        color3: { hex: true },
        color4: { hex: true },
        speed: true,
      },
    },
  })

  let playgroundNotification = null

  subscribeEnv({
    name: "BASEHUB_TOKEN",
    label: "BaseHub Read Token",
    value: process.env.BASEHUB_TOKEN,
  })
  subscribeEnv({
    name: "RESEND_API_KEY",
    label: "Resend API Key",
    value: process.env.RESEND_API_KEY,
  })

  if (!isMainV0 && !allValid && process.env.NODE_ENV !== "production") {
    const playgroundData = await basehub().query({
      _sys: {
        playgroundInfo: {
          expiresAt: true,
          editUrl: true,
          claimUrl: true,
        },
      },
    })

    if (playgroundData._sys.playgroundInfo) {
      playgroundNotification = <PlaygroundSetupModal playgroundInfo={playgroundData._sys.playgroundInfo} envs={envs} />
    }
  }

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.className} antialiased max-w-screen min-h-svh bg-slate-1 text-slate-12 opacity-0 duration-75 transition-opacity`}
        style={{ opacity: 1 }}
      >
        <Providers defaultTheme={settings.defaultTheme || "system"} forcedTheme={settings.forcedTheme}>
          <MeshGradientComponent
            colors={[
              settings.background.color1.hex,
              settings.background.color2.hex,
              settings.background.color3.hex,
              settings.background.color4.hex,
            ]}
            speed={settings.background.speed}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 0,
              width: "100%",
              height: "100%",
            }}
          />
          <div className="max-w-screen-sm mx-auto w-full relative z-[1] flex flex-col min-h-screen">
            <div className="px-5 gap-8 flex flex-col flex-1 py-[12vh]">
              <Header />
              <main className="flex justify-center">{children}</main>
            </div>
          </div>
        </Providers>
        {!isMainV0 && <Toolbar />}
        {playgroundNotification}
      </body>
    </html>
  )
}

export const metadata = {
  generator: "v0.dev",
  title: "等候名单 - 加入我们",
  description: "加入我们的等候名单，第一时间获得最新消息",
}
