"use client";

import Image from "next/image";
import {
  ShoppingCart,
  Truck,
  Shield,
  CreditCard,
  Headphones,
  Smile,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6 flex flex-col items-center text-center">
      <Icon className="h-12 w-12 text-blue-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-blue-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

export default function AboutPage() {
  const features = [
    {
      icon: ShoppingCart,
      title: "Extensive Product Range",
      description:
        "Discover thousands of products across multiple categories, from electronics to home essentials.",
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description:
        "Shop with confidence using our advanced security protocols and protected payment systems.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description:
        "Quick and reliable shipping options to get your products to your doorstep in the shortest time possible.",
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description:
        "Our dedicated support team is always ready to assist you with any questions or concerns.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="flex justify-center items-center mb-6">
          <Image
            src="/Logo.svg"
            alt="Blue Cart Logo"
            width={150}
            height={50}
            className="mb-4"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold  mb-6">
          Welcome to Blue Cart
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your one-stop online shopping destination for quality products,
          unbeatable prices, and a seamless shopping experience.
        </p>
      </section>

      {/* Mission Statement */}
      <section className="mb-16 bg-blue-500/10 rounded-xl p-12 text-center">
        <h2 className="text-3xl font-bold  mb-6">Our Mission</h2>
        <p className="text-lg text-gray-700 max-w-4xl mx-auto">
          At Blue Cart, we're committed to providing an exceptional online
          shopping experience that combines convenience, quality, and value. Our
          goal is to make your shopping journey effortless, enjoyable, and
          rewarding.
        </p>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold  text-center mb-12">
          Why Shop with Blue Cart?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white rounded-xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Start Shopping Now</h2>
        <p className="text-xl mb-8">
          Explore our vast collection of products and find exactly what you
          need.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/products">
            <Button
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Browse Products
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
