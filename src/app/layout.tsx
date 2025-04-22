import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Box } from "@mui/material";
import AppHeader from "@/components/AppHeader";
import Providers from "@/components/Providers";
import { LoadingProvider } from "@/components/LoadingContext";

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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <LoadingProvider>
            <AppHeader />
            <Box component="main" sx={{ p: 3 }}>
              {children}
            </Box>
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
