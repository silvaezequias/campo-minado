import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

export const fontFamily = Fredoka({
  variable: "--font-fredoka-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campo Minado - Ezequias Lopes",
  description: "Jogo de Campo Minado desenvolvido por Ezequias Lopes",
  openGraph: {
    title: "Campo Minado - Ezequias Lopes",
    description: "Jogue Campo Minado online",
    url: "https://campominado.ezequiaslopes.com",
    siteName: "Campo Minado",
    type: "website",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campo Minado - Ezequias Lopes",
    description: "Jogue Campo Minado online",
    images: ["/banner.png"],
  },
  authors: [
    {
      name: "Ezequias Lopes",
      url: "https://ezequiaslopes.com",
    },
  ],
  metadataBase: new URL("https://campominado.ezequiaslopes.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${fontFamily.className} antialiased`}>{children}</body>
    </html>
  );
}
