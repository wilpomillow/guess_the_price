import HeaderBar from "@/components/HeaderBar"
import Footer from "@/components/Footer"
import NeonGrid from "@/components/reactbits/NeonGrid"

export default function HowPage() {
  return (
    <main className="relative h-[100svh] overflow-hidden">
      <NeonGrid />

      <div className="relative z-10 flex h-[100svh] flex-col">
        <div className="mx-auto w-full max-w-5xl px-4 pt-4">
          <HeaderBar />
        </div>

        <div className="mx-auto w-full max-w-5xl flex-1 min-h-0 px-4 py-4">
          <div className="glass h-full rounded-[28px] p-5 shadow-soft md:p-6">
            <div className="text-3xl leading-none">How to play</div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="glass rounded-3xl p-4">
                <ol className="list-decimal space-y-2 pl-5 text-sm md:text-base">
                  <li>Drag the slider to set your price guess in <b>USD</b>.</li>
                  <li>Tap <b>SUBMIT</b> to lock it in.</li>
                  <li>
                    We reveal the <b>Actual Price</b> and animate the crowd distribution.
                  </li>
                  <li>
                    Use the <b>Reference</b> link to validate the real price.
                  </li>
                  <li>Tap <b>NEXT</b> to move on. Items won’t repeat until you restart.</li>
                </ol>
              </div>

              <div className="glass rounded-3xl p-4">
                <div className="text-sm tracking-wide" style={{ color: "var(--muted)" }}>
                  Tips
                </div>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm md:text-base">
                  <li>Go with your gut, then check the crowd spread.</li>
                  <li>Some items have weird price variance — that’s part of the fun.</li>
                  <li>On mobile, the layout is designed to stay in one view (no page scroll).</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
              Want to add items? Drop new <code>.mdx</code> files into <code>content/items</code>.
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  )
}
