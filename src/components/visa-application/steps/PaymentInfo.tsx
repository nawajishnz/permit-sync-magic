import React, { useState } from 'react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CreditCard, Check, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  cardholderName: z.string().min(1, { message: "Cardholder name is required" }),
  cardNumber: z.string().regex(/^\d{16}$/, { message: "Invalid card number" }),
  expiryMonth: z.string().min(1, { message: "Expiry month required" }),
  expiryYear: z.string().min(1, { message: "Expiry year required" }),
  cvv: z.string().regex(/^\d{3,4}$/, { message: "Invalid CVV" }),
  saveCard: z.boolean().default(false),
  termsAccepted: z.boolean().refine(value => value === true, {
    message: "You must accept the terms and conditions"
  })
});

const PaymentInfo: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      saveCard: false,
      termsAccepted: false
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
      
      console.log('Payment processed:', values);
    }, 2000);
  }

  // Generate expiry month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return (
      <option key={month} value={month.toString().padStart(2, '0')}>
        {month.toString().padStart(2, '0')}
      </option>
    );
  });

  // Generate expiry year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear + i;
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  });

  if (paymentSuccess) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Payment Successful!</h3>
          <p className="text-green-700 mb-4">
            Your visa application has been submitted successfully and is now being processed.
          </p>
          <div className="bg-white rounded-lg p-4 max-w-md mx-auto text-left">
            <p className="text-gray-700 text-sm mb-1">Application Reference: <span className="font-semibold">VISA-{Math.floor(Math.random() * 90000000) + 10000000}</span></p>
            <p className="text-gray-700 text-sm">You will receive a confirmation email shortly with all the details.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-indigo-50 border-indigo-200">
        <Lock className="h-4 w-4 text-indigo-600" />
        <AlertTitle className="text-indigo-800">Secure Payment</AlertTitle>
        <AlertDescription className="text-indigo-700">
          Your payment information is encrypted and secure. We do not store your full card details.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cardholderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name as it appears on card" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="1234 5678 9012 3456" 
                            {...field} 
                            onChange={(e) => {
                              // Only allow numbers and format with spaces
                              const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                              field.onChange(value);
                            }}
                          />
                          <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Month <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <select 
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                            {...field}
                          >
                            <option value="" disabled>MM</option>
                            {monthOptions}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="expiryYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <select 
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                            {...field}
                          >
                            <option value="" disabled>YYYY</option>
                            {yearOptions}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123" 
                            type="password" 
                            maxLength={4}
                            {...field} 
                            onChange={(e) => {
                              // Only allow numbers
                              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="saveCard"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Save this card for future payments</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the <a href="/terms" className="text-indigo-600 hover:underline" target="_blank">Terms and Conditions</a> and <a href="/privacy" className="text-indigo-600 hover:underline" target="_blank">Privacy Policy</a>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Payment will be processed immediately. Your visa application will be submitted upon successful payment.
                </AlertDescription>
              </Alert>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium flex items-center justify-center ${
                    isProcessing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center">
          <Lock className="h-4 w-4 mr-1" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center">
          <Check className="h-4 w-4 mr-1" />
          <span>Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;
