"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground font-light">Last Updated: July 2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-light leading-relaxed text-muted-foreground"
        >
          <section>
            <p>
              At Radhika Jewellers, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Radhika Jewellers and how we use it.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">1. Information We Collect</h2>
            <p>
              The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</li>
              <li>When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
              <li>Send you emails</li>
              <li>Find and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">3. Log Files</h2>
            <p>
              Radhika Jewellers follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">4. Cookies and Web Beacons</h2>
            <p>
              Like any other website, Radhika Jewellers uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
