import { CheckInPanel } from "@/components/CheckInPanel";
import { NeonDinerGame } from "@/components/game/NeonDinerGame";
import { WalletBar } from "@/components/WalletBar";
import { WrongNetworkBanner } from "@/components/WrongNetworkBanner";
import { strings } from "@/lib/strings";

export default function Home() {
  return (
    <div className="scanlines relative min-h-dvh px-3 pb-10 pt-6 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,221,0.06)_0%,transparent_55%)]" />
      <div className="relative z-10 mx-auto flex max-w-lg flex-col gap-5">
        <header className="text-center">
          <h1
            className="bg-gradient-to-r from-[#00fff0] via-[#ff00dd] to-[#b7ff00] bg-clip-text font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-transparent drop-shadow-[0_0_24px_rgba(0,255,240,0.35)] sm:text-4xl"
          >
            {strings.title}
          </h1>
          <p className="mt-1 text-sm text-white/50">{strings.tagline}</p>
        </header>

        <WalletBar />
        <WrongNetworkBanner />

        <section className="rounded-2xl border border-cyan-500/15 bg-[#080c14]/80 p-4 shadow-[inset_0_1px_0_rgba(0,255,255,0.06)] backdrop-blur-sm">
          <NeonDinerGame />
        </section>

        <CheckInPanel />
      </div>
    </div>
  );
}
