// plugins/language-switcher/src/components.tsx
import { jsx } from "preact/jsx-runtime";
var styles = `.language-switcher {
  align-items: center;
  background: none;
  border: none;
  color: var(--darkgray);
  display: inline-flex;
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  height: 32px;
  justify-content: center;
  letter-spacing: 0.04em;
  margin: 0;
  padding: 0;
  text-decoration: none;
  width: 24px;
}`;
var LanguageSwitcher = (opts) => {
  const Component = ({ cfg, fileData, displayClass }) => {
    const slug = (fileData.slug ?? "index").replace(/\/index$/, "/");
    const languages = [
      { label: "RU", name: "\u67E5\u770B\u4FC4\u6587\u7248\u672C", base: opts.russianBaseUrl },
      { label: "EN", name: "\u67E5\u770B\u82F1\u6587\u7248\u672C", base: opts.englishBaseUrl },
      { label: "HI", name: "\u67E5\u770B\u5370\u5730\u8BED\u7248\u672C", base: opts.hindiBaseUrl }
    ];
    return /* @__PURE__ */ jsx(
      "nav",
      {
        class: displayClass ?? "",
        "aria-label": "\u8BED\u8A00\u7248\u672C",
        lang: "zh-CN",
        style: { display: "flex", gap: "0.5rem" },
        children: languages.map(({ label, name, base }) => {
          const url = new URL(base);
          url.pathname = url.pathname.replace(/\/$/, "") + (slug === "index" ? "/" : "/" + slug);
          return /* @__PURE__ */ jsx("a", { class: "language-switcher", href: url.toString(), "aria-label": name, children: label });
        })
      }
    );
  };
  Component.css = styles;
  return Component;
};
export {
  LanguageSwitcher
};
