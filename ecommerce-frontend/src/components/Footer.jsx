import React from "react";
import { useLocation } from "react-router-dom";
import "./styles/Footer.css";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  const location = useLocation();

  // Hide footer on admin routes
  const isAdminPage = location.pathname.startsWith("/admin");
  if (isAdminPage) return null;

  return (
    <footer className="footer-container">
      {/* TOP SECTION */}
      <div className="footer-sections">
        <div className="footer-col">
          <h3>MyStore</h3>
          <p>Your trusted destination for premium products.</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/cart">My Cart</a>
          <a href="/orders">My Orders</a>
          <a href="/profile">My Profile</a>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Refund Policy</a>
          <a href="#">Shipping Info</a>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>Email: support@mystore.com</p>
          <p>Phone: +91-9876543210</p>
        </div>
      </div>

      {/* SOCIAL ICONS */}
      <div className="footer-social">
        <a href="#">
          <FaFacebookF />
        </a>
        <a href="#">
          <FaInstagram />
        </a>
        <a href="#">
          <FaTwitter />
        </a>
        <a href="#">
          <FaLinkedinIn />
        </a>
        <a href="#">
          <FaYoutube />
        </a>
      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MyStore. All rights reserved.</p>
      </div>
    </footer>
  );
}
