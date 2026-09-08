import { version } from "../../package.json"
import { QuartzComponent, QuartzComponentConstructor } from "./types"
import { joinSegments, pathToRoot } from "../util/path"
import ageGate from "./scripts/ageGate.inline"

interface Options {
  copyrightText: string
  links: Record<string, string>
}

const CustomFooter: QuartzComponentConstructor<Options> = (opts) => {
  const Footer: QuartzComponent = ({ displayClass, fileData }) => (
    <footer class={displayClass ?? ""} lang="zh-CN">
      <div class="footer-top">
        <p class="copyright">{opts.copyrightText}</p>
        <ul class="footer-links">
          {Object.entries(opts.links).map(([text, link]) => (
            <li>
              <a
                href={
                  link.startsWith("https://")
                    ? link
                    : joinSegments(pathToRoot(fileData.slug!), link)
                }
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p>
        由{" "}
        <a href={joinSegments(pathToRoot(fileData.slug!), "authors/asp")}>
          小亚历山大·斯皮里多诺夫
        </a>{" "}
        使用 <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a>
        {" · "}
        <a href={joinSegments(pathToRoot(fileData.slug!), "documents/")}>文件与政策</a>
      </p>
    </footer>
  )

  Footer.afterDOMLoaded =
    ageGate +
    `
    const openIssueZoom = (link) => {
      const reader = link.closest('.issue-reader')
      const pages = Array.from(reader.querySelectorAll('.issue-page'))
      let index = pages.indexOf(link.closest('.issue-page'))
      const video = document.createElement('video')
      video.controls = true; video.playsInline = true; video.preload = 'none'
      const dialog = document.createElement('dialog')
      dialog.className = 'issue-zoom'
      dialog.setAttribute('aria-label', '图像查看器')
      const bar = document.createElement('div')
      bar.className = 'issue-zoom-bar'
      const stage = document.createElement('div')
      stage.className = 'issue-zoom-stage'
      const img = document.createElement('img')
      if(link.querySelector('img')) {
        img.src = link.href
        img.alt = link.querySelector('img').alt
      }
      img.draggable = false
      stage.append(img, video)
      let scale = 1, x = 0, y = 0
      const points = new Map()
      const percent = document.createElement('span')
      percent.setAttribute('aria-live', 'polite')
      const draw = () => {
        const maxX = Math.max(0, (img.clientWidth * scale - stage.clientWidth) / 2)
        const maxY = Math.max(0, (img.clientHeight * scale - stage.clientHeight) / 2)
        x = Math.max(-maxX, Math.min(maxX, x))
        y = Math.max(-maxY, Math.min(maxY, y))
        img.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')'
        percent.textContent = Math.round(scale * 100) + '%'
      }
      const zoom = factor => { if(img.hidden)return; scale = Math.max(1, Math.min(5, scale * factor)); draw() }
      const button = (text, label, action) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = text
        b.setAttribute('aria-label', label); b.addEventListener('click', action); bar.append(b)
        return b
      }
      const previous = button('←', '上一页', () => showPage(index-1))
      const counter = document.createElement('span'); counter.setAttribute('aria-live','polite'); bar.append(counter)
      const next = button('→', '下一页', () => showPage(index+1))
      const less = button('−', '缩小', () => zoom(1/1.25))
      bar.append(percent)
      const more = button('+', '放大', () => zoom(1.25))
      const reset = button('↺', '适应窗口', () => {scale=1;x=0;y=0;draw()})
      button('×', '关闭', () => dialog.close())
      const showPage = target => {
        if(target<0||target>=pages.length)return
        index=target;video.pause();video.removeAttribute('src');video.load();points.clear();x=0;y=0
        const source=pages[index].querySelector('video')
        img.hidden=!!source;video.hidden=!source
        stage.style.touchAction=source?'auto':'none'
        if(source){video.src=source.querySelector('source')?.src||source.currentSrc;video.poster=source.poster;video.setAttribute('aria-label',source.getAttribute('aria-label')||'Video')}
        else {const image=pages[index].querySelector('img');img.src=pages[index].querySelector('a').href;img.alt=image.alt}
        for(const control of [less,more,reset,percent])control.hidden=!!source
        previous.disabled=index===0;next.disabled=index===pages.length-1;counter.textContent=(index+1)+' / '+pages.length
        draw()
      }
      dialog.append(bar, stage)
      document.body.append(dialog)
      const oldOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      dialog.addEventListener('close', () => {
        video.pause();video.removeAttribute('src');video.load()
        document.body.style.overflow = oldOverflow; dialog.remove()
        const track=reader.querySelector('.issue-pages')
        track.scrollBy({left:pages[index].getBoundingClientRect().left-track.getBoundingClientRect().left,behavior:'instant'})
        const focus=pages[index].querySelector('a,video');focus?.focus({preventScroll:true})
      }, {once:true})
      dialog.addEventListener('keydown', e => {
        if(e.target===video)return
        if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showPage(index+(e.key==='ArrowRight'?1:-1))}
        if(e.key==='+'||e.key==='=') {e.preventDefault();zoom(1.25)}
        if(e.key==='-') {e.preventDefault();zoom(1/1.25)}
      })
      stage.addEventListener('wheel', e => {e.preventDefault();zoom(e.deltaY < 0 ? 1.1 : 1/1.1)}, {passive:false})
      stage.addEventListener('pointerdown', e => {if(e.button!==0||img.hidden)return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});stage.setPointerCapture(e.pointerId)})
      stage.addEventListener('pointermove', e => {
        if(!points.has(e.pointerId))return
        const old = points.get(e.pointerId)
        const other = [...points.entries()].find(([id])=>id!==e.pointerId)?.[1]
        if(other) {
          const before = Math.hypot(old.x-other.x,old.y-other.y)
          const after = Math.hypot(e.clientX-other.x,e.clientY-other.y)
          if(before>0)scale=Math.max(1,Math.min(5,scale*after/before))
        } else {x+=e.clientX-old.x;y+=e.clientY-old.y}
        points.set(e.pointerId,{x:e.clientX,y:e.clientY});draw()
      })
      for(const event of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(event,e=>points.delete(e.pointerId))
      img.addEventListener('load',draw)
      dialog.showModal();showPage(index)
    }
    const initIssueReaders = () => {
      document.querySelectorAll('.issue-reader').forEach(reader => {
        if (reader.dataset.ready) return
        reader.dataset.ready = 'true'
        reader.querySelectorAll('.issue-page video').forEach(video => {
          const open = document.createElement('button')
          open.type = 'button'
          open.className = 'issue-open-viewer'
          open.textContent = '打开查看器'
          video.after(open)
          open.addEventListener('click', () => {
            reader.querySelectorAll('video').forEach(item=>item.pause())
            openIssueZoom(open)
          })
        })
        reader.querySelectorAll('.issue-page a').forEach(link => {
          link.addEventListener('click', event => {
            if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return
            event.preventDefault();event.stopPropagation()
            reader.querySelectorAll('video').forEach(video=>video.pause())
            openIssueZoom(link)
          })
        })
        const track = reader.querySelector('.issue-pages')
        const pages = Array.from(track.querySelectorAll('.issue-page'))
        const prev = reader.querySelector('[data-issue-prev]')
        const next = reader.querySelector('[data-issue-next]')
        const status = reader.querySelector('[data-issue-status]')
        let current = 0
        const update = () => {
          const left = track.getBoundingClientRect().left
          current = pages.reduce((best, page, i) => Math.abs(page.getBoundingClientRect().left-left) < Math.abs(pages[best].getBoundingClientRect().left-left) ? i : best, 0)
          status.textContent = (current + 1) + ' / ' + pages.length
          prev.disabled = current === 0
          next.disabled = current === pages.length - 1
          pages.forEach((page, i) => { if (i !== current) page.querySelector('video')?.pause() })
        }
        const go = delta => {
          const target = pages[Math.max(0, Math.min(pages.length - 1, current + delta))]
          track.scrollBy({left: target.getBoundingClientRect().left - track.getBoundingClientRect().left, behavior: 'instant'})
          update()
        }
        prev.addEventListener('click', () => go(-1))
        next.addEventListener('click', () => go(1))
        track.addEventListener('scroll', update, {passive: true})
        track.addEventListener('keydown', event => {
          if (event.target !== track) return
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); go(event.key === 'ArrowRight' ? 1 : -1) }
        })
        update()
      })
    }
    initIssueReaders()
    document.addEventListener('nav', initIssueReaders)
    const localizeBasesEntryCounts = () => {
      for (const element of document.querySelectorAll(".bases-view-meta")) {
        const match = element.textContent?.trim().match(/^Showing (\\d+) of (\\d+) entries$/)
        if (!match) continue

        const shown = Number(match[1])
        const total = Number(match[2])
        element.textContent = "显示 " + shown + " 项，共 " + total + " 项"
      }
    }

    localizeBasesEntryCounts()
    document.addEventListener("nav", localizeBasesEntryCounts)
  `

  return Footer
}

export default CustomFooter
