import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import * as ExternalPlugin from "./.quartz/plugins"
import CustomFooter from "./quartz/components/CustomFooter"
import LegacyOgImage from "./quartz/components/LegacyOgImage"
import { componentRegistry } from "./quartz/components/registry"
import { MediaAltText } from "./quartz/plugins/transformers/mediaAltText"
import { TranslationStatus } from "./quartz/plugins/transformers/translationStatus"
import type { ExplorerOptions } from "@quartz-community/explorer"

const priorityOrder: Record<string, number> = {
  "Книжный клуб": 1,
  Киноклуб: 2,
  关于出版社: 3,
  联系我们: 4,
  文件与政策: 5,
}

const sortExplorerEntries: NonNullable<ExplorerOptions["sortFn"]> = (a, b) => {
  if (a.isFolder !== b.isFolder) {
    return a.isFolder ? -1 : 1
  }

  const aName = a.displayName ?? ""
  const bName = b.displayName ?? ""
  const priorityDifference =
    (priorityOrder[aName] ?? Number.MAX_SAFE_INTEGER) -
    (priorityOrder[bName] ?? Number.MAX_SAFE_INTEGER)

  return (
    priorityDifference ||
    aName.localeCompare(bName, "zh-CN", {
      numeric: true,
      sensitivity: "base",
    })
  )
}

ExternalPlugin.Explorer({
  sortFn: sortExplorerEntries,
})

componentRegistry.setOptionOverrides("@quartz-community/og-image", {
  colorScheme: "darkMode",
  readingTimeText: () => "",
  imageStructure: LegacyOgImage,
})

const footer = CustomFooter({
  copyrightText: "© 2025–2026 Catoblepas 出版社",
  links: {
    Telegram: "https://t.me/catoblepaspress",
    YouTube: "https://www.youtube.com/@catoblepaspress",
    文件与政策: "documents/",
  },
})

const layoutOverrides = {
  defaults: {
    footer: [footer],
  },
  byPageType: {
    content: { footer: [footer] },
    folder: { footer: [footer] },
    tag: { footer: [footer] },
    "404": { footer: [footer] },
  },
}

const config = await loadQuartzConfig(undefined, layoutOverrides)
config.plugins.transformers.push(MediaAltText())
config.plugins.transformers.push(TranslationStatus())
export default config
export const layout = await loadQuartzLayout(layoutOverrides)
