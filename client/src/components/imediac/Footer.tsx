import { Palette, Mail, MessageCircle, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">IMediaC</h3>
                <p className="text-sm text-gray-400">Web & Design Studio</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Professional posters, modern websites, and full maintenance — all at affordable prices. 
              We help small businesses, schools, and Islamic organisations build their online presence.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Twitter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/imediac" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="/imediac/services" className="text-gray-300 hover:text-white transition-colors">Services</a></li>
              <li><a href="/imediac/portfolio" className="text-gray-300 hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="/imediac/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/imediac/about" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/imediac/contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <a href="mailto:imediac786@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                  imediac786@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-400" />
                <a 
                  href="https://wa.me/447000000000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Islam Media Central Design Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}