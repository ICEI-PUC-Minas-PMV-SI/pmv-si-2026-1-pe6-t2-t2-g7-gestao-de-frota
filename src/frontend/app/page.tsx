"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"

const quickActions = ["Painel operacional", "Historico de manutencao", "Indicadores em tempo real"]

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full text-slate-950 dark:text-white" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export default function home({
  title = "Unitech",
}: {
  title?: string
}) {
  const words = title.split(" ")

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950 py-16">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
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
            className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/50 px-4 py-1.5 text-xs sm:text-sm font-medium tracking-wide mb-6 backdrop-blur-md"
          >
            Plataforma inteligente para gestao de frotas
          </motion.p>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
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
                    className="inline-block text-transparent bg-clip-text 
                                        bg-linear-to-r from-neutral-900 to-neutral-700/80 
                                        dark:from-white dark:to-white/80"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Tome decisoes com dados em tempo real, reduza custos operacionais e acompanhe desempenho da frota com
            seguranca e previsibilidade.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
            <div
              className="inline-block group relative bg-linear-to-b from-black/10 to-white/10 
                          dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                          overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <Button
                onClick={() => {
                  location.replace("/login")
                }}
                variant="ghost"
                className="cursor-pointer rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                              bg-white/95 hover:bg-white dark:bg-black/95 dark:hover:bg-black 
                              text-black dark:text-white transition-all duration-300 
                              group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                              hover:shadow-md dark:hover:shadow-neutral-800/50"
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
              className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold border-black/15 dark:border-white/20 bg-white/75 dark:bg-black/40 backdrop-blur-md hover:bg-white dark:hover:bg-black/70"
            >
              Criar conta
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            {quickActions.map((action) => (
              <span
                key={action}
                className="rounded-full px-3 py-1 border border-black/10 dark:border-white/15 bg-white/65 dark:bg-black/40 backdrop-blur-sm"
              >
                {action}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

