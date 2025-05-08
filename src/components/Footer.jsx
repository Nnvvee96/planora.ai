// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { footerLinks } from "../utils/constants";
import { fadeInVariants } from "../utils/animationUtils"; // Neu hinzugefügt

function Footer() {
  return (
    <motion.footer
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className="bg-gray-900 p-4 text-white text-center"
    >
      <div className="container mx-auto">
        <div className="flex justify-center space-x-4 mb-2">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-white hover:text-gray-300 uppercase"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-sm">
          © {new Date().getFullYear()} Planora. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}

export default Footer;