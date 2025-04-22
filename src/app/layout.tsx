import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import AppHeader from "@/components/AppHeader";
import { Box } from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reminders",
  description: "Track your account deactivation reminders",
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
          <AppHeader />
          <Box component="main" sx={{ p: 3 }}>
            {children}
          </Box>
        </Providers>
      </body>
    </html>
  );
}
