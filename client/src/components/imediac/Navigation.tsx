import { useState } from "react";
import { Menu, X, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { name: "Home", href: "/imediac" },
    { name: "Services", href: "/imediac/services" },
    { name: "Portfolio", href: "/imediac/portfolio" },
    { name: "Pricing", href: "/imediac/pricing" },
    { name: "About Us", href: "/imediac/about" },
    { name: "Contact", href: "/imediac/contact" }
  ];

  const isActive = (href: string) => {
    if (href === "/imediac" && location === "/imediac") return true;
    if (href !== "/imediac" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/imediac">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IMediaC</h1>
                <p className="text-xs text-gray-600">Web & Design Studio</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={`font-medium transition-colors hover:text-blue-600 ${
                    isActive(item.href)
                      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                      : "text-gray-700"
                  }`}
                >
                  {item.name}
                </a>
              </Link>
            ))}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`block px-4 py-2 font-medium transition-colors hover:text-blue-600 hover:bg-blue-50 rounded-lg ${
                      isActive(item.href)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
              <div className="px-4 pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}