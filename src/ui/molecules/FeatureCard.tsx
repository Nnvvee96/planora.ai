import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

const FeatureCard = ({
  title,
  description,
  icon: Icon, // Rename to capital Icon to indicate it's a component
  className = "",
}: FeatureCardProps) => {
  return (
    <div
      className={`bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg hover:bg-white/10 transition duration-300 ${className}`}
    >
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full bg-planora-accent-purple/20 text-planora-accent-purple mr-4">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-white/80">{description}</p>
    </div>
  );
};

export { FeatureCard };
