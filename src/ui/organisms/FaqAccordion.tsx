import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FaqAccordion: React.FC = () => {
  return (
    <Card className="bg-black/30 backdrop-blur-lg border border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-semibold text-white">
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full text-white/90">
          <AccordionItem value="item-1" className="border-white/20">
            <AccordionTrigger className="hover:text-planora-accent-blue text-left">
              How do I create a new trip?
            </AccordionTrigger>
            <AccordionContent className="text-white/80">
              To create a new trip, simply click on the "Chat with Planora.ai"
              or "Create New Trip" button on your dashboard. You'll be guided
              through a conversation with our AI assistant to plan your perfect
              trip.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-white/20">
            <AccordionTrigger className="hover:text-planora-accent-blue text-left">
              Can I modify my trip after creating it?
            </AccordionTrigger>
            <AccordionContent className="text-white/80">
              Yes! You can modify your trip at any time. Simply open your saved
              trip and click the "Edit" button. You can change dates,
              destinations, preferences, and more.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-white/20">
            <AccordionTrigger className="hover:text-planora-accent-blue text-left">
              How do I upgrade my subscription?
            </AccordionTrigger>
            <AccordionContent className="text-white/80">
              You can upgrade your subscription in the Billing section. Navigate
              to your profile menu, click on "Billing", and select the plan that
              works best for you.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border-white/20">
            <AccordionTrigger className="hover:text-planora-accent-blue text-left">
              Is my payment information secure?
            </AccordionTrigger>
            <AccordionContent className="text-white/80">
              Absolutely. We use industry-standard encryption to protect your
              payment information. We never store your full credit card details
              on our servers.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5" className="border-b-0 border-white/20">
            <AccordionTrigger className="hover:text-planora-accent-blue text-left">
              How do I delete my account?
            </AccordionTrigger>
            <AccordionContent className="text-white/80">
              To delete your account, go to Settings in your profile menu,
              scroll down to the Account Options section, and click on "Delete
              Account". Please note that this action is irreversible.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export { FaqAccordion };
