import type { Metadata } from 'next'
import './globals.css'
import Chatbot from './components/Chatbot'

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
        <Chatbot />
      </body>
    </html>
  )
}
