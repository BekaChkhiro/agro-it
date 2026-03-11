"use client";

import { type ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface SiteLayoutProps {
  children: ReactNode;
}

const SiteLayout = ({ children }: SiteLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-background">
    {/* Skip to main content link for accessibility */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      Skip to main content
    </a>
    <Header />
    <div id="main-content" className="flex-1" role="main">
      {children}
    </div>
    <Footer />
  </div>
);

export default SiteLayout;
