import type { MetadataRoute } from "next"

/**
 * Web app manifest (served at /manifest.webmanifest): makes the app installable
 * ("Install app" / "Add to Home Screen"), opening full-screen without the browser bar.
 * Icons in public/icons/ were rendered from app/icon.svg; app/apple-icon.png is for iPhone.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrackMyRupee",
    short_name: "TrackMyRupee",
    description: "Track your income, expenses and budgets in ₹.",
    start_url: "/dashboard", // guests are sent to the home page to log in
    display: "standalone",
    background_color: "#EDF1F6", // splash screen, matches the light page background
    theme_color: "#3F86FF", // status/title bar, the logo's blue
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
