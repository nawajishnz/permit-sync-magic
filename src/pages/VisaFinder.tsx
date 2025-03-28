
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Plane, Home, ArrowRight, GraduationCap, Briefcase, Heart, Clock, CalendarDays } from 'lucide-react';

const VisaFinder = () => {
  const [fromCountry, setFromCountry] = useState("");
  const [toCountry, setToCountry] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResultsVisible(true);
    // In a real app, this would fetch visa data based on selections
  };

  // Sample visa results
  const visaResults = [
    {
      id: 1,
      name: "Tourist Visa (B-2)",
      description: "For tourism, pleasure, or visiting friends and family",
      processingTime: "2-3 weeks",
      validityPeriod: "Up to 6 months",
      price: "$160",
      requirements: [
        "Valid passport",
        "Completed application form",
        "Proof of financial means",
        "Return ticket",
        "Travel itinerary"
      ]
    },
    {
      id: 2,
      name: "Business Visa (B-1)",
      description: "For business-related activities, meetings, and conferences",
      processingTime: "2-3 weeks",
      validityPeriod: "Up to 6 months",
      price: "$160",
      requirements: [
        "Valid passport",
        "Completed application form",
        "Invitation letter",
        "Company letter",
        "Proof of financial means"
      ]
    },
    {
      id: 3,
      name: "Electronic Travel Authorization (ETA)",
      description: "Quick online pre-authorization for eligible travelers",
      processingTime: "72 hours",
      validityPeriod: "Up to 2 years (multiple entry)",
      price: "$29",
      requirements: [
        "Valid passport",
        "Valid email address",
        "Credit/debit card for payment",
        "Recent travel history"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-navy text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Find the Right Visa</h1>
            <p className="text-lg opacity-90 max-w-2xl">
              Answer a few simple questions and we'll help you find the perfect visa for your travel needs.
            </p>
          </div>
        </div>

        {/* Visa finder form */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <Label htmlFor="fromCountry">Your Citizenship</Label>
                  <Select value={fromCountry} onValueChange={setFromCountry}>
                    <SelectTrigger id="fromCountry" className="mt-1">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="toCountry">Destination Country</Label>
                  <Select value={toCountry} onValueChange={setToCountry}>
                    <SelectTrigger id="toCountry" className="mt-1">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-8">
                <Label className="block mb-3">Purpose of Travel</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    { value: "tourism", icon: <Plane />, label: "Tourism" },
                    { value: "business", icon: <Briefcase />, label: "Business" },
                    { value: "study", icon: <GraduationCap />, label: "Study" },
                    { value: "work", icon: <Home />, label: "Work" },
                    { value: "family", icon: <Heart />, label: "Family Visit" },
                    { value: "residence", icon: <Home />, label: "Residence" },
                    { value: "transit", icon: <Plane />, label: "Transit" }
                  ].map((item) => (
                    <div
                      key={item.value}
                      className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                        purpose === item.value ? "bg-navy-100 border-navy text-navy" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setPurpose(item.value)}
                    >
                      <div className="flex justify-center mb-2">{item.icon}</div>
                      <div className="text-sm">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <Label className="block mb-3">Stay Duration</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    { value: "short", icon: <Clock />, label: "< 30 days" },
                    { value: "medium", icon: <CalendarDays />, label: "1-6 months" },
                    { value: "long", icon: <CalendarDays />, label: "6-12 months" },
                    { value: "extended", icon: <Home />, label: "> 1 year" }
                  ].map((item) => (
                    <div
                      key={item.value}
                      className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                        duration === item.value ? "bg-navy-100 border-navy text-navy" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setDuration(item.value)}
                    >
                      <div className="flex justify-center mb-2">{item.icon}</div>
                      <div className="text-sm">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button type="submit" className="bg-navy hover:bg-navy-600 text-white px-6 py-2" size="lg">
                  Find Visa Options
                </Button>
              </div>
            </form>
          </div>

          {/* Results section */}
          {resultsVisible && (
            <div className="mt-16">
              <div className="border-b pb-4 mb-8">
                <h2 className="text-2xl font-bold">Recommended Visa Options</h2>
                <p className="text-gray-600">Based on your selections, here are the visa options available</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visaResults.map((visa) => (
                  <Card key={visa.id} className="card-hover">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{visa.name}</h3>
                      <p className="text-gray-600 mb-4">{visa.description}</p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Processing time:</span>
                          <span className="font-medium">{visa.processingTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Validity:</span>
                          <span className="font-medium">{visa.validityPeriod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Price:</span>
                          <span className="font-medium">{visa.price}</span>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="font-medium mb-2">Key Requirements</h4>
                        <ul className="text-sm space-y-1">
                          {visa.requirements.map((req, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-teal mr-2">•</span> {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Link to="/apply-now">
                        <Button className="w-full bg-navy hover:bg-navy-600 text-white">
                          Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VisaFinder;
