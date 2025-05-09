// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getInitials, getBackgroundColor } from "../utils/userUtils";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link to="/">Planora</Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/dashboard" className="hover:text-blue-400">
              Dashboard
            </Link>
            <div className="relative">
              <button onClick={toggleDropdown} className="focus:outline-none">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-gray-500 object-cover"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full border-2 border-gray-500 flex items-center justify-center text-white ${getBackgroundColor(user)}`}
                  >
                    <span className="text-lg font-semibold">{getInitials(user)}</span>
                  </div>
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-2 z-10">
                  <div className="flex justify-between items-center px-4 py-2">
                    <span className="text-gray-300 font-semibold">Menu</span>
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-gray-400 hover:text-gray-200 focus:outline-none"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
                  >
                    Settings
                  </Link>
                  <Link
                    to="/help-feedback"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
                  >
                    Help & Feedback
                  </Link>
                  <Link
                    to="/upgrade-plan"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
                  >
                    Upgrade Plan
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-400">
              Login
            </Link>
            <Link to="/register" className="hover:text-blue-400">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;