
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Cookies = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-navy text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            
            <h2>What Are Cookies</h2>
            <p>
              Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.
            </p>
            
            <h2>How We Use Cookies</h2>
            <p>
              When you use and access the Service, we may place a number of cookies files in your web browser. We use cookies for the following purposes:
            </p>
            <ul>
              <li>To enable certain functions of the Service</li>
              <li>To provide analytics</li>
              <li>To store your preferences</li>
              <li>To enable advertisements delivery, including behavioral advertising</li>
            </ul>
            
            <h2>Types of Cookies We Use</h2>
            <h3>Essential cookies</h3>
            <p>
              These cookies are essential to provide you with services available through our website and to enable you to use some of its features. Without these cookies, the services that you have asked for cannot be provided, and we only use these cookies to provide you with those services.
            </p>
            
            <h3>Functionality cookies</h3>
            <p>
              These cookies allow our website to remember choices you make when you use our website. The purpose of these cookies is to provide you with a more personal experience and to avoid you having to re-select your preferences every time you visit our website.
            </p>
            
            <h3>Analytics cookies</h3>
            <p>
              These cookies are used to collect information about traffic to our website and how users use our website. The information gathered via these cookies does not "directly" identify any individual visitor. However, it may render such visitors "indirectly identifiable".
            </p>
            
            <h2>Your Choices Regarding Cookies</h2>
            <p>
              If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer.
            </p>
            
            <h2>More Information</h2>
            <p>
              For more information about cookies, and how to disable cookies, visit:
            </p>
            <ul>
              <li><a href="http://www.internetcookies.org" className="text-navy hover:underline">http://www.internetcookies.org</a></li>
              <li><a href="http://www.allaboutcookies.org" className="text-navy hover:underline">http://www.allaboutcookies.org</a></li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cookies;
