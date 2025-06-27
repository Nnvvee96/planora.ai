/**
 * FAQ Items Data
 * 
 * Frequently asked questions for the landing page
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "How does Planora.ai work?",
    answer:
      "Planora.ai uses advanced AI to understand your travel preferences through natural conversation. It then searches and filters through thousands of options to create personalized recommendations tailored to your needs, preferences, and budget.",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "Yes, we take data security seriously. All your personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent.",
  },
  {
    question: "Can I use Planora.ai for group trips?",
    answer:
      "Absolutely! Planora.ai excels at coordinating group trips. It can harmonize different preferences, budgets, and availability to create travel plans that work for everyone in your group.",
  },
  {
    question: "How accurate are the travel recommendations?",
    answer:
      "Planora.ai sources real-time data from trusted travel partners to ensure accurate and up-to-date recommendations. Our AI continuously improves based on user feedback and travel trends.",
  },
  {
    question: "Can I book trips directly through Planora.ai?",
    answer:
      "Currently, Planora.ai provides recommendations and planning assistance. For bookings, we connect you directly to our trusted travel partners where you can complete your reservation.",
  },
]; 