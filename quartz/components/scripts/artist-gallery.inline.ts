function initArtistGalleries() {
  document.querySelectorAll<HTMLElement>(".artist-gallery").forEach((gallery) => {
    if (gallery.dataset.ready) return
    const slides = Array.from(gallery.querySelectorAll<HTMLElement>(".artist-gallery-slide"))
    const thumbs = Array.from(gallery.querySelectorAll<HTMLButtonElement>("[data-art-index]"))
    const status = gallery.querySelector<HTMLElement>("[data-art-status]")!
    let current = 0
    const show = (index: number) => {
      current = (index + slides.length) % slides.length
      slides.forEach((slide, i) => { slide.hidden = i !== current })
      thumbs.forEach((thumb, i) => thumb.setAttribute("aria-pressed", String(i === current)))
      status.textContent = `${current + 1} / ${slides.length}`
      const strip = gallery.querySelector<HTMLElement>(".artist-gallery-thumbs")!
      const thumb = thumbs[current]
      strip.scrollTo({ left: thumb.offsetLeft - strip.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: "instant" })
    }
    gallery.querySelector("[data-art-prev]")!.addEventListener("click", () => show(current - 1))
    gallery.querySelector("[data-art-next]")!.addEventListener("click", () => show(current + 1))
    thumbs.forEach((thumb, i) => thumb.addEventListener("click", () => show(i)))
    const stage = gallery.querySelector<HTMLElement>(".artist-gallery-stage")!
    let swipe: { id: number; x: number; y: number } | undefined
    stage.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary) { swipe = undefined; return }
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY }
      stage.setPointerCapture(event.pointerId)
    })
    stage.addEventListener("pointerup", (event) => {
      if (!swipe || event.pointerId !== swipe.id) return
      const dx = event.clientX - swipe.x
      const dy = event.clientY - swipe.y
      swipe = undefined
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        show(current + (dx < 0 ? 1 : -1))
      }
    })
    for (const type of ["pointercancel", "lostpointercapture"]) {
      stage.addEventListener(type, () => { swipe = undefined })
    }
    gallery.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
      event.preventDefault()
      show(current + (event.key === "ArrowRight" ? 1 : -1))
      if ((event.target as HTMLElement).matches("[data-art-index]")) thumbs[current].focus({ preventScroll: true })
    })
    gallery.dataset.ready = "true"
    show(0)
  })
}
initArtistGalleries()
document.addEventListener("nav", initArtistGalleries)

export default ""
