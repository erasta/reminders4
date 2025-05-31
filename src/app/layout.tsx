import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Box } from "@mui/material";
import AppHeader from "@/components/AppHeader";
import Providers from "@/components/Providers";
import { LoadingProvider } from "@/components/LoadingContext";
import I18nProvider from "@/components/I18nProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reminders App",
  description: "Manage your reminders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={inter.className}>
        <I18nProvider>
          <Providers>
            <LoadingProvider>
              <AppHeader />
              <Box component="main" sx={{ p: 2 }}>
                {children}
              </Box>
            </LoadingProvider>
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
