import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fromHtml } from "hast-util-from-html"
import { visit } from "unist-util-visit"

const pages = fs
  .readdirSync("content", { recursive: true })
  .filter((file) => file.endsWith(".md"))
  .filter((file) => /\nlang: zh-CN\r?\n/.test(fs.readFileSync(path.join("content", file), "utf8")))
assert.equal(pages.length, 15)
const base = "https://aleksandrspiridonov.github.io/catoblepaspress-zh/"
const problems = []
for (const file of pages) {
  const slug = file.replaceAll("\\", "/").replace(/\.md$/, "")
  const html = fs.readFileSync(path.join("public", slug + ".html"), "utf8")
  assert.match(html, /<html lang="zh-CN"/)
  assert.doesNotMatch(html, /class="translation-notice"/)
  const canonical = new URL(slug === "index" ? "" : slug.replace(/\/index$/, "/"), base)
  const tree = fromHtml(html)
  visit(tree, "element", (node) => {
    if (node.tagName === "link" && node.properties.rel?.includes("canonical")) {
      assert.equal(node.properties.href, canonical.href)
    }
    if (node.tagName !== "a" || typeof node.properties.href !== "string") return
    const href = node.properties.href
    const url = new URL(href, canonical)
    if (url.origin !== new URL(base).origin) return
    if (!url.pathname.startsWith("/catoblepaspress-zh/")) {
      problems.push(`${slug}: link escapes site prefix: ${href}`)
      return
    }
    const target = decodeURIComponent(url.pathname.slice("/catoblepaspress-zh/".length))
    const candidates = [target, target + ".html", path.join(target, "index.html")].map((p) =>
      path.join("public", p),
    )
    const found = candidates.find((p) => fs.existsSync(p) && fs.statSync(p).isFile())
    if (!found) problems.push(`${slug}: missing ${href}`)
    else if (url.hash && found.endsWith(".html")) {
      const id = decodeURIComponent(url.hash.slice(1))
      const targetTree = fromHtml(fs.readFileSync(found, "utf8"))
      let exists = false
      visit(targetTree, "element", (n) => {
        if (n.properties.id === id) exists = true
      })
      if (!exists) problems.push(`${slug}: missing anchor ${href}`)
    }
  })
}
assert.deepEqual(problems, [])
const original = fs.readFileSync("public/authors/asp.html", "utf8")
assert.match(original, /<html lang="ru-RU"/)
assert.match(original, /本页暂为俄文原文/)
assert.match(original, /href="https:\/\/catoblepaspress.ru\/authors\/asp"/)
assert.equal(fs.existsSync("public/CNAME"), false)
const scripts = fs
  .readdirSync("public", { recursive: true })
  .filter((f) => f.endsWith(".js"))
  .map((f) => fs.readFileSync(path.join("public", f), "utf8"))
  .join("\n")
assert.doesNotMatch(scripts, /mc\.yandex\.ru/)
assert.match(scripts, /catoblepas_zh_age_confirmed/)
console.log(
  `Verified ${pages.length} Chinese pages, internal links and anchors, Russian fallback, age notice, and analytics isolation.`,
)
