import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Keep the initial value deterministic for SSR/CSR to avoid hydration mismatch.
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const onChange = () => {
      setIsMobile(mql.matches)
    }

    // Sync immediately after mount.
    onChange()

    // Fallback for browsers/webviews that do not support addEventListener on MediaQueryList.
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    }

    mql.addListener(onChange)
    return () => mql.removeListener(onChange)
  }, [])

  return isMobile
}
