import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Twitter, Github, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">Timelyr</span>
            </Link>
            <p className="text-gray-600 text-sm mb-4">
              Eliminate timezone confusion with shareable links that automatically 
              display the correct time in everyone's local timezone.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com/timelyr" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com/timelyr" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:hello@timelyr.com" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-gray-800 transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-gray-800 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Press Kit
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">
                  GDPR
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 Timelyr Inc. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-sm text-gray-500">Made with ❤️ in San Francisco</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-500">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};