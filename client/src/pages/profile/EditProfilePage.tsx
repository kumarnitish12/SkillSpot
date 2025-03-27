import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Skill, insertSkillSchema } from "@shared/schema";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react";

// Define form schema
const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  university: z.string().optional(),
  major: z.string().optional(),
  profilePicture: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Skill form schema
const skillFormSchema = insertSkillSchema.omit({ userId: true }).extend({
  name: z.string().min(2, "Skill name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  yearsExperience: z.number().min(0, "Experience cannot be negative"),
});

type SkillFormValues = z.infer<typeof skillFormSchema>;

const EditProfilePage = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user skills
  const { data: skills, isLoading: isLoadingSkills } = useQuery<Skill[]>({
    queryKey: [`/api/users/${user?.id}/skills`],
    enabled: !!user?.id,
  });

  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      university: user?.university || "",
      major: user?.major || "",
      profilePicture: user?.profilePicture || "",
    },
  });

  // Initialize skill form
  const skillForm = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      yearsExperience: 0,
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest("PUT", `/api/users/${user?.id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile updated successfully!",
        description: "Your changes have been saved.",
      });
      // Update user in auth context
      updateUser(data.user);
    },
    onError: (error: any) => {
      toast({
        title: "Profile update failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Add skill mutation
  const addSkillMutation = useMutation({
    mutationFn: async (data: SkillFormValues) => {
      const response = await apiRequest("POST", "/api/skills", {
        ...data,
        userId: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Skill added successfully!",
        description: "Your skill has been added to your profile.",
      });
      setIsSkillDialogOpen(false);
      skillForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/skills`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add skill",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Delete skill mutation
  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      const response = await apiRequest("DELETE", `/api/skills/${skillId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Skill deleted",
        description: "The skill has been removed from your profile.",
      });
      setSkillToDelete(null);
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/skills`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete skill",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onAddSkill = (data: SkillFormValues) => {
    addSkillMutation.mutate(data);
  };

  const confirmDeleteSkill = (skill: Skill) => {
    setSkillToDelete(skill);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSkill = () => {
    if (skillToDelete) {
      deleteSkillMutation.mutate(skillToDelete.id);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="mt-2 text-gray-600">Update your personal information and skills</p>
          </div>

          <div className="space-y-8">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your basic profile details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage 
                          src={form.watch("profilePicture") || user.profilePicture} 
                          alt={user.fullName} 
                        />
                        <AvatarFallback className="text-2xl">
                          {user.fullName?.charAt(0) || user.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Profile Picture URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/avatar.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {user.role === "student" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="university"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>University</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="major"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Major</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about yourself..." 
                              className="resize-none"
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-4 pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate("/profile")}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>
                    Showcase your expertise to potential clients
                  </CardDescription>
                </div>
                <Button onClick={() => setIsSkillDialogOpen(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" /> Add Skill
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingSkills ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : skills && skills.length > 0 ? (
                  <div className="space-y-4">
                    {skills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium">{skill.name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {skill.yearsExperience} {skill.yearsExperience === 1 ? "year" : "years"} experience
                          </div>
                          {skill.description && (
                            <div className="text-sm text-gray-700 mt-2">{skill.description}</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="info">{skill.category}</Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => confirmDeleteSkill(skill)}
                          >
                            <Trash2Icon className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No skills added yet</p>
                    <Button 
                      variant="link" 
                      onClick={() => setIsSkillDialogOpen(true)}
                      className="mt-2"
                    >
                      Add your first skill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add Skill Dialog */}
      <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Skill</DialogTitle>
            <DialogDescription>
              Add skills to showcase your expertise to potential clients
            </DialogDescription>
          </DialogHeader>

          <Form {...skillForm}>
            <form onSubmit={skillForm.handleSubmit(onAddSkill)} className="space-y-4">
              <FormField
                control={skillForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., React Development" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={skillForm.control}
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
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                        <SelectItem value="Content Writing">Content Writing</SelectItem>
                        <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                        <SelectItem value="Video & Animation">Video & Animation</SelectItem>
                        <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                        <SelectItem value="Photography">Photography</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={skillForm.control}
                name="yearsExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        step="1"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={skillForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Briefly describe your experience and expertise..." 
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsSkillDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={addSkillMutation.isPending}
                >
                  {addSkillMutation.isPending ? "Adding..." : "Add Skill"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the skill "{skillToDelete?.name}" from your profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSkillToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSkill}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSkillMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default EditProfilePage;
