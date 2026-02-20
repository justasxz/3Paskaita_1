import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Receptų Platforma',
  description: 'Dalinkitės savo receptais ir atraskite naujus!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lt">
      <body>
        {children}
      </body>
    </html>
  )
}
