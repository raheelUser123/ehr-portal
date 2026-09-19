import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "SBH EHR Portal", template: "%s | SBH EHR Portal" },
  description: "Shalom Behavioral House behavioral health EHR and staff management portal.",
  applicationName: "SBH EHR Portal",
  icons: { icon: "/favicon.png", shortcut: "/favicon.png", apple: "/favicon.png" },
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}
