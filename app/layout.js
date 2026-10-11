import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Archivo carries everything you read (its width axis is kept for later); IBM Plex Mono is for small labels.
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
