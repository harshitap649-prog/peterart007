import Link from 'next/link'
import { FiInstagram, FiTwitter, FiYoutube, FiMail } from 'react-icons/fi'

export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-[#050814] text-gray-300">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/0" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
          {/* CTA */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-[0_30px_120px_-60px_rgba(255,255,255,0.8)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">Stay inspired</p>
            <h3 className="mt-2 text-2xl font-bold text-white">
              Collect rare art, commission originals, support emerging artists.
            </h3>
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/user?tab=artworks"
                className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-white/20 transition hover:-translate-y-0.5 hover:bg-gray-100 sm:w-auto"
              >
                Browse artworks
              </Link>
              <Link
                href="/artist/apply"
                className="w-full rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
              >
                Become an artist
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white">
                  PA
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Peter Art</p>
                  <p className="text-xs text-gray-400">Collect • Commission • Connect</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Premium digital platform to discover, commission, and collect art from celebrated contemporary artists across India.
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Marketplace</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/user?tab=artworks" className="transition hover:text-white">Discover Artworks</Link></li>
                <li><Link href="/user?tab=wishlist" className="transition hover:text-white">Wishlist</Link></li>
                <li><Link href="/user?tab=orders" className="transition hover:text-white">Orders & Tracking</Link></li>
                <li><Link href="/user?tab=giftcards" className="transition hover:text-white">Gift Cards</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">For Artists</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/artist/apply" className="transition hover:text-white">Apply as Artist</Link></li>
                <li><Link href="/user?tab=artist" className="transition hover:text-white">Artist Dashboard</Link></li>
                <li><Link href="/user?tab=artworks" className="transition hover:text-white">Commission Guide</Link></li>
                <li><Link href="/user?tab=support" className="transition hover:text-white">Payout Help</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Support</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/user?tab=support" className="transition hover:text-white">Help Center</Link></li>
                <li><Link href="/user?tab=orders" className="transition hover:text-white">Shipping & Returns</Link></li>
                <li><Link href="/user?tab=artworks" className="transition hover:text-white">Community Guidelines</Link></li>
                <li><Link href="/user?tab=support" className="transition hover:text-white">Privacy & Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/5 pt-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Peter Art. All rights reserved.</p>
            <div className="flex items-center gap-4 text-lg text-white">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="transition hover:text-orange-400">
                <FiInstagram />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="transition hover:text-orange-400">
                <FiTwitter />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="transition hover:text-orange-400">
                <FiYoutube />
              </a>
              <a href="mailto:hello@peterart.com" className="transition hover:text-orange-400">
                <FiMail />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

