"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/shop/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      setSuccess('Your message has been sent successfully. We will get back to you shortly.');
      setFirstName('');
      setLastName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              <h2 className="font-playfair text-3xl text-foreground mb-8">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-lg mb-1">Registered Office</h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      51 khagender nath ganguly lane,<br />
                      4th floor/flat no 402, near pumping iron gym,<br />
                      Nandi bagan, Howrah - 711106
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium text-lg mb-1">Email</h3>
                    <a href="mailto:radhikajewellers699@gmail.com" className="text-muted-foreground font-light hover:text-primary transition-colors">radhikajewellers699@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-lg mb-1">Support Hours</h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      Monday - Saturday: 10:00 AM - 8:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p>{success}</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium tracking-wide">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium tracking-wide">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium tracking-wide">Subject</label>
                <div className="relative">
                  <select 
                    id="subject" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Custom Design Request">Custom Design Request</option>
                    <option value="Order Status">Order Status</option>
                    <option value="Press & Media">Press & Media</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium tracking-wide">Message</label>
                <textarea 
                  id="message" 
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="How can we help you today?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-medium tracking-wider uppercase py-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
