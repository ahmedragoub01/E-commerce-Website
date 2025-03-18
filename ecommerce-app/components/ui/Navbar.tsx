'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { 
  ShoppingCart, 
  Search, 
  User, 
  Heart, 
  Menu, 
} from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const cartItemsCount = 3;
  const wishlistItemsCount = 2;
  
  const mainCategories = [
    { name: 'Electronics', href: '/products/electronics' },
    { name: 'Fashion', href: '/products/fashion' },
    { name: 'Home & Garden', href: '/products/home-garden' },
    { name: 'Collectibles', href: '/products/collectibles' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <Link href="/" className="font-bold text-2xl">ShopHub</Link>
              {mainCategories.map((category) => (
                <SheetClose key={category.name} asChild>
                  <Link href={category.href} className="text-lg font-medium hover:text-indigo-600">
                    {category.name}
                  </Link>
                </SheetClose>
              ))}
            </SheetContent>
          </Sheet>
          
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl text-indigo-600">ShopHub</Link>

          {/* Desktop Navigation */}
          <NavigationMenu>
            <NavigationMenuList>
              {['Products', 'Auctions', 'About', 'Contact'].map((item) => (
                <NavigationMenuItem key={item}>
                  <Link href={`/${item.toLowerCase()}`} legacyBehavior passHref>
                    <NavigationMenuLink className={`px-3 rounded-full py-2 text-sm font-medium ${pathname === `/${item.toLowerCase()}` ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}>
                      {item}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}

              {session?.user?.role === 'admin' && (
                <NavigationMenuItem>
                  <Link href="/admin" legacyBehavior passHref>
                    <NavigationMenuLink className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800">
                      Admin Panel
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistItemsCount > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5">{wishlistItemsCount}</Badge>}
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5">{cartItemsCount}</Badge>}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="User Image" className="h-5 w-5 rounded-full" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {session ? (
                  <>
                    <DropdownMenuItem disabled>
                      <div className="flex items-center space-x-2">
                        {session.user.image && (
                          <img src={session.user.image} alt="User Image" className="h-6 w-6 rounded-full" />
                        )}
                        <span>{session.user.name}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => signIn()}>Login</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
