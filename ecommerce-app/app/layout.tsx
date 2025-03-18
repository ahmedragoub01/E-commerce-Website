import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Providers } from "./providers";
import QueryProvider from "./providers/QueryProvider";
import PageTransition from "@/components/PageTransition"; // Import the client component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "E-commerce App",
  description: "A fullstack e-commerce application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <PageTransition>{children}</PageTransition> 
              </main>
              <Footer />
            </div>
          </Providers>
        </QueryProvider>
      </body>
    </html>
  );
}
