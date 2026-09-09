import type { QuartzTransformerPlugin } from "../types"
import { canonicalUrlForSlug } from "../../util/seo"

/** Keep source-language pages readable and explicitly identified during translation. */
export const TranslationStatus: QuartzTransformerPlugin = () => ({
  name: "TranslationStatus",
  htmlPlugins: () => [
    () => (tree, file) => {
      if (file.data.frontmatter?.lang === "zh-CN") return
      if (file.data.frontmatter) file.data.frontmatter.lang = "ru-RU"
      tree.children.unshift({
        type: "element",
        tagName: "aside",
        properties: { className: ["translation-notice"], lang: "zh-CN" },
        children: [
          { type: "text", value: "本页暂为俄文原文，中文翻译尚未完成。" },
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
