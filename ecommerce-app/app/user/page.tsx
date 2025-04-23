"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function BlueCartHomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { status } = useSession();
  const router = useRouter();

  // Redirect to home if user is logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/home");
    }
  }, [status, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % 2);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className=" text-gray-900 min-h-screen">
      {/* Hero Slider */}
      <section className="relative h-[600px] overflow-hidden">
        <div
          className={`flex transition-transform duration-500 ease-in-out h-full ${
            currentSlide === 0 ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="min-w-full relative">
            <div className="absolute inset-0 bg-black opacity-30 blur-2xl z-10"></div>
            <Image
              src="/hero-1.webp"
              alt="BlueCart"
              priority
              fill
              sizes="100vw"
              className="object-cover filter brightness-75"
            />
            <div className="absolute inset-0 bg-black-500/10 flex items-center justify-center text-center z-20">
              <div className="text-white">
                <h1 className="text-5xl font-bold mb-4">BlueCart</h1>
                <p className="text-2xl mb-8">Discover Unique Products</p>
                <Link href="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full cursor-pointer">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="min-w-full relative">
            <div className="absolute inset-0 bg-black opacity-30 blur-2xl z-10"></div>
            <Image
              src="/hero-2.webp"
              alt="Quality Guaranteed"
              priority
              fill
              sizes="100vw"
              className="object-cover filter brightness-75"
            />
            <div className="absolute inset-0 bg-black-500/10  bg-opacity-40 flex items-center justify-center text-center z-20">
              <div className="text-white">
                <h1 className="text-5xl font-bold mb-4">Quality Guaranteed</h1>
                <p className="text-2xl mb-8">
                  Premium Products, Unbeatable Prices
                </p>
                <Link href="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full cursor-pointer">
                    Explore Collection
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Navigation */}
        <div className="absolute inset-0 flex items-center justify-between px-4 z-30">
          <Button
            variant="ghost"
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 cursor-pointer"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + 2) % 2)}
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </Button>
          <Button
            variant="ghost"
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 cursor-pointer"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % 2)}
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto py-16 px-4">
        <h2 className="text-4xl text-primary font-bold text-center mb-12">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300  border-none">
            <div className="relative h-80 overflow-hidden">
              <Image
                src="/Products/product-3-1.png"
                alt="Modern Headphones"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform group-hover:scale-110 duration-300"
              />
              <div className="absolute inset-0 bg-black-500/10  group-hover:bg-opacity-20 transition-all duration-300"></div>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Modern Headphones</h3>
              <div className="flex justify-center items-center mb-4">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < 4
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">(4.8)</span>
              </div>
              <div className="flex justify-center items-center space-x-4">
                <span className="text-2xl font-bold text-blue-600">
                  $129.99
                </span>
                <Link href="/login">
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer"
                  >
                    Add to Cart
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300  border-none">
            <div className="relative h-80 overflow-hidden">
              <Image
                src="/Products/product-2-2.png"
                alt="Smart Watch"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform group-hover:scale-110 duration-300"
              />
              <div className="absolute inset-0 bg-black-500/10 group-hover:bg-opacity-20 transition-all duration-300"></div>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Smart Watch</h3>
              <div className="flex justify-center items-center mb-4">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < 4
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">(4.7)</span>
              </div>
              <div className="flex justify-center items-center space-x-4">
                <span className="text-2xl font-bold text-blue-600">
                  $199.99
                </span>
                <Link href="/login">
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer"
                  >
                    Add to Cart
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300  border-none">
            <div className="relative h-80 overflow-hidden">
              <Image
                src="/Products/product-7-2.png"
                alt="Coffee Maker"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform group-hover:scale-110 duration-300"
              />
              <div className="absolute inset-0 bg-black-500/10 group-hover:bg-opacity-20 transition-all duration-300"></div>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Coffee Maker</h3>
              <div className="flex justify-center items-center mb-4">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < 4
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">(4.5)</span>
              </div>
              <div className="flex justify-center items-center space-x-4">
                <span className="text-2xl font-bold text-blue-600">$89.99</span>
                <Link href="/login">
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer"
                  >
                    Add to Cart
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
