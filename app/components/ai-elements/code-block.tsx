"use client"

import { cn } from "@/lib/utils"
import type { BundledLanguage, BundledTheme, HighlighterGeneric, ThemedToken } from "shiki"
import { createHighlighter } from "shiki"
import { memo, useEffect, useMemo, useState } from "react"

type CodeBlockProps = {
  code: string
  language: string
  className?: string
  showLineNumbers?: boolean
}

type TokenizedCode = {
  tokens: ThemedToken[][]
  fg: string
  bg: string
}

type SupportedLanguage =
  | "bash"
  | "css"
  | "html"
  | "javascript"
  | "json"
  | "jsx"
  | "markdown"
  | "python"
  | "tsx"
  | "typescript"
  | "xml"
  | "yaml"

const SUPPORTED_LANGUAGES: ReadonlySet<SupportedLanguage> = new Set([
  "bash",
  "css",
  "html",
  "javascript",
  "json",
  "jsx",
  "markdown",
  "python",
  "tsx",
  "typescript",
  "xml",
  "yaml",
])

const highlighterCache = new Map<
  SupportedLanguage,
  Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>
>()

const tokenCache = new Map<string, TokenizedCode>()

function normalizeLanguage(language: string): SupportedLanguage | null {
  if (SUPPORTED_LANGUAGES.has(language as SupportedLanguage)) {
    return language as SupportedLanguage
  }
  if (language === "js") return "javascript"
  if (language === "ts") return "typescript"
  if (language === "md") return "markdown"
  if (language === "yml") return "yaml"
  if (language === "svg") return "xml"
  if (language === "text") return null
  return null
}

function createRawTokens(code: string): TokenizedCode {
  return {
    bg: "transparent",
    fg: "inherit",
    tokens: code.split("\n").map((line) =>
      line === ""
        ? []
        : [
            {
              color: "inherit",
              content: line,
            } as ThemedToken,
          ],
    ),
  }
}

function getCacheKey(code: string, language: string): string {
  return `${language}:${code.length}:${code.slice(0, 100)}:${code.slice(-100)}`
}

function getHighlighter(language: SupportedLanguage) {
  const cached = highlighterCache.get(language)
  if (cached) {
    return cached
  }

  const highlighterPromise = createHighlighter({
    langs: [language],
    themes: ["github-light", "github-dark"],
  })
  highlighterCache.set(language, highlighterPromise)
  return highlighterPromise
}

const LINE_NUMBER_CLASSES = cn(
  "block",
  "before:mr-4 before:inline-block before:w-8 before:text-right before:font-mono before:text-muted-foreground/50 before:select-none",
  "before:[counter-increment:line] before:content-[counter(line)]",
)

const TokenLine = memo(function TokenLine({
  line,
  showLineNumbers,
}: {
  line: ThemedToken[]
  showLineNumbers: boolean
}) {
  return (
    <span className={showLineNumbers ? LINE_NUMBER_CLASSES : "block"}>
      {line.length === 0
        ? "\n"
        : line.map((token, index) => (
            <span
              key={`${token.content}-${index}`}
              style={{
                color: token.color,
                backgroundColor: token.bgColor,
                ...token.htmlStyle,
              }}
            >
              {token.content}
            </span>
          ))}
    </span>
  )
})

export function CodeBlock({
  code,
  language,
  className,
  showLineNumbers = false,
}: CodeBlockProps) {
  const rawTokens = useMemo(() => createRawTokens(code), [code])
  const [tokenized, setTokenized] = useState<TokenizedCode>(rawTokens)

  useEffect(() => {
    let cancelled = false
    const normalizedLanguage = normalizeLanguage(language)
    const cacheKey = getCacheKey(code, language)
    const cached = tokenCache.get(cacheKey)

    if (cached) {
      setTokenized(cached)
      return () => {
        cancelled = true
      }
    }

    if (!normalizedLanguage) {
      setTokenized(rawTokens)
      return () => {
        cancelled = true
      }
    }

    setTokenized(rawTokens)

    getHighlighter(normalizedLanguage)
      .then((highlighter) => {
        if (cancelled) return
        const result = highlighter.codeToTokens(code, {
          lang: normalizedLanguage as BundledLanguage,
          themes: {
            dark: "github-dark",
            light: "github-light",
          },
        })
        const nextValue = {
          tokens: result.tokens,
          fg: result.fg ?? "inherit",
          bg: result.bg ?? "transparent",
        }
        tokenCache.set(cacheKey, nextValue)
        setTokenized(nextValue)
      })
      .catch(() => {
        if (!cancelled) {
          setTokenized(rawTokens)
        }
      })

    return () => {
      cancelled = true
    }
  }, [code, language, rawTokens])

  return (
    <div
      className={cn(
        "relative w-full overflow-auto rounded-md border bg-background text-foreground",
        className,
      )}
    >
      <pre
        className="m-0 p-4 text-sm"
        style={{ backgroundColor: tokenized.bg, color: tokenized.fg }}
      >
        <code
          className={cn(
            "font-mono text-sm",
            showLineNumbers && "[counter-increment:line_0] [counter-reset:line]",
          )}
        >
          {tokenized.tokens.map((line, index) => (
            <TokenLine
              key={`line-${index}`}
              line={line}
              showLineNumbers={showLineNumbers}
            />
          ))}
        </code>
      </pre>
    </div>
  )
}