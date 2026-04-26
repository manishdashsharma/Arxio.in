import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Arxio — AI Research Assistant",
  description:
    "Upload any research paper and get a complete 15-slide presentation, cheat sheet, Q&A prep, and flashcards in under 10 minutes.",
  metadataBase: new URL("https://arxio.in"),
  openGraph: {
    title: "Arxio — AI Research Assistant",
    description:
      "Upload tonight. Present in the morning. Arxio turns your research paper into a complete presentation in 10 minutes.",
    url: "https://arxio.in",
    siteName: "Arxio",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable} h-full`}>
      <body className="min-h-full antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
