// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Clock, Tag, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Mock data - in a real app, this would come from your backend API
const featuredProducts = [
  {
    id: 1,
    name: 'Premium Headphones',
    image: '/api/placeholder/400/400',
    price: 129.99,
    rating: 4.8,
    reviews: 256
  },
  {
    id: 2,
    name: 'Smart Watch Pro',
    image: '/api/placeholder/400/400',
    price: 199.99,
    rating: 4.7,
    reviews: 182
  },
  {
    id: 3,
    name: 'Wireless Earbuds',
    image: '/api/placeholder/400/400',
    price: 89.99,
    rating: 4.5,
    reviews: 312
  },
  {
    id: 4,
    name: 'Portable Bluetooth Speaker',
    image: '/api/placeholder/400/400',
    price: 69.99,
    rating: 4.6,
    reviews: 198
  }
];

const upcomingAuctions = [
  {
    id: 1,
    name: 'Vintage Camera Collection',
    image: '/api/placeholder/400/400',
    currentBid: 450,
    endsIn: '2 days',
    bidders: 18
  },
  {
    id: 2,
    name: 'Signed Limited Edition Vinyl',
    image: '/api/placeholder/400/400',
    currentBid: 320,
    endsIn: '5 hours',
    bidders: 25
  },
  {
    id: 3,
    name: 'Antique Pocket Watch',
    image: '/api/placeholder/400/400',
    currentBid: 890,
    endsIn: '1 day',
    bidders: 32
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      image: '/api/placeholder/1200/600',
      title: 'New Arrivals',
      subtitle: 'Discover the latest tech gadgets',
      cta: 'Shop Now',
      link: '/products'
    },
    {
      image: '/api/placeholder/1200/600',
      title: 'Exclusive Auctions',
      subtitle: 'Bid on rare and unique items',
      cta: 'View Auctions',
      link: '/auctions'
    },
    {
      image: '/api/placeholder/1200/600',
      title: 'Limited Time Offers',
      subtitle: 'Save up to 50% on selected items',
      cta: 'See Deals',
      link: '/products?sale=true'
    }
  ];

  // Auto slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Slider */}
      <section className="relative h-96 overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide, index) => (
            <div key={index} className="min-w-full relative">
              <div className="absolute inset-0">
                <Image 
                  src={slide.image} 
                  alt={slide.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              </div>
              <div className="relative h-full flex flex-col justify-center items-center text-center text-white px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{slide.title}</h1>
                <p className="text-xl md:text-2xl mb-6">{slide.subtitle}</p>
                <Button 
                  variant="default" 
                  size="lg" 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  asChild
                >
                  <Link href={slide.link}>
                    {slide.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black bg-opacity-20 text-white hover:bg-opacity-30 ml-4"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black bg-opacity-20 text-white hover:bg-opacity-30 mr-4"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {heroSlides.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className={`h-2 w-2 p-0 rounded-full ${
                currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Electronics', 'Fashion', 'Home & Garden', 'Collectibles'].map((category, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-lg transition-all">
                <Link href={`/products?category=${category.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="h-40 bg-gray-200 relative overflow-hidden">
                    <Image 
                      src={`/api/placeholder/400/400`} 
                      alt={category}
                      fill
                      className="transition-transform group-hover:scale-105 duration-300"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 group-hover:text-indigo-600">{category}</h3>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Button variant="link" className="text-indigo-600 hover:text-indigo-800 flex items-center" asChild>
              <Link href="/products">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden transition-all hover:shadow-lg">
                <Link href={`/products/${product.id}`}>
                  <div className="h-48 relative overflow-hidden">
                    <Image 
                      src={product.image} 
                      alt={product.name}
                      fill
                      className="transition-transform hover:scale-105 duration-300"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600">{product.name}</h3>
                  </Link>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                    </div>
                    <span className="mx-1 text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{product.reviews} reviews</span>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Upcoming Auctions */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Auctions</h2>
            <Button variant="link" className="text-indigo-600 hover:text-indigo-800 flex items-center" asChild>
              <Link href="/auctions">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingAuctions.map(auction => (
              <Card key={auction.id} className="overflow-hidden transition-all hover:shadow-lg">
                <Link href={`/auctions/${auction.id}`}>
                  <div className="h-48 relative overflow-hidden">
                    <Image 
                      src={auction.image} 
                      alt={auction.name}
                      fill
                      className="transition-transform hover:scale-105 duration-300"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/auctions/${auction.id}`}>
                    <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600">{auction.name}</h3>
                  </Link>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm">
                      <Tag className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium">Current Bid:</span>
                      <span className="ml-1 text-green-600 font-bold">${auction.currentBid}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium">Ends in:</span>
                      <span className="ml-1">{auction.endsIn}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium">Bidders:</span>
                      <span className="ml-1">{auction.bidders}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" asChild>
                    <Link href={`/auctions/${auction.id}`}>
                      Place a Bid
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Alex Johnson',
                avatar: '/api/placeholder/100/100',
                text: 'Excellent service and fast shipping. The product quality exceeded my expectations. Will definitely shop here again!'
              },
              {
                name: 'Sarah Williams',
                avatar: '/api/placeholder/100/100',
                text: 'I won an auction for a rare collectible that I\'ve been searching for years. The bidding process was transparent and secure. Highly recommend!'
              },
              {
                name: 'Michael Chen',
                avatar: '/api/placeholder/100/100',
                text: 'Customer support was incredibly helpful when I had questions about my order. They went above and beyond to ensure I was satisfied with my purchase.'
              }
            ].map((testimonial, index) => (
              <Card key={index} className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden">
                    <Image 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                <p className="font-medium text-gray-900">{testimonial.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">Stay Updated</h2>
              <p className="text-indigo-100">Subscribe to our newsletter for exclusive deals, auction alerts, and more!</p>
            </div>
            <div>
              <div className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-white text-gray-900"
                />
                <Button variant="secondary">Subscribe</Button>
              </div>
              <p className="text-xs text-indigo-200 mt-2">By subscribing, you agree to our Privacy Policy and Terms of Service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections Carousel */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Collections</h2>
            <Button variant="link" className="text-indigo-600 hover:text-indigo-800 flex items-center" asChild>
              <Link href="/collections">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {[
                {
                  name: "Summer Essentials",
                  description: "Beat the heat with our top summer picks",
                  image: "/api/placeholder/600/400"
                },
                {
                  name: "Vintage Tech",
                  description: "Collectible gadgets from the past decades",
                  image: "/api/placeholder/600/400"
                },
                {
                  name: "Home Office",
                  description: "Upgrade your workspace with premium gear",
                  image: "/api/placeholder/600/400"
                },
                {
                  name: "Outdoor Adventure",
                  description: "Gear up for your next expedition",
                  image: "/api/placeholder/600/400"
                },
                {
                  name: "Smart Home",
                  description: "The latest in home automation technology",
                  image: "/api/placeholder/600/400"
                }
              ].map((collection, index) => (
                <CarouselItem key={index} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <Card className="overflow-hidden">
                    <Link href={`/collections/${collection.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="relative h-44 w-full">
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          fill
                          className="object-cover transition-transform hover:scale-105 duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-lg">{collection.name}</h3>
                        <p className="text-gray-500 text-sm">{collection.description}</p>
                      </CardContent>
                    </Link>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="overflow-hidden">
                <Link href={`/products/${item}`}>
                  <div className="h-36 relative overflow-hidden">
                    <Image 
                      src={`/api/placeholder/200/200`} 
                      alt={`Product ${item}`}
                      fill
                      className="transition-transform hover:scale-105 duration-300"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium truncate">Product Name {item}</h3>
                    <p className="text-indigo-600 font-bold text-sm">$99.99</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { 
                title: "Secure Payments", 
                description: "All transactions are encrypted and secure",
                icon: "🔒"
              },
              { 
                title: "Free Shipping", 
                description: "On orders over $50",
                icon: "🚚"
              },
              { 
                title: "Easy Returns", 
                description: "30-day money back guarantee",
                icon: "↩️"
              },
              { 
                title: "24/7 Support", 
                description: "Get help anytime you need it",
                icon: "💬"
              }
            ].map((badge, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h3 className="font-bold text-gray-900">{badge.title}</h3>
                <p className="text-gray-500 text-sm">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Shop & Bid</h3>
              <p className="text-gray-400 mb-4">Your premier marketplace for exclusive products and rare collectibles.</p>
              <div className="flex space-x-4">
                {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                  <Link key={social} href="#" className="text-gray-400 hover:text-white">
                    {social[0]}
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Shop</h3>
              <ul className="space-y-2">
                {['New Arrivals', 'Best Sellers', 'Featured', 'Collections', 'Sale'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Auctions</h3>
              <ul className="space-y-2">
                {['Live Auctions', 'Coming Soon', 'Past Auctions', 'How It Works', 'Bidding Guide'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Help & Info</h3>
              <ul className="space-y-2">
                {['FAQs', 'Shipping Policy', 'Returns', 'Track Order', 'Contact Us', 'Terms of Service', 'Privacy Policy'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-700" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 Shop & Bid. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Terms
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Privacy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}