import React, { useEffect, Suspense } from "react";
import { Navigation } from "@/ui/organisms/Navigation";
import { Footer } from "@/ui/organisms/Footer";
import { Button } from "@/ui/atoms/Button";
import { Input } from "@/ui/atoms/Input";
import { Textarea } from "@/ui/atoms/Textarea";
import { Label } from "@/ui/atoms/Label";
import { Logo } from "@/ui/atoms/Logo";
import { Mail, MessageSquare, User, Tag, Send, ArrowLeft } from "lucide-react";
import { FaqAccordion } from "@/ui/organisms/FaqAccordion";
import { useAuth } from "@/features/auth/authApi";
import { getUserProfileMenuComponent } from "@/features/user-profile/userProfileApi";
import { useNavigate } from "react-router-dom";

const SupportPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission logic (e.g., send data to an API)
    alert("Support request submitted! We will get back to you soon.");
  };

  // Get the user profile menu component for authenticated users
  const UserProfileMenu = getUserProfileMenuComponent();

  return (
    <div className="relative min-h-screen bg-planora-purple-dark flex flex-col text-white">
      {/* Navigation - Different for authenticated vs non-authenticated */}
      {isAuthenticated ? (
        // Authenticated user navigation (similar to Dashboard)
        <header className="relative z-10 bg-background/80 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/dashboard")}
                  className="shrink-0 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Logo href="/dashboard" />
              </div>

              <div className="flex items-center space-x-3">
                <Suspense fallback={<div>Loading...</div>}>
                  <UserProfileMenu
                    userName={
                      user?.firstName ||
                      user?.username ||
                      user?.email?.split("@")[0] ||
                      "User"
                    }
                    userEmail={user?.email}
                    firstName={user?.firstName}
                    lastName={user?.lastName}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </header>
      ) : (
        // Non-authenticated user navigation (landing page style)
        <Navigation />
      )}

      <main className="flex-grow container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Support Center
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            We're here to help! Fill out the form below or use our contact
            details.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
          {/* Contact Form */}
          <div className="bg-gradient-to-br from-black/50 to-planora-purple-dark/30 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 flex items-center">
              <MessageSquare className="w-7 h-7 mr-3 text-planora-accent-purple" />
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-white/90">
                  Full Name
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    defaultValue={
                      isAuthenticated
                        ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                        : ""
                    }
                    required
                    className="pl-10 bg-black/40 border-white/20 focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-white/90">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    defaultValue={user?.email || ""}
                    required
                    className="pl-10 bg-black/40 border-white/20 focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subject" className="text-white/90">
                  Subject
                </Label>
                <div className="relative mt-1">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Issue Subject"
                    required
                    className="pl-10 bg-black/40 border-white/20 focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="message" className="text-white/90">
                  Your Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question in detail..."
                  rows={6}
                  required
                  className="mt-1 bg-black/40 border-white/20 focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 w-full"
                />
              </div>
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full group"
              >
                Send Message
                <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-black/50 to-planora-purple-dark/30 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8 shadow-lg flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 flex items-center">
              <Mail className="w-7 h-7 mr-3 text-planora-accent-blue" />
              Contact Information
            </h2>
            <p className="text-white/80 mb-4 leading-relaxed">
              {isAuthenticated
                ? `Hi ${user?.firstName || "there"}! If you prefer, you can also reach us directly via email. We aim to respond to all inquiries within 24-48 business hours.`
                : "If you prefer, you can also reach us directly via email. We aim to respond to all inquiries within 24-48 business hours."}
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <Mail className="w-5 h-5 mr-3 mt-1 text-planora-accent-blue/80 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white/90">Email Us</h4>
                  <a
                    href="mailto:support@getplanora.app"
                    className="text-planora-accent-blue hover:text-planora-accent-blue/80 transition-colors"
                  >
                    support@getplanora.app
                  </a>
                </div>
              </div>
              {/* Add more contact details here if needed, e.g., address, phone */}
              {/* 
              <div className="flex items-start">
                <Phone className="w-5 h-5 mr-3 mt-1 text-planora-accent-blue/80 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white/90">Call Us (Mon-Fri, 9am-5pm PST)</h4>
                  <a href="tel:+15551234567" className="text-planora-accent-blue hover:text-planora-accent-blue/80 transition-colors">
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-1 text-planora-accent-blue/80 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white/90">Our Office</h4>
                  <p className="text-white/80">123 Planora Drive, Tech City, CA 94000, USA</p>
                </div>
              </div>
              */}
            </div>
            <p className="text-sm text-white/60 mt-6">
              Please provide as much detail as possible so we can assist you
              effectively.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-5xl mx-auto mt-12 md:mt-16">
          <FaqAccordion />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export { SupportPage };
