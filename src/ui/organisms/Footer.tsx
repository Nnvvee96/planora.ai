import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/ui/atoms/Logo";
import { Twitter, Facebook, Instagram, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative mt-20">
      {/* Modern Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800/50 to-transparent"></div>
      
      <div className="relative">
        {/* Main Footer Content */}
        <div className="bg-black/30 backdrop-blur-xl border-t border-white/10">
          <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="lg:col-span-1">
                <div className="mb-6">
                  <Logo size="lg" />
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  AI-powered travel planning that makes your journeys more memorable and effortless.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 group"
                  >
                    <Twitter className="h-4 w-4 text-white/60 group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 group"
                  >
                    <Facebook className="h-4 w-4 text-white/60 group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 group"
                  >
                    <Instagram className="h-4 w-4 text-white/60 group-hover:text-white transition-colors duration-300" />
                  </a>
                </div>
              </div>

              {/* Resources Section */}
              <div>
                <h3 className="text-lg font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Resources
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="/help"
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/guides"
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Travel Guides
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/blog"
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/support"
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Support
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company Section */}
              <div>
                <h3 className="text-lg font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Company
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="/about"
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/careers"
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/press"
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Press Kit
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal & Contact Section */}
              <div>
                <h3 className="text-lg font-bold text-white mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Legal & Contact
                </h3>
                <ul className="space-y-3 mb-6">
                  <li>
                    <Link
                      to="/terms"
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-emerald-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/privacy"
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-emerald-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/cookies"
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-emerald-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
                
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-white/60 text-xs">
                    <Mail className="h-3 w-3 mr-2" />
                    <span>hello@planora.ai</span>
                  </div>
                  <div className="flex items-center text-white/60 text-xs">
                    <MapPin className="h-3 w-3 mr-2" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-6 mb-4 md:mb-0">
                  <p className="text-white/60 text-sm">
                    &copy; {new Date().getFullYear()} Planora. All rights reserved.
                  </p>
                  <div className="hidden md:flex items-center space-x-1 text-white/40 text-xs">
                    <span>Made with</span>
                    <span className="text-red-400 mx-1">♥</span>
                    <span>for travelers</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-400/30">
                    <span className="text-purple-400 text-xs font-medium">AI-Powered</span>
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-400/30">
                    <span className="text-green-400 text-xs font-medium">Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
