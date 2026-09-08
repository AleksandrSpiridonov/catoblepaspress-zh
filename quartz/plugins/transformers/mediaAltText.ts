import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"
import type { QuartzTransformerPlugin } from "../types"

type MediaKind = "avatar" | "cover"

function getMediaFilename(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined

  const target = value
    .replace(/^\[\[/, "")
    .replace(/\]\]$/, "")
    .split("|")[0]
    .split("#")[0]
    .replace(/\\/g, "/")

  const filename = target.split("/").pop()
  return filename ? decodeURIComponent(filename).toLocaleLowerCase() : undefined
}

function getImageFilename(node: Element): string | undefined {
  const src = node.properties.src
  if (typeof src !== "string") return undefined

  const pathname = src.split(/[?#]/)[0].replace(/\\/g, "/")
  const filename = pathname.split("/").pop()
  return filename ? decodeURIComponent(filename).toLocaleLowerCase() : undefined
}

function makeAlt(kind: MediaKind, title: string): string {
  return kind === "avatar" ? title : `《${title}》封面`
}

export const MediaAltText: QuartzTransformerPlugin = () => ({
  name: "MediaAltText",
  htmlPlugins() {
    return [
      () => (tree: Root, file) => {
        const frontmatter = file.data.frontmatter
        if (typeof frontmatter !== "object" || frontmatter === null) return

        const title = frontmatter.title
        if (typeof title !== "string" || title.trim() === "") return

        const media = (["avatar", "cover"] as const)
          .map((kind) => ({ kind, filename: getMediaFilename(frontmatter[kind]) }))
          .filter(
            (item): item is { kind: MediaKind; filename: string } => item.filename !== undefined,
          )

        if (media.length === 0) return

        visit(tree, "element", (node) => {
          if (node.tagName !== "img") return
          if (typeof node.properties.alt === "string" && node.properties.alt.trim() !== "") return

          const filename = getImageFilename(node)
          const match = media.find((item) => item.filename === filename)
          if (match) node.properties.alt = makeAlt(match.kind, title.trim())
        })
      },
    ]
  },
})
