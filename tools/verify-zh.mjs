import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fromHtml } from "hast-util-from-html"
import { visit } from "unist-util-visit"
import { slugifyFilePath } from "@quartz-community/utils"

const pages = fs
  .readdirSync("content", { recursive: true })
  .filter((file) => file.endsWith(".md"))
  .filter((file) => /\nlang: zh-CN\r?\n/.test(fs.readFileSync(path.join("content", file), "utf8")))
assert.equal(pages.length, 57)
const base = "https://zh.catoblepaspress.ru/"
const problems = []
for (const file of pages) {
  const slug = slugifyFilePath(file.replaceAll("\\", "/"))
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
    assert.ok(!url.pathname.startsWith("/catoblepaspress-zh/"), `Old site prefix: ${href}`)
    const target = decodeURIComponent(url.pathname.slice(1))
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
const anthology = fs.readFileSync("public/projects/voxcatoblepae.html", "utf8")
assert.match(anthology, /阅读出版社与杂志的编辑方针（中文）/)
assert.doesNotMatch(anthology, /以下编辑方针保留俄文原文/)
for (const slug of ["about", "published/biastape", "published/new-ideas-in-art"]) {
  const html = fs.readFileSync(`public/${slug}.html`, "utf8")
  assert.doesNotMatch(html, /个人数据处理(?:政策|同意书)（俄文）|编辑方针（俄文）/)
}
const original = fs.readFileSync("public/publications/translations/index.html", "utf8")
assert.match(original, /<html lang="ru-RU"/)
assert.match(original, /本页保留俄文内容，未译为中文/)
assert.match(original, /href="https:\/\/catoblepaspress.ru\/publications\/translations(?:\/index)?\/?"/)
assert.equal(fs.readFileSync("public/CNAME", "utf8").trim(), "zh.catoblepaspress.ru")
const italian = fs.readFileSync("public/publications/duestatuette.html", "utf8")
assert.match(italian, /<html lang="it-IT"/)
assert.match(italian, /本页诗歌保留意大利文原文/)
assert.doesNotMatch(italian, /中文翻译尚未完成/)
const flies = fs.readFileSync("public/publications/fies.html", "utf8")
assert.match(flies, /<html lang="ru-RU"/)
assert.match(flies, /本页保留俄文内容/)
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
