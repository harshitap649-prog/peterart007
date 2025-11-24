import Link from 'next/link'
import { FiInstagram, FiTwitter, FiYoutube, FiMail, FiArrowUpRight } from 'react-icons/fi'

export default function SiteFooter() {
  return (
    <footer className="mt-12 px-3 pb-28 pt-10 text-[var(--text-secondary)] md:px-6 md:pb-12">
      <div className="mx-auto w-full max-w-6xl rounded-[32px] border border-black/5 bg-gradient-to-br from-white via-[#fdf5ef] to-[#f4f7fb] px-5 py-8 shadow-lift backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-lg font-bold text-white shadow-md shadow-orange-500/30">
                PA
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">Peter Art</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">A mobile-native art house</p>
              </div>
            </div>
            <p className="max-w-lg text-sm text-[var(--text-secondary)]">
              Discover drip-worthy art drops, commission originals, and follow India&apos;s most exciting creators in a curated experience tuned for mobile.
            </p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-lg shadow-black/5 md:max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-secondary)]">Stay in the know</p>
            <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">Weekly insider drops, early commissions, art-care tips.</p>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Email address"
                className="input-field border-black/10 bg-white text-sm"
                aria-label="Email address"
              />
              <button type="button" className="btn-primary w-full justify-center sm:w-auto">
                Join waitlist
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 grid gap-8 text-sm text-[var(--text-secondary)] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">Marketplace</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/user?tab=artworks" className="transition hover:text-[var(--text-primary)]">Discover Artworks</Link></li>
              <li><Link href="/user?tab=wishlist" className="transition hover:text-[var(--text-primary)]">Wishlist</Link></li>
              <li><Link href="/user?tab=orders" className="transition hover:text-[var(--text-primary)]">Orders & Tracking</Link></li>
              <li><Link href="/user?tab=giftcards" className="transition hover:text-[var(--text-primary)]">Gift Cards</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">For Artists</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/artist/apply" className="transition hover:text-[var(--text-primary)]">Apply as Artist</Link></li>
              <li><Link href="/user?tab=artist" className="transition hover:text-[var(--text-primary)]">Artist Dashboard</Link></li>
              <li><Link href="/user?tab=artworks" className="transition hover:text-[var(--text-primary)]">Commission Playbook</Link></li>
              <li><Link href="/user?tab=support" className="transition hover:text-[var(--text-primary)]">Payout Help Desk</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">Support</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/user?tab=support" className="transition hover:text-[var(--text-primary)]">Help Center</Link></li>
              <li><Link href="/user?tab=orders" className="transition hover:text-[var(--text-primary)]">Shipping & Returns</Link></li>
              <li><Link href="/user?tab=artworks" className="transition hover:text-[var(--text-primary)]">Community Guidelines</Link></li>
              <li><Link href="/user?tab=support" className="transition hover:text-[var(--text-primary)]">Privacy & Terms</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">Studio</p>
            <p className="mt-3 text-[var(--text-primary)]">Live concierge 9am – 11pm IST</p>
            <p className="text-xs text-[var(--text-secondary)]">hello@peterart.com</p>
            <p className="text-xs text-[var(--text-secondary)]">+91 98765 43210</p>
            <Link
              href="/messages"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-primary)] hover:border-black/20"
            >
              Open chat
              <FiArrowUpRight />
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-black/5 pt-6 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Peter Art. All rights reserved.</p>
          <div className="flex items-center gap-4 text-lg text-[var(--text-primary)]">
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
    </footer>
  )
}

