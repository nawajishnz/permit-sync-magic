
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Globe } from 'lucide-react';

interface CountryNotFoundProps {
  onRetry?: () => void;
}

const CountryNotFound = ({ onRetry }: CountryNotFoundProps) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Country Not Found</h1>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find the country you're looking for. It may have been removed 
              or the URL might be incorrect.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {onRetry && (
                <Button onClick={onRetry} className="bg-blue-600 text-white">
                  Try Again
                </Button>
              )}
              
              <Link to="/countries">
                <Button variant="outline">
                  <Globe className="mr-2 h-4 w-4" />
                  Browse All Countries
                </Button>
              </Link>
              
              <Link to="/">
                <Button variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CountryNotFound;
