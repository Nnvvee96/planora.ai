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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col text-white">
      {/* Modern Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation - Different for authenticated vs non-authenticated */}
      {isAuthenticated ? (
        // Authenticated user navigation (similar to Dashboard)
        <header className="relative z-10 bg-black/30 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/dashboard")}
                  className="shrink-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
                >
                  <ArrowLeft className="h-8 w-8" />
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

      <main className="flex-grow container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
            Support Center
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            We're here to help! Fill out the form below or use our contact
            details.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Form */}
          <div className="relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-75"></div>
            <div className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 transition-all duration-300 overflow-hidden">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center text-white">
                <MessageSquare className="w-7 h-7 mr-3 text-purple-400" />
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white/90 font-semibold">
                    Full Name
                  </Label>
                  <div className="relative mt-2">
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
                      className="pl-10 bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-white/90 font-semibold">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      defaultValue={user?.email || ""}
                      required
                      className="pl-10 bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject" className="text-white/90 font-semibold">
                    Subject
                  </Label>
                  <div className="relative mt-2">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Issue Subject"
                      required
                      className="pl-10 bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message" className="text-white/90 font-semibold">
                    Your Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue or question in detail..."
                    rows={6}
                    required
                    className="mt-2 bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 w-full text-white placeholder:text-white/50 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 py-3 rounded-xl font-semibold transition-all duration-300 group"
                >
                  Send Message
                  <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 transition-all duration-300 flex flex-col justify-center overflow-hidden group">
              {/* Contained hover effect - no external blur */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h2 className="relative text-2xl md:text-3xl font-bold mb-6 flex items-center text-white">
                <Mail className="w-7 h-7 mr-3 text-blue-400" />
                Contact Information
              </h2>
              <p className="relative text-white/80 mb-6 leading-relaxed">
                {isAuthenticated
                  ? `Hi ${user?.firstName || "there"}! If you prefer, you can also reach us directly via email. We aim to respond to all inquiries within 24-48 business hours.`
                  : "If you prefer, you can also reach us directly via email. We aim to respond to all inquiries within 24-48 business hours."}
              </p>
              <div className="space-y-4 relative">
                <div className="flex items-start p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
                  <Mail className="w-5 h-5 mr-3 mt-1 text-blue-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white/90 mb-1">Email Us</h4>
                    <a
                      href="mailto:support@getplanora.app"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      support@getplanora.app
                    </a>
                  </div>
                </div>
              </div>
              <p className="relative text-sm text-white/60 mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                Please provide as much detail as possible so we can assist you
                effectively.
              </p>
            </div>
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
