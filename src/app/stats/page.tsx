import HeaderBar from "@/components/HeaderBar"
import Footer from "@/components/Footer"
import NeonGrid from "@/components/reactbits/NeonGrid"
import StatsClient from "./StatsClient"

export default function StatsPage() {
  return (
    <main className="relative h-[100svh] overflow-hidden">
      <NeonGrid />

      <div className="relative z-10 flex h-[100svh] flex-col">
        <div className="mx-auto w-full max-w-5xl px-4 pt-4">
          <HeaderBar />
        </div>

        <div className="mx-auto w-full max-w-5xl flex-1 min-h-0 px-4 py-4">
          <div className="glass h-full rounded-[28px] p-5 shadow-soft md:p-6">
            <div className="text-3xl leading-none">Overall stats</div>
            <div className="mt-4">
              <StatsClient />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  )
}
