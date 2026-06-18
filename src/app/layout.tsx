import "~/styles/globals.css";
import { ThemeProvider } from "~/components/theme-provider";

import { type Metadata } from "next";
import { Geist, Montserrat, Roboto } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "~/lib/utils";

const robotoHeading = Roboto({
  subsets: ["latin"],
  variable: "--font-heading",
});
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Corsair — AI Command Center",
  description:
    "Your AI employee for email & calendar. Connect Gmail and Calendar, describe what you want, and Corsair executes.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        geist.variable,
        "font-sans",
        montserrat.variable,
        robotoHeading.variable,
      )}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
