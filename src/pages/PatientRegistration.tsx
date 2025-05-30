
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Patient } from '@/types/patient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinic } from '@/contexts/ClinicContext';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  firstName: z.string().min(1, {
    message: 'First name is required'
  }),
  lastName: z.string().min(1, {
    message: 'Last name is required'
  }),
  dateOfBirth: z.string().min(1, {
    message: 'Date of birth is required'
  }),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select a gender'
  }),
  contactNumber: z.string().min(1, {
    message: 'Contact number is required'
  }),
  email: z.string().email({
    message: 'Invalid email'
  }).optional().or(z.literal('')),
  address: z.string().optional(),
  age: z.number({
    required_error: 'Age is required',
    invalid_type_error: 'Age must be a number'
  }).int().positive({
    message: 'Age must be a positive number'
  }),
  weight: z.number({
    required_error: 'Weight is required',
    invalid_type_error: 'Weight must be a number'
  }).positive({
    message: 'Weight must be a positive number'
  })
});

type FormValues = z.infer<typeof formSchema>;

const PatientRegistration: React.FC = () => {
  const {
    addPatient
  } = useClinic();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      contactNumber: '',
      email: '',
      address: '',
      age: undefined,
      weight: undefined
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Ensure all required fields are present and convert optional fields as needed
      const patientData: Omit<Patient, 'id' | 'mrNumber' | 'registrationDate' | 'medicalHistory'> = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        contactNumber: data.contactNumber,
        email: data.email || undefined,
        address: data.address || undefined,
        age: data.age,
        weight: data.weight
      };
      
      const newPatient = await addPatient(patientData);
      
      toast({
        title: 'Patient registered successfully',
        description: `MR Number: ${newPatient.mrNumber}`
      });
      
      navigate(`/patients/${newPatient.id}`);
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'An error occurred while registering the patient.',
        variant: 'destructive'
      });
      console.error(error);
    }
  };

  return <div>
      <h1 className="font-bold mb-6 text-[#195110] text-4xl">New Patient Registration</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>Register a new patient in the system</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({
                field
              }) => <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="lastName" render={({
                field
              }) => <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="dateOfBirth" render={({
                field
              }) => <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="gender" render={({
                field
              }) => <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="contactNumber" render={({
                field
              }) => <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="email" render={({
                field
              }) => <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                    
                <FormField control={form.control} name="age" render={({
                field
              }) => <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter age" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                    
                <FormField control={form.control} name="weight" render={({
                field
              }) => <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="Enter weight" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
              
              <FormField control={form.control} name="address" render={({
              field
            }) => <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter patient's address" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-clinic-teal hover:opacity-90">
                Register Patient
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>;
};

export default PatientRegistration;
