import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Food Label Checker (MVP)',
  description: 'Scan a barcode to understand ingredients with simple popovers.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white/60 backdrop-blur sticky top-0 z-10">
          <div className="container py-3 flex items-center justify-between">
            <div className="text-lg font-semibold">🍓 Food Label Checker</div>
            <div className="text-sm text-gray-500">MVP (Barcode-first)</div>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="container py-10 text-center text-xs text-gray-500">
          Built for demo • No medical advice
        </footer>
      </body>
    </html>
  )
}
