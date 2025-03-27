import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { insertGigSchema, Category } from "@shared/schema";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { format } from "date-fns";

// Extend the schema with form validation
const postGigSchema = insertGigSchema.extend({
  budget: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Budget must be a positive number" }
  ),
});

type PostGigFormValues = z.infer<typeof postGigSchema>;

const PostGigPage = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 1 week from now
  );

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/signin");
    toast({
      title: "Authentication required",
      description: "Please sign in to post a gig",
      variant: "destructive",
    });
  }

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Initialize form
  const form = useForm<PostGigFormValues>({
    resolver: zodResolver(postGigSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      budget: "",
      deadline: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      status: "open",
      userId: user?.id || 0,
    },
  });

  // Submit mutation
  const createGigMutation = useMutation({
    mutationFn: async (gigData: PostGigFormValues) => {
      // Convert budget from string to number
      const dataWithNumberBudget = {
        ...gigData,
        budget: parseFloat(gigData.budget),
        userId: user?.id,
      };
      
      const response = await apiRequest("POST", "/api/gigs", dataWithNumberBudget);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Gig posted successfully!",
        description: "Your gig is now visible to students.",
      });
      navigate(`/gigs/${data.gig.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post gig",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostGigFormValues) => {
    createGigMutation.mutate(data);
  };

  // Update deadline when date is selected
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      form.setValue("deadline", format(date, "yyyy-MM-dd"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Post a New Gig</h1>
            <p className="mt-2 text-gray-600">
              Describe your project and find talented students to help you
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gig Details</CardTitle>
              <CardDescription>
                Provide detailed information to attract the right candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gig Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Web Developer for E-commerce Site" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your project, requirements, and expectations..." 
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              step="1"
                              placeholder="e.g., 500" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Deadline</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full pl-3 text-left font-normal"
                                >
                                  {selectedDate ? (
                                    format(selectedDate, "MMMM d, yyyy")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                    <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Tips for getting quality applications:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Be specific about project requirements</li>
                        <li>Provide clear deliverables and expectations</li>
                        <li>Set a reasonable budget based on the scope</li>
                        <li>Mention preferred skills or experience</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/gigs")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createGigMutation.isPending}
                    >
                      {createGigMutation.isPending ? "Posting..." : "Post Gig"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostGigPage;
