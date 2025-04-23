"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  ShoppingCart,
  Box,
  ChevronLeft,
  ChevronRight,
  Tags,
  Gavel,
  Settings,
} from "lucide-react";

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  path: string;
};

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

function Sidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { icon: <Home size={20} />, label: "Dashboard", path: "/admin" },
    {
      icon: <ShoppingCart size={20} />,
      label: "Orders",
      path: "/admin/orders",
    },
    {
      icon: <Tags size={20} />,
      label: "Categories",
      path: "/admin/categories",
    },
    { icon: <Box size={20} />, label: "Products", path: "/admin/products" },
    { icon: <Gavel size={20} />, label: "Auctions", path: "/admin/auctions" }, // Changed icon to Gavel
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getActiveItem = () => {
    const matchingItem = menuItems.find((item) => pathname.endsWith(item.path));
    return matchingItem?.label || "Dashboard";
  };

  const [activeItem, setActiveItem] = useState(getActiveItem());
  useEffect(() => {
    setActiveItem(getActiveItem());
  }, [pathname]);

  return (
    <div
      className={`fixed flex flex-col h-full bg-white-800-1/2  text-black-700 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      style={{
        zIndex: 50,
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!isCollapsed && (
          <Image
            src="/Logo.svg"
            alt="My App Logo"
            width={120} // adapte la taille à ton besoin
            height={40}
            priority
          />
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-100-200"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2 p-4">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.path}
                onClick={() => setActiveItem(item.label)}
                className={`flex items-center w-full p-3 rounded-full transition-colors ${
                  activeItem === item.label
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white-600 flex items-center justify-center">
            <span className="text-sm">JD</span>
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
