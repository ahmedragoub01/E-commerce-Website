import "./../globals.css"; // Important - include global styles
import { Inter } from "next/font/google";
import { Providers } from "../providers";
import QueryProvider from "../providers/QueryProvider";
import { initializeServerServices } from "@/lib/serverInit";
import { SidebarLayout } from "@/components/ui/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin Dashboard",
  description: "E-commerce Admin Panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  initializeServerServices();
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <QueryProvider>
          <Providers>
            <div className="flex min-h-screen bg-gray-100">
              <SidebarLayout children={undefined} />
              <main className="flex-1 p-8 overflow-auto">
                {children}
              </main>
            </div>
          </Providers>
        </QueryProvider>
      </body>
    </html>
  );
}