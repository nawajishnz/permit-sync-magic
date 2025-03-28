
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

interface PassportInfoProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const formSchema = z.object({
  passportNumber: z.string().min(1, { message: "Passport number is required" }),
  issuingCountry: z.string().min(1, { message: "Issuing country is required" }),
  issueDate: z.string().min(1, { message: "Issue date is required" }),
  expiryDate: z.string().min(1, { message: "Expiry date is required" }),
  hasOtherPassports: z.boolean(),
  otherPassportDetails: z.string().optional(),
});

const PassportInfo: React.FC<PassportInfoProps> = ({ formData, updateFormData }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passportNumber: formData.passportNumber || '',
      issuingCountry: formData.issuingCountry || '',
      issueDate: formData.issueDate || '',
      expiryDate: formData.expiryDate || '',
      hasOtherPassports: formData.hasOtherPassports || false,
      otherPassportDetails: formData.otherPassportDetails || '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateFormData({
      ...formData,
      ...values,
    });
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
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Passport Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="passportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passport Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter passport number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issuingCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuing Country <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="usa">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="australia">Australia</SelectItem>
                        <SelectItem value="germany">Germany</SelectItem>
                        {/* Add more countries as needed */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Most countries require your passport to be valid for at least 6 months beyond your planned stay.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Additional Passport Information</h3>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="hasOtherPassports"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Do you hold any other passports or nationalities?
                      </FormLabel>
                      <FormDescription>
                        This information is required for security checks
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

              {form.watch('hasOtherPassports') && (
                <FormField
                  control={form.control}
                  name="otherPassportDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Passport Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please provide details of your other passports (country, passport number, etc.)" 
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

export default PassportInfo;
