import React, { useState, useEffect } from 'react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';
import * as z from 'zod';

interface TravelInfoProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const formSchema = z.object({
  purposeOfTravel: z.string().min(1, { message: "Purpose is required" }),
  departureDate: z.string().min(1, { message: "Departure date is required" }),
  returnDate: z.string().min(1, { message: "Return date is required" }),
  bookingOption: z.enum(['provided', 'assist'], { required_error: "Please select a booking option."}),
  accommodationType: z.string().optional(),
  accommodationName: z.string().optional(),
  accommodationAddress: z.string().optional(),
  accommodationBookingReference: z.string().optional(),
  previousVisits: z.boolean(),
  previousVisitDetails: z.string().optional(),
}).refine(data => {
    if (data.bookingOption === 'provided') {
      return !!data.accommodationType?.trim();
    }
    return true;
  }, {
    message: "Accommodation type is required when providing your own booking.",
    path: ["accommodationType"],
  });

const TravelInfo: React.FC<TravelInfoProps> = ({ formData, updateFormData }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purposeOfTravel: formData.purposeOfTravel || '',
      departureDate: formData.departureDate || '',
      returnDate: formData.returnDate || '',
      bookingOption: formData.bookingOption || 'provided',
      accommodationType: formData.accommodation?.type || '',
      accommodationName: formData.accommodation?.name || '',
      accommodationAddress: formData.accommodation?.address || '',
      accommodationBookingReference: formData.accommodation?.bookingReference || '',
      previousVisits: formData.previousVisits || false,
      previousVisitDetails: formData.previousVisitDetails || '',
    },
  });

  const bookingOption = form.watch('bookingOption');

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedFormData = {
      ...formData,
      purposeOfTravel: values.purposeOfTravel,
      departureDate: values.departureDate,
      returnDate: values.returnDate,
      bookingOption: values.bookingOption,
      accommodation: {
        type: values.bookingOption === 'provided' ? values.accommodationType : 'Assistance Requested',
        name: values.bookingOption === 'provided' ? values.accommodationName : '',
        address: values.bookingOption === 'provided' ? values.accommodationAddress : '',
        bookingReference: values.bookingOption === 'provided' ? values.accommodationBookingReference : '',
      },
      previousVisits: values.previousVisits,
      previousVisitDetails: values.previousVisitDetails,
    };
    updateFormData(updatedFormData);
  }

  useEffect(() => {
    const subscription = form.watch((value) => {
      onSubmit(value as z.infer<typeof formSchema>);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Form {...form}>
      <form className="space-y-6" onChange={() => form.handleSubmit(onSubmit)()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="purposeOfTravel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose of Travel <span className="text-red-500">*</span></FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your travel purpose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tourism">Tourism</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                    <SelectItem value="medical">Medical Treatment</SelectItem>
                    <SelectItem value="visiting-family">Visiting Family/Friends</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2 md:col-span-1">
            {/* Placeholder for maintaining grid layout */}
          </div>

          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departure Date <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="returnDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Date <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Accommodation & Flight Plans</h3>
            
            <FormField
              control={form.control}
              name="bookingOption"
              render={({ field }) => (
                <FormItem className="space-y-3 mb-6">
                  <FormLabel>Booking Arrangement <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 border p-3 rounded-md flex-1">
                        <FormControl>
                          <RadioGroupItem value="provided" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I have my own bookings / details
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 border p-3 rounded-md flex-1">
                        <FormControl>
                          <RadioGroupItem value="assist" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Use dummy details & book assistance later (Add-on Service)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {bookingOption === 'assist' && (
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Booking Assistance</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    We will use placeholder details for your application. You can purchase booking assistance from our Add-on Services page later.
                  </AlertDescription>
                </Alert>
             )}

            {bookingOption === 'provided' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t pt-4">
                  <FormField
                    control={form.control}
                    name="accommodationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accommodation Type {bookingOption === 'provided' && <span className="text-red-500">*</span>}</FormLabel>
                         <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                         >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select accommodation type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hotel">Hotel</SelectItem>
                              <SelectItem value="airbnb">Airbnb/Rental</SelectItem>
                              <SelectItem value="hostel">Hostel</SelectItem>
                              <SelectItem value="relatives">Staying with Relatives</SelectItem>
                              <SelectItem value="business">Business Accommodation</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
    
                  <FormField
                    control={form.control}
                    name="accommodationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accommodation Name</FormLabel>
                         <FormControl>
                           <Input placeholder="Enter accommodation name" {...field} />
                         </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
    
                  <FormField
                    control={form.control}
                    name="accommodationAddress"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Accommodation Address</FormLabel>
                        <FormControl>
                           <Textarea placeholder="Enter accommodation address" {...field} />
                         </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
    
                  <FormField
                    control={form.control}
                    name="accommodationBookingReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking Reference</FormLabel>
                        <FormControl>
                           <Input placeholder="Enter booking reference" {...field} />
                         </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
             )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Previous Travel History</h3>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="previousVisits"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Have you visited this country before?
                      </FormLabel>
                      <FormDescription>
                        This information helps with your visa application
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('previousVisits') && (
                <FormField
                  control={form.control}
                  name="previousVisitDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Visit Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please provide details of your previous visits (dates, purpose, visa type, etc.)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default TravelInfo;
