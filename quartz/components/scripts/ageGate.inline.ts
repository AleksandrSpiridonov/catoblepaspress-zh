// The age notice is independent of analytics on the Chinese site.
const ageKey = "catoblepas_zh_age_confirmed"
let confirmedThisVisit = false

function showAgeNotice() {
  if (confirmedThisVisit || document.getElementById("age-gate")) return
  try {
    if (localStorage.getItem(ageKey) === "confirmed") return
  } catch {
    /* Confirmation remains available when storage is blocked. */
  }

  const gate = document.createElement("dialog")
  gate.id = "age-gate"
  gate.className = "age-gate"
  gate.lang = "zh-CN"
  gate.setAttribute("aria-labelledby", "age-gate-title")
  gate.setAttribute("aria-describedby", "age-gate-description")
  gate.innerHTML = `<div class="age-gate__dialog">
    <p class="age-gate__mark" aria-hidden="true">18+</p>
    <h2 id="age-gate-title">请确认您的年龄</h2>
    <p id="age-gate-description">本站内容仅供年满18岁的读者浏览。</p>
    <button type="button" data-age-confirm>我已年满18岁</button>
  </div>`
  gate.addEventListener("cancel", (event) => event.preventDefault())
  gate.querySelector("button")!.addEventListener("click", () => {
    confirmedThisVisit = true
    try {
      localStorage.setItem(ageKey, "confirmed")
    } catch {
      /* Session only. */
    }
    gate.close()
    gate.remove()
    document.documentElement.classList.remove("age-gate-open")
  })
  document.body.append(gate)
  document.documentElement.classList.add("age-gate-open")
  gate.showModal()
}

document.addEventListener("nav", showAgeNotice)
showAgeNotice()

export default ""
