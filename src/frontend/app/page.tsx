"use client"

import { useEffect, useState } from "react"
import localFont from "next/font/local"
import { motion } from "motion/react"
import { Activity, Gauge, Palette, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import FloatingLines from "@/components/FloatingLines"

const featureCards = [
  {
    title: "Painel operacional",
    description: "Visualize o status da frota em uma única tela e aja mais rápido com prioridades claras.",
    icon: Gauge,
  },
  {
    title: "Histórico de manutenção",
    description: "Acompanhe revisões, custos e recorrências para reduzir paradas inesperadas.",
    icon: ShieldCheck,
  },
  {
    title: "Indicadores em tempo real",
    description: "Monitore consumo, disponibilidade e desempenho com dados atualizados continuamente.",
    icon: Activity,
  },
] as const
const frizon = localFont({
  src: "../fonts/frizon.ttf",
  display: "swap",
})
const colorPresets = [
  {
    name: "Roxo",
    base: "#120b21",
    radial: "radial-gradient(120% 80% at 20% 0%, rgba(217,70,239,0.22), rgba(88,28,135,0.30), #120b21)",
    lines: ["#e945f5", "#c084fc", "#f1f5f9"],
  },
  {
    name: "Azul",
    base: "#081429",
    radial: "radial-gradient(120% 80% at 20% 0%, rgba(14,165,233,0.22), rgba(30,58,138,0.30), #081429)",
    lines: ["#38bdf8", "#60a5fa", "#e2e8f0"],
  },
  {
    name: "Esmeralda",
    base: "#072019",
    radial: "radial-gradient(120% 80% at 20% 0%, rgba(16,185,129,0.22), rgba(6,78,59,0.30), #072019)",
    lines: ["#34d399", "#2dd4bf", "#e2e8f0"],
  },
  {
    name: "Âmbar",
    base: "#211305",
    radial: "radial-gradient(120% 80% at 20% 0%, rgba(251,191,36,0.24), rgba(120,53,15,0.30), #211305)",
    lines: ["#f59e0b", "#fb923c", "#fef3c7"],
  },
] as const
const COLOR_PRESET_STORAGE_KEY = "unitech-landing-color-preset"
const DEFAULT_PRESET_INDEX = 1

export default function home({
  title = "Unitech",
}: {
  title?: string
}) {
  const words = title.split(" ")
  const [presetIndex, setPresetIndex] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_PRESET_INDEX
    try {
      const saved = Number(localStorage.getItem(COLOR_PRESET_STORAGE_KEY))
      if (Number.isInteger(saved) && saved >= 0 && saved < colorPresets.length) {
        return saved
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_PRESET_INDEX
  })
  const [showPalette, setShowPalette] = useState(false)
  const preset = colorPresets[presetIndex]

  useEffect(() => {
    try {
      localStorage.setItem(COLOR_PRESET_STORAGE_KEY, String(presetIndex))
    } catch {
      /* ignore */
    }
  }, [presetIndex])

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden py-16"
      style={{ backgroundColor: preset.base }}
    >
      <div className="absolute inset-0" style={{ background: preset.radial }} />
      <div className="absolute inset-0">
        <FloatingLines
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={[8, 8, 8]}
          lineDistance={[8, 8, 8]}
          bendRadius={8}
          bendStrength={-2}
          topWavePosition={{ x: 10, y: 0.5, rotate: -0.4 }}
          middleWavePosition={{ x: 5, y: 0, rotate: 0.2 }}
          interactive
          parallax={true}
          animationSpeed={1}
          linesGradient={preset.lines as unknown as string[]}
          mixBlendMode="screen"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-5xl mx-auto"
        >
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center rounded-full border border-black/20 bg-white/60 px-4 py-1.5 text-xs sm:text-sm font-medium tracking-wide mb-6 text-black/90 backdrop-blur-md shadow-[0_0_24px_rgba(125,211,252,0.18)]"
          >
            Plataforma inteligente para gestão de frotas
          </motion.p>

          <h1 className={`${frizon.className} text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter`}>
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text bg-linear-to-r from-black to-black/80 drop-shadow-[0_8px_30px_rgba(56,189,248,0.28)]"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-black/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Tome decisões com dados em tempo real, reduza custos operacionais e acompanhe desempenho da frota com
            segurança e previsibilidade.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
            <div
              className="inline-block group relative p-px rounded-2xl overflow-hidden transition-all duration-300 bg-linear-to-br from-cyan-300/70 via-blue-300/50 to-fuchsia-300/65 hover:scale-[1.01] hover:shadow-[0_12px_38px_rgba(56,189,248,0.42)]"
            >
              <Button
                onClick={() => {
                  location.replace("/login")
                }}
                variant="ghost"
                className="cursor-pointer rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                              bg-white/96 text-slate-900 transition-all duration-300 
                              group-hover:-translate-y-0.5 border border-white/30"
              >
                <span className="opacity-90 group-hover:opacity-100 transition-opacity">Acessar painel</span>
                <span
                  className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                  transition-all duration-300"
                >
                  →
                </span>
              </Button>
            </div>

            <Button
              onClick={() => {
                location.replace("/signup")
              }}
              variant="outline"
              className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold border-black/25 bg-white/45 text-black backdrop-blur-md hover:bg-white/65 shadow-[0_0_28px_rgba(14,165,233,0.2)]"
            >
              Criar conta
            </Button>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 text-left">
            {featureCards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.article
                  key={card.title}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + index * 0.08, duration: 0.45 }}
                  className="group rounded-2xl border border-white/35 bg-white/55 p-4 backdrop-blur-md shadow-[0_12px_38px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_14px_42px_rgba(56,189,248,0.24)]"
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/15 bg-white/75 text-black/85 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-black/90">{card.title}</h3>
                  <p className="text-xs leading-relaxed text-black/70">{card.description}</p>
                </motion.article>
              )
            })}
          </div>
        </motion.div>
      </div>

      <div className="fixed right-4 bottom-4 z-20 flex flex-col items-end gap-2">
        {showPalette && (
          <div className="rounded-xl border border-white/20 bg-black/35 p-2 backdrop-blur-md">
            <div className="flex gap-2">
              {colorPresets.map((option, index) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => setPresetIndex(index)}
                  className="h-7 w-7 rounded-full border border-white/30"
                  style={{ background: option.radial }}
                  aria-label={`Aplicar tema ${option.name}`}
                  title={option.name}
                />
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowPalette((current) => !current)}
          className="h-9 w-9 rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55"
          aria-label="Trocar cor de fundo"
        >
          <Palette className="mx-auto h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
