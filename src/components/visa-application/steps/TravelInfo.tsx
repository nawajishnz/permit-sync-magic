
import React from 'react';
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
import * as z from 'zod';

interface TravelInfoProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const formSchema = z.object({
  purposeOfTravel: z.string().min(1, { message: "Purpose is required" }),
  departureDate: z.string().min(1, { message: "Departure date is required" }),
  returnDate: z.string().min(1, { message: "Return date is required" }),
  accommodationType: z.string().min(1, { message: "Accommodation type is required" }),
  accommodationName: z.string().optional(),
  accommodationAddress: z.string().optional(),
  accommodationBookingReference: z.string().optional(),
  previousVisits: z.boolean(),
  previousVisitDetails: z.string().optional(),
});

const TravelInfo: React.FC<TravelInfoProps> = ({ formData, updateFormData }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purposeOfTravel: formData.purposeOfTravel || '',
      departureDate: formData.departureDate || '',
      returnDate: formData.returnDate || '',
      accommodationType: formData.accommodation?.type || '',
      accommodationName: formData.accommodation?.name || '',
      accommodationAddress: formData.accommodation?.address || '',
      accommodationBookingReference: formData.accommodation?.bookingReference || '',
      previousVisits: formData.previousVisits || false,
      previousVisitDetails: formData.previousVisitDetails || '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedFormData = {
      ...formData,
      purposeOfTravel: values.purposeOfTravel,
      departureDate: values.departureDate,
      returnDate: values.returnDate,
      accommodation: {
        type: values.accommodationType,
        name: values.accommodationName,
        address: values.accommodationAddress,
        bookingReference: values.accommodationBookingReference,
      },
      previousVisits: values.previousVisits,
      previousVisitDetails: values.previousVisitDetails,
    };
    updateFormData(updatedFormData);
  }

  // Update the form data whenever a field changes
  React.useEffect(() => {
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
            <h3 className="text-lg font-semibold mb-4">Accommodation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="accommodationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accommodation Type <span className="text-red-500">*</span></FormLabel>
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
