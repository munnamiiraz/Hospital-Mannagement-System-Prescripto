import "./globals.css";
import Navbar from "../components/userComponents/Navbar";
import Footer from "../components/userComponents/Footer";
import { ReduxProvider } from "../providers/userProvider/ReduxProvider";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <ReduxProvider>
          <Navbar  />
          <main>{children}</main>
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
