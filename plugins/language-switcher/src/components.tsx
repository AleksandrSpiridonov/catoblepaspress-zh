import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"

interface Options {
  englishBaseUrl: string
  russianBaseUrl: string
  hindiBaseUrl: string
}

const styles = `.language-switcher {
  align-items: center;
  background: none;
  border: none;
  color: var(--darkgray);
  display: inline-flex;
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  height: 32px;
  justify-content: center;
  letter-spacing: 0.04em;
  margin: 0;
  padding: 0;
  text-decoration: none;
  width: 24px;
}`

export const LanguageSwitcher: QuartzComponentConstructor<Options> = (opts) => {
  const Component: QuartzComponent = ({ cfg, fileData, displayClass }: QuartzComponentProps) => {
    const slug = (fileData.slug ?? "index").replace(/\/index$/, "/")
    const languages = [
      { label: "RU", name: "查看俄文版本", base: opts.russianBaseUrl },
      { label: "EN", name: "查看英文版本", base: opts.englishBaseUrl },
      { label: "HI", name: "查看印地语版本", base: opts.hindiBaseUrl },
    ]
    return (
      <nav
        class={displayClass ?? ""}
        aria-label="语言版本"
        lang="zh-CN"
        style={{ display: "flex", gap: "0.5rem" }}
      >
        {languages.map(({ label, name, base }) => {
          const url = new URL(base)
          url.pathname = url.pathname.replace(/\/$/, "") + (slug === "index" ? "/" : "/" + slug)
          return (
            <a class="language-switcher" href={url.toString()} aria-label={name}>
              {label}
            </a>
          )
        })}
      </nav>
    )
  }

  Component.css = styles
  return Component
}
