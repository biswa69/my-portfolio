import { Bricolage_Grotesque, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import Preloader from "../components/Preloader";
import Effects from "../components/Effects";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", axes: ["wdth", "opsz"] });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const mono = DM_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata = {
  title: "Biswajit Saha — Data × Product × Business",
  description:
    "Business Analyst (Product & Analytics). Building data-driven systems that turn complex business problems into actionable decisions.",
};

// Runs before first paint: theme (stored or system) + whether to skip the intro.
const boot = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';d.setAttribute('data-theme',t);if(sessionStorage.getItem('seen')||matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('seen')}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} data-theme="dark" suppressHydrationWarning>
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
