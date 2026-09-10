import type { QuartzTransformerPlugin } from "../types"
import { canonicalUrlForSlug } from "../../util/seo"

/** Keep source-language pages readable and explicitly identified during translation. */
export const TranslationStatus: QuartzTransformerPlugin = () => ({
  name: "TranslationStatus",
  htmlPlugins: () => [
    () => (tree, file) => {
      if (file.data.frontmatter?.lang === "zh-CN") return
      const italian = file.data.frontmatter?.lang === "it-IT"
      if (file.data.frontmatter) file.data.frontmatter.lang = italian ? "it-IT" : "ru-RU"
      tree.children.unshift({
        type: "element",
        tagName: "aside",
        properties: { className: ["translation-notice"], lang: "zh-CN" },
        children: [
          {
            type: "text",
            value: italian
              ? "本页诗歌保留意大利文原文，未译为中文。"
              : "本页保留俄文内容，未译为中文。",
          },
          {
            type: "element",
            tagName: "a",
            properties: {
              href: canonicalUrlForSlug("catoblepaspress.ru", file.data.slug ?? "index"),
            },
            children: [{ type: "text", value: "查看俄文主站" }],
          },
        ],
      })
    },
  ],
})
