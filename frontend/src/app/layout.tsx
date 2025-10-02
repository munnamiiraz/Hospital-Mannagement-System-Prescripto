import "./globals.css";
import Navbar from "../components/userComponents/Navbar";
import Footer from "../components/userComponents/Footer";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <Navbar  />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
