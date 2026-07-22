/** Runs before paint to avoid light-mode flash when dark is saved. */
export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("gita-theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
