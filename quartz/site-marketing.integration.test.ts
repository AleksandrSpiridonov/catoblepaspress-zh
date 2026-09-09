import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"
import { yandexMetrikaScript } from "./util/analytics"
import { canonicalUrlForSlug } from "./util/seo"

test("Chinese project site keeps the base path in home, folder and book canonical URLs", () => {
  const base = "aleksandrspiridonov.github.io/catoblepaspress-zh"
  assert.equal(canonicalUrlForSlug(base, "index"), `https://${base}/`)
  assert.equal(canonicalUrlForSlug(base, "published/index"), `https://${base}/published/`)
  assert.equal(
    canonicalUrlForSlug(base, "published/biastape"),
    `https://${base}/published/biastape`,
  )
})

test("production homepage exposes the canonical marketing and analytics contract", () => {
  assert.equal(canonicalUrlForSlug("catoblepaspress.ru", "index"), "https://catoblepaspress.ru/")
  assert.equal(
    canonicalUrlForSlug("catoblepaspress.ru", "published/biastape"),
    "https://catoblepaspress.ru/published/biastape",
  )

  const javascript = yandexMetrikaScript(111323493)
  assert.match(javascript, /mc\.yandex\.ru\/metrika\/tag\.js\?id=111323493/)
  assert.match(javascript, /ym\(111323493,\s*["']init["']/)
  assert.match(javascript, /catoblepas_cookie_consent/)
  assert.match(javascript, /catoblepas_age_confirmed/)
  assert.match(javascript, /setAttribute\(["']role["'], ["']dialog["']\)/)
  assert.match(javascript, /setAttribute\(["']aria-modal["'], ["']true["']\)/)
  assert.match(javascript, /data-age-confirm/)
  assert.match(javascript, />Мне уже исполнилось 18 лет<\/button>/)
  assert.match(javascript, /data-cookie-consent-grant/)
  assert.match(javascript, />Разрешить аналитику<\/button>/)
  assert.match(javascript, />Отключить аналитику<\/button>/)
  assert.match(javascript, /data-cookie-consent-close/)
  assert.match(javascript, /aria-label="Закрыть"/)
  assert.doesNotMatch(javascript, /data-cookie-choice/)
  assert.match(javascript, /webvisor:\s*false/)
  assert.doesNotMatch(javascript, /webvisor:\s*true/)
  assert.match(javascript, /addEventListener\(["']nav["']/)
  assert.match(javascript, /reachGoal/)
})

test("homepage offers current routes for reading, participation, support, and direct contact", () => {
  const homepage = readFileSync(join(process.cwd(), "content", "index.md"), "utf8")
  const bookclub = readFileSync(join(process.cwd(), "content", "projects", "bookclub.md"), "utf8")

  assert.match(homepage, /\[\[published\/biastape#订购\|/)
  assert.match(homepage, /\[\[journal\/index\|/)
  assert.match(homepage, /\[\[projects\/filmclub\|/)
  assert.match(homepage, /\[\[projects\/bookclub\|/)
  assert.match(homepage, /mailto:vox@catoblepaspress.ru/)
  assert.match(homepage, /mailto:ungh@catoblepaspress.ru/)
  assert.doesNotMatch(homepage, /\[\[№ 1 \(1\)\|Выпуск № 1 \(1\)\]\]/)
  assert.doesNotMatch(homepage, /## Редакция/)
  assert.match(bookclub, /## Ближайшая встреча/)
  const upcomingMeeting = bookclub.split("## Ближайшая встреча")[1]?.split("## Регламент")[0]
  assert.ok(upcomingMeeting, "Book club must announce an upcoming meeting")
  assert.match(upcomingMeeting, /\d{1,2} [а-я]+ \d{4} года, \d{1,2}:\d{2} МСК/)
})
