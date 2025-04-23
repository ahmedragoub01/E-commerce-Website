import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false ,
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  async rewrites() {
    return [
      {
        source: "/",                // what users type
        destination: "/user",   // actual page path
      },
      {
        source: "/dashboard",
        destination: "/user/dashboard",
      },
      {
        source:"/orders",
        destination:"/user/orders",
      },
      {
        source: "/orders/:id",
        destination: "/user/orders/:id",
      },
      {
        source: "/about",
        destination: "/user/about",
      },
      {
        source: "/auctions",
        destination: "/user/auctions",
      },
      {
        source :"/auctions/:id",
        destination: "/user/auctions/:id"
      },
      {
        source: "/auctions-checkout",
        destination: "/user/auctions-checkout",
      },
      {
        source: "/cart",
        destination: "/user/cart",
      },
      {
        source: "/email-verification",
        destination: "/user/email-verification",
      },
      {
        source: "/home",
        destination: "/user/home",
      },
      {
        source: "/login",
        destination: "/user/login",
      },
      {
        source: "/myauctions",
        destination: "/user/myauctions",
      },
      {
        source: "/product",
        destination: "/user/product",
      },
      {
        source: "/resend-verification",
        destination: "/user/resend-verification",
      },
      {
        source: "/signup",
        destination: "/user/signup",
      },
      {
        source: "/email-verification",
        destination: "/user/email-verification",
      },
      {
        source:"/product/:id",
        destination:"/user/product/:id",
      },
      {
        source: "/checkout",
        destination: "/user/checkout",
      },
      {
        source: "/myauctions",
        destination: "/user/myauctions",
      },
    ];
  },
};

export default nextConfig;
