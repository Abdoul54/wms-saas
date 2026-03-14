
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Providers } from './providers'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import './globals.css'
import AppLayout from '@/components/app-layout';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html className={cn("font-sans", geist.variable)}>
      <body>
        <Providers session={session}>
          {
            session
              ? (
                <AppLayout>
                  {children}
                </AppLayout>
              )
              :
              children
          }
        </Providers>
      </body>
    </html>
  )
}