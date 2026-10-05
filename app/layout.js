import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import Preloader from "../components/Preloader";
import Effects from "../components/Effects";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", axes: ["wdth", "opsz"] });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

const title = "Biswajit Saha — Data × Product × Business";
const description =
  "Business Analyst (Product & Analytics). Building data-driven systems that turn complex business problems into actionable decisions.";

export const metadata = {
  metadataBase: new URL("https://biswajit-data-product.vercel.app"),
  title,
  description,
  openGraph: { title, description, type: "website", siteName: "Biswajit Saha" },
  twitter: { card: "summary_large_image", title, description },
};

// Runs before first paint: theme (stored or system) + whether to skip the intro.
const boot = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';d.setAttribute('data-theme',t);if(sessionStorage.getItem('seen')||matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('seen')}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <Preloader />
        <Effects />
        {children}
      </body>
    </html>
  );
}
