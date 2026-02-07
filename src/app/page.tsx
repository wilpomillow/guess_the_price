import { getAllItems } from "@/lib/content"
import HeaderShell from "@/components/HeaderShell"

export default function Page() {
  const items = getAllItems()
  return <HeaderShell items={items} />
}
