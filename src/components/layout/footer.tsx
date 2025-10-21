import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-2xl sm:text-5xl font-extrabold mb-4 text-red-500">
              LunchBox
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your campus canteen ordering solution. Order food from your hostel
              canteen with ease and convenience.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>E-302 H4, IIITDM Jabalpur</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/canteens"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Browse Canteens
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Track Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="font-semibold mb-4 text-white">
              For Canteen Owners
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/manage-orders"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Manage Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/menu-management"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Menu Management
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-gray-400 mb-4">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>aman081118@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+91 XXXXXXXXXX</span>
              </li>
            </ul>
            <h4 className="font-semibold mb-3 text-white">Follow Us</h4>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/aman081118/"
                className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <p>&copy; 2025 LunchBox. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Happy Meal</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
