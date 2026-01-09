import React from "react";
import { useLocation, Link } from "react-router-dom";
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
          <Link to="/">Home</Link>
          <Link to="/cart">My Cart</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/profile">My Profile</Link>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Help Center
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Refund Policy
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Shipping Info
          </a>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>Email: support@mystore.com</p>
          <p>Phone: +91-9876543210</p>
        </div>
      </div>

      {/* SOCIAL ICONS */}
      <div className="footer-social">
        <a href="https://facebook.com" target="_blank" rel="noreferrer">
          <FaFacebookF />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          <FaInstagram />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer">
          <FaTwitter />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noreferrer">
          <FaLinkedinIn />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noreferrer">
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
