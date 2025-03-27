"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import DarkModeToggle from "@/components/DarkModeToggle";
import {
  ShoppingCart,
  User,
  Menu,
  LogOut,
  LogIn,
  Package,
  Heart,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  // Animation for navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Simulate fetching cart items count from localStorage or sessionStorage
  useEffect(() => {
    const getCartFromStorage = () => {
      if (typeof window !== "undefined") {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          try {
            const cartData = JSON.parse(storedCart);
            return Array.isArray(cartData) ? cartData.length : 0;
          } catch (e) {
            return 0;
          }
        }
      }
      return 0;
    };

    setCartItemsCount(getCartFromStorage());

    const handleStorageChange = (e: any) => {
      if (e.key === "cart") {
        setCartItemsCount(getCartFromStorage());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const isActive = (path: any) => {
    return pathname === path;
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 
        ${
          scrolled
            ? "bg-background/70 backdrop-blur-md shadow-lg h-16"
            : "bg-background h-20 backdrop-blur-none"
        }`}
    >
      <div className="container mx-auto flex items-center justify-between h-full max-w-7xl">
        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:rotate-12 transition-transform"
              >
                <Menu className="h-6 w-6 text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 p-6 bg-gradient-to-b from-blue-50 to-white"
            >
              <div className="flex items-center justify-between mb-4">
                <SheetClose asChild>
                  <Link href="/" className="flex items-center">
                    <Image
                      src="/logo.svg"
                      alt="Blue Cart Logo"
                      priority
                      width={200}
                      height={47}
                    />
                  </Link>
                </SheetClose>
                <DarkModeToggle />
              </div>
              <nav className="mt-6 flex flex-col gap-4">
                <Link href="/home">
                  <Button
                    variant={isActive("/home") ? "default" : "ghost"}
                    className={`text-lg transition-all duration-300 w-full ${
                      isActive("/home")
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-primary hover:text-blue-600 hover:translate-x-2"
                    }`}
                  >
                    Products
                  </Button>
                </Link>
                <Link href="/auctions">
                  <Button
                    variant={isActive("/auctions") ? "default" : "ghost"}
                    className={`text-lg transition-all duration-300 w-full ${
                      isActive("/auctions")
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-primary hover:text-blue-600 hover:translate-x-2"
                    }`}
                  >
                    Auctions
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button
                    variant={isActive("/orders") ? "default" : "ghost"}
                    className={`text-lg transition-all duration-300 w-full ${
                      isActive("/orders")
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-primary hover:text-blue-600 hover:translate-x-2"
                    }`}
                  >
                    Orders
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant={isActive("/about") ? "default" : "ghost"}
                    className={`text-lg transition-all duration-300 w-full ${
                      isActive("/about")
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-primary hover:text-blue-600 hover:translate-x-2"
                    }`}
                  >
                    About
                  </Button>
                </Link>
                <div className="flex items-center gap-4">
                  <DarkModeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2 group">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Blue Cart Logo"
              width={200}
              height={47}
              className="transition-all duration-300 group-hover:scale-105"
            />
          </Link>
          <span className="hidden lg:inline-block text-gray-500 transition-all duration-300 origin-left group-hover:scale-x-110">
            Shopping made simple!
          </span>
        </div>

        {/* Menu for Desktop */}
        <nav className=" hidden lg:flex gap-8">
          <Link href="/home">
            <Button
              variant="ghost"
              className={`text-primary relative transition-all duration-300 hover:scale-110 hover:text-blue-600 ${
                isActive("/home") ? "font-semibold text-blue-600" : ""
              }`}
            >
              Products
              {isActive("/home") && (
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-600 rounded-full animate-pulse" />
              )}
            </Button>
          </Link>
          <Link href="/auctions">
            <Button
              variant="ghost"
              className={`text-primary relative transition-all duration-300 hover:scale-110 hover:text-blue-600 ${
                isActive("/auctions") ? "font-semibold text-blue-600" : ""
              }`}
            >
              Auctions
              {isActive("/auctions") && (
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-600 rounded-full animate-pulse" />
              )}
            </Button>
          </Link>
          <Link href="/orders">
            <Button
              variant="ghost"
              className={`text-primary relative transition-all duration-300 hover:scale-110 hover:text-blue-600 ${
                isActive("/orders") ? "font-semibold text-blue-600" : ""
              }`}
            >
              <Package className="h-4 w-4 mr-1 inline-block" />
              Orders
              {isActive("/orders") && (
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-600 rounded-full animate-pulse" />
              )}
            </Button>
          </Link>
          <Link href="/about">
            <Button
              variant="ghost"
              className={`text-primary relative transition-all duration-300 hover:scale-110 hover:text-blue-600 ${
                isActive("/about") ? "font-semibold text-blue-600" : ""
              }`}
            >
              About
              {isActive("/about") && (
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-600 rounded-full animate-pulse" />
              )}
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4 relative">
          <Link href="/wishlist">
            <Button
              variant="ghost"
              size="icon"
              className="hover:rotate-12 transition-transform hover:text-blue-600"
            >
              <Heart className="h-5 w-5 text-primary" />
            </Button>
          </Link>

          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:rotate-12 transition-transform hover:text-blue-600"
            >
              <ShoppingCart className="h-5 w-5 text-primary" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-bounce">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="transition-transform hover:scale-110"
              >
                {session?.user?.image ? (
                  <div className="relative w-8 h-8 overflow-hidden rounded-full ring-2 ring-blue-600 ring-offset-2">
                    <Image
                      src={session?.user?.image || "/default-avatar.png"}
                      alt="User"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 animate-slideDown cursor-pointer"
            >
              {session ? (
                <>
                  <DropdownMenuItem disabled className="opacity-70">
                    <div className="flex items-center gap-2">
                      {session.user.image && (
                        <div className="relative w-6 h-6 overflow-hidden rounded-full">
                          <Image
                            src={session?.user?.image || "/default-avatar.png"}
                            alt="User"
                            fill
                            className="object-cover"
                            priority
                          />
                        </div>
                      )}
                      <span className="font-medium truncate">
                        {session.user.name}
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <Link href="/profile">
                    <DropdownMenuItem className="hover:bg-blue-50">
                      <User className="h-4 w-4 mr-2 text-blue-600" /> Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/orders">
                    <DropdownMenuItem className="hover:bg-blue-50">
                      <Package className="h-4 w-4 mr-2 text-blue-600" /> My
                      Orders
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={() => signIn()}
                  className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                >
                  <LogIn className="h-4 w-4 mr-2" /> Login
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
