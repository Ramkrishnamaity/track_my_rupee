export const THEME_STORAGE_KEY = "tmr-theme"

// Runs in <head> before first paint: applies the saved theme, or the OS preference.
const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()`

export function ThemeScript() {
  // text/plain on the client stops React's "script tag while rendering" warning;
  // the script already ran from the server HTML.
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}
