export const API_ORIGIN = (
  process.env.EWARRANTY_API_ORIGIN ||
  process.env.NEXT_PUBLIC_EWARRANTY_URL ||
  "https://servvistagcp-001-site12.anytempurl.com"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");
