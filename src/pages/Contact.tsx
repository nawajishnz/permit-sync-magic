
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the contact form data
    console.log('Contact form submitted');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-navy text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg opacity-90 max-w-2xl">
              Have questions about your visa application? Our team is here to help you every step of the way.
            </p>
          </div>
        </div>

        {/* Contact content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact information */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                Whether you have a question about visa applications, pricing, or anything else, our team is ready to answer all your questions.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start">
                  <div className="bg-navy-50 p-3 rounded-full mr-4">
                    <Phone className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-navy-50 p-3 rounded-full mr-4">
                    <Mail className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-gray-600">support@permitsy.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-navy-50 p-3 rounded-full mr-4">
                    <MapPin className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Office Address</h3>
                    <p className="text-gray-600">
                      123 Visa Avenue<br />
                      San Francisco, CA 94103<br />
                      United States
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-navy-50 p-3 rounded-full mr-4">
                    <Clock className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9am - 6pm EST<br />
                      Saturday: 10am - 4pm EST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-navy-50 rounded-lg">
                <div className="flex items-center mb-4">
                  <MessageSquare className="h-5 w-5 text-navy mr-2" />
                  <h3 className="font-medium">Live Chat Support</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Get instant answers from our visa experts via live chat. Our team is available 24/7 to assist you.
                </p>
                <Button className="bg-navy hover:bg-navy-600 text-white w-full">
                  Start Live Chat
                </Button>
              </div>
            </div>
            
            {/* Contact form */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" placeholder="John Doe" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" className="mt-1" />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger id="subject" className="mt-1">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="application">Visa Application</SelectItem>
                        <SelectItem value="status">Application Status</SelectItem>
                        <SelectItem value="documents">Document Requirements</SelectItem>
                        <SelectItem value="payment">Payment Issues</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="How can we help you?" className="mt-1 min-h-[150px]" />
                  </div>
                  
                  <Button type="submit" className="bg-navy hover:bg-navy-600 text-white w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Map section */}
        <div className="h-96 w-full bg-gray-200 mt-8">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0468042400244!2d-122.41941372393863!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858087469b8237%3A0xaa875b9a151ab4a!2sSan%20Francisco%2C%20CA%2094103!5e0!3m2!1sen!2sus!4v1678940569109!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Permitsy office location"
          ></iframe>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
