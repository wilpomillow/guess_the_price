import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

export type ItemFrontmatter = {
  itemID: string
  title: string
  imageUrl: string
  actualPrice: number
  referenceLink: string
}

const CONTENT_DIR = path.join(process.cwd(), "content", "items")

export function getAllItems(): ItemFrontmatter[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"))
  const items = files.map((f) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, f), "utf8")
    const { data } = matter(raw)
    
    const imageUrlRaw = String(data.imageUrl ?? "")
    const normalizedImageUrl = (imageUrlRaw.startsWith("/") ? imageUrlRaw : `/${imageUrlRaw}`).replace(/^\/??public\//, "/")

    const item: ItemFrontmatter = {
      itemID: String(data.itemID ?? ""),
      title: String(data.title ?? ""),
      imageUrl: normalizedImageUrl,
      actualPrice: Number(data.actualPrice ?? 0),
      referenceLink: String(data.referenceLink ?? "")
    }
    return item
  })
  return items.filter((x) => x.itemID && x.title && x.imageUrl)
}
