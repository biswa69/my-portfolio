import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Archivo carries everything you read (the name squeezes its width axis under the pointer); IBM Plex Mono is for small labels.
const sans = Archivo({ subsets: ["latin"], variable: "--font-sans", axes: ["wdth"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: "500", variable: "--font-mono" });

const title = "Biswajit Saha | Business Analyst, Product & Analytics";
const description =
  "Business Analyst (Product & Analytics) at BimaKavach. Cohort analysis automation, a 90,000+ policy migration, an AI voice bot pilot, RM allocation logic and KPI dashboards.";

export const metadata = {
  metadataBase: new URL("https://biswajit-data-product.vercel.app"),
  title,
  description,
  openGraph: { title, description, type: "website", siteName: "Biswajit Saha" },
  twitter: { card: "summary_large_image", title, description },
};

// the browser's own bar takes the page's colour on a phone
export const viewport = { themeColor: "#0d0c0b", colorScheme: "dark" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* sets the slide layout (see `.gated` in globals.css) before the first paint, so the page does not jump when the script loads;
            below 1024px wide the page is one plain column and there is no slide layout (keep equal to WIDE in components/Showcase.js) */}
        <script dangerouslySetInnerHTML={{ __html: "if(matchMedia('(min-width:1024px)').matches)document.documentElement.classList.add('gated')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
