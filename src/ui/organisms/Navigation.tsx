import React, { useState, useEffect } from "react";
import { Button } from "@/ui/atoms/Button";
import { Logo } from "@/ui/atoms/Logo";
import { Menu, X, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { id: "home", label: "Home", type: "scroll", sectionId: "hero", path: "/" },
  {
    id: "features",
    label: "Features",
    type: "scroll",
    sectionId: "features",
    path: "/#features",
  },
  {
    id: "how-it-works",
    label: "How It Works",
    type: "scroll",
    sectionId: "how-it-works",
    path: "/#how-it-works",
  },
  {
    id: "examples",
    label: "Examples",
    type: "scroll",
    sectionId: "examples",
    path: "/#examples",
  },
  {
    id: "pricing",
    label: "Pricing",
    type: "scroll",
    sectionId: "pricing",
    path: "/#pricing",
  },
  {
    id: "reviews-landing",
    label: "Reviews",
    type: "scroll",
    sectionId: "user-stories",
    path: "/#user-stories",
  }, // For landing page section
  { id: "reviews-page", label: "All Reviews", type: "page", path: "/reviews" }, // For dedicated reviews page
  // Add other items like FAQ if they are primarily scroll targets on landing
];

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home"); // Default to 'home' (maps to 'hero' or '/' path)
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // Update scrolled state based on scroll position
      setScrolled(window.scrollY > 20);

      // Find which section is currently visible
      const sections = [
        "hero",
        "features",
        "how-it-works",
        "examples",
        "pricing",
        "tech",
        "faq",
        "user-stories",
        "cta",
      ];
      const sectionElements = sections
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      // Find the section that is most visible in the viewport
      let currentSection = "hero";
      let maxVisibility = 0;

      sectionElements.forEach((element) => {
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate how much of the section is visible
        const visibleHeight =
          Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibility = visibleHeight / element.clientHeight;

        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          currentSection = element.id;
        }
      });

      // Prioritize page match for active section
      const currentPageNavItem = navItems.find(
        (item) => item.type === "page" && item.path === location.pathname,
      );
      if (currentPageNavItem) {
        setActiveSection(currentPageNavItem.id);
      } else if (location.pathname === "/") {
        // Only apply scroll-based active section on landing page
        setActiveSection(currentSection);
      } else {
        // If on a different page not in navItems as type 'page', clear active section or set to a default
        setActiveSection(""); // Or some other appropriate default
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (id: string) => {
    // Map navigation items to their actual section IDs if different
    const sectionMap: Record<string, string> = navItems
      .filter((item) => item.type === "scroll" && item.sectionId)
      .reduce(
        (acc, item) => {
          acc[item.id] = item.sectionId!;
          return acc;
        },
        {} as Record<string, string>,
      );

    // Get the correct section ID from the map or use the provided ID
    const targetId = sectionMap[id] || id;

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      // Fallback for items that might not be on the current page but have a path (e.g. home from /reviews)
      const navItem = navItems.find((item) => item.id === id);
      if (
        navItem &&
        navItem.path &&
        window.location.pathname !== navItem.path.split("#")[0]
      ) {
        // Navigate to the base path if it's different, then scroll if hash exists
        window.location.href = navItem.path;
      } else if (navItem && navItem.path && navItem.path.includes("#")) {
        // if already on the right page but hash link, try to scroll
        const elementIdFromHash = navItem.path.split("#")[1];
        const elementToScroll = document.getElementById(elementIdFromHash);
        elementToScroll?.scrollIntoView({ behavior: "smooth" });
      }
    }

    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/60 backdrop-blur-xl shadow-lg shadow-planora-accent-purple/5" : "bg-transparent"}`}
    >
      <div className="relative">
        {/* Decorative tech elements */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-planora-accent-purple/0 via-planora-accent-purple/30 to-planora-accent-purple/0"></div>

        {scrolled && (
          <div className="absolute -bottom-[3px] left-0 right-0 h-[3px] overflow-hidden">
            <div className="h-full w-[50%] bg-gradient-to-r from-planora-accent-purple via-planora-accent-pink to-planora-accent-blue animate-pulse-light"></div>
          </div>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Logo className="relative z-10" />
            {/* Tech decoration behind logo */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-planora-accent-purple/5 blur-xl"></div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {" "}
            {/* Reduced space for potentially more items */}
            {/* Modern nav items with indicator for active section */}
            {navItems
              .filter((item) => item.label !== "All Reviews")
              .map((item) => {
                // Exclude 'All Reviews' from main nav, or decide its place
                const isActive =
                  activeSection === item.id ||
                  (item.id === "home" && activeSection === "hero") ||
                  (item.id === "reviews-page" &&
                    location.pathname === "/reviews");
                if (item.type === "page") {
                  return (
                    <Link
                      key={item.id}
                      to={item.path!}
                      className={`relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out group
                      ${isActive ? "text-white" : "text-white/60 hover:text-white"}`}
                      onClick={() => setIsMenuOpen(false)} // Close mobile menu on click
                    >
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-planora-accent-purple via-planora-accent-pink to-planora-accent-blue rounded-full opacity-100 scale-x-100 transition-all duration-300"></span>
                      )}
                      {!isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-planora-accent-purple via-planora-accent-pink to-planora-accent-blue rounded-full opacity-0 group-hover:opacity-60 scale-x-0 group-hover:scale-x-75 transition-all duration-300"></span>
                      )}
                    </Link>
                  );
                }
                // Scroll link button
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.sectionId || item.id)}
                    className={`relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out group
                    ${isActive ? "text-white" : "text-white/60 hover:text-white"}`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-planora-accent-purple via-planora-accent-pink to-planora-accent-blue rounded-full opacity-100 scale-x-100 transition-all duration-300"></span>
                    )}
                    {!isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-planora-accent-purple via-planora-accent-pink to-planora-accent-blue rounded-full opacity-0 group-hover:opacity-60 scale-x-0 group-hover:scale-x-75 transition-all duration-300"></span>
                    )}
                  </button>
                );
              })}
            <div className="ml-3 pl-3 border-l border-white/10 flex items-center space-x-3">
              <Link to="/login">
                <Button
                  variant="glass"
                  className="text-sm font-medium px-4 py-2 h-auto border-white/5 hover:border-white/20 transition-all duration-300"
                >
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="gradient"
                  className="text-sm font-medium px-4 py-2 h-auto flex items-center gap-1 group transition-all duration-300"
                >
                  Sign Up
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="glass"
              size="sm"
              onClick={toggleMenu}
              className="w-10 h-10 p-0 flex items-center justify-center border-white/5"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen ? (
          <div className="md:hidden py-4 mt-4 backdrop-blur-xl bg-black/80 border border-white/10 rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-300">
            <div className="flex flex-col space-y-1 px-2">
              {navItems.map((item, index) => {
                const isActive =
                  (item.type === "page" && location.pathname === item.path) ||
                  (item.type === "scroll" &&
                    activeSection === (item.sectionId || item.id)) ||
                  (item.id === "home" &&
                    activeSection === "hero" &&
                    location.pathname === "/"); // Special case for home on landing

                if (item.type === "page") {
                  return (
                    <Link
                      key={item.id}
                      to={item.path!}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-left p-3 rounded-lg transition-all duration-300 flex items-center justify-between
                        ${
                          isActive
                            ? "bg-gradient-to-r from-planora-accent-purple/20 to-planora-accent-pink/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 text-planora-accent-purple" />
                      )}
                    </Link>
                  );
                }

                // Scroll link button
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      scrollToSection(item.sectionId || item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`text-left p-3 rounded-lg transition-all duration-300 flex items-center justify-between
                      ${
                        isActive
                          ? "bg-gradient-to-r from-planora-accent-purple/20 to-planora-accent-pink/10 text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-planora-accent-purple" />
                    )}
                  </button>
                );
              })}

              <div className="pt-3 mt-2 grid grid-cols-2 gap-2 border-t border-white/10">
                <Link to="/login" className="col-span-1">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/register" className="col-span-1">
                  <Button variant="gradient" className="w-full group">
                    <span className="group-hover:mr-1 transition-all duration-300">
                      Sign Up
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-300" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
};

export { Navigation };
