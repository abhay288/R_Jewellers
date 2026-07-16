"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      {/* Header Section */}
      <div className="container mx-auto px-6 mb-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-playfair text-5xl md:text-6xl text-foreground mb-6"
        >
          Get in Touch
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto"
        >
          We are here to assist you with any inquiries regarding our collections, custom designs, or your recent orders.
        </motion.p>
      </div>

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-12"
          >
            <div>
              <h2 className="font-playfair text-3xl text-foreground mb-8">Visit Our Boutique</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-lg mb-1">Flagship Store</h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      Showroom 4, Royal Plaza<br />
                      MG Road, Mumbai<br />
                      Maharashtra 400001, India
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium text-lg mb-1">Phone</h3>
                    <p className="text-muted-foreground font-light">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium text-lg mb-1">Email</h3>
                    <p className="text-muted-foreground font-light">support@radhikajewellers.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-lg mb-1">Store Hours</h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      Monday - Saturday: 10:00 AM - 8:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 bg-secondary rounded-2xl flex items-center justify-center border border-border/50">
              <span className="text-muted-foreground font-light italic">Interactive Map Area</span>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-secondary/50 p-10 md:p-12 rounded-3xl border border-border/50"
          >
            <h2 className="font-playfair text-3xl text-foreground mb-8">Send a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium tracking-wide">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium tracking-wide">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium tracking-wide">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium tracking-wide">Subject</label>
                <select 
                  id="subject" 
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option>General Inquiry</option>
                  <option>Custom Design Request</option>
                  <option>Order Status</option>
                  <option>Press & Media</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium tracking-wide">Message</label>
                <textarea 
                  id="message" 
                  rows={5}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="How can we help you today?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground font-medium tracking-wider uppercase py-4 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
