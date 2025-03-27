import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { User, Skill, Review, Gig, Bid } from "@shared/schema";
import { calculateAverageRating, formatDateFromNow, formatCurrency } from "@/lib/helpers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  PencilIcon, 
  PlusIcon, 
  StarIcon, 
  BriefcaseIcon, 
  GraduationCapIcon, 
  MailIcon, 
  UserIcon, 
  StarHalfIcon 
} from "lucide-react";

const MyProfilePage = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

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

  // Fetch user reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/users/${user?.id}/reviews`],
    enabled: !!user?.id,
  });

  // Fetch user gigs
  const { data: gigs, isLoading: isLoadingGigs } = useQuery<Gig[]>({
    queryKey: [`/api/users/${user?.id}/gigs`],
    enabled: !!user?.id,
  });

  // Fetch user bids
  const { data: bids, isLoading: isLoadingBids } = useQuery<Bid[]>({
    queryKey: [`/api/users/${user?.id}/bids`],
    enabled: !!user?.id,
  });

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

  // Calculate average rating
  const averageRating = calculateAverageRating(reviews);

  // Generate star rating display
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <StarIcon key={index} className="h-5 w-5 text-yellow-400" fill="currentColor" />;
          } else if (index === fullStars && hasHalfStar) {
            return <StarHalfIcon key={index} className="h-5 w-5 text-yellow-400" fill="currentColor" />;
          } else {
            return <StarIcon key={index} className="h-5 w-5 text-gray-300" />;
          }
        })}
        <span className="ml-2 text-gray-600">
          {averageRating.toFixed(1)} ({reviews?.length || 0} reviews)
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile sidebar */}
            <div>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={user.profilePicture} alt={user.fullName} />
                        <AvatarFallback className="text-3xl">
                          {user.fullName?.charAt(0) || user.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Link href="/profile/edit">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="absolute bottom-0 right-0"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">{user.fullName}</h1>
                    <p className="text-gray-500">@{user.username}</p>
                    
                    {user.role === "student" && (
                      <div className="mt-2 flex items-center">
                        <GraduationCapIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-gray-600">
                          {user.major} @ {user.university}
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      {reviews && reviews.length > 0 ? renderStars(averageRating) : (
                        <span className="text-gray-500">No reviews yet</span>
                      )}
                    </div>
                    
                    <div className="mt-6 w-full">
                      <Link href="/profile/edit">
                        <Button variant="outline" className="w-full">
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                        About
                      </h3>
                      <p className="text-gray-700">{user.bio || "No bio provided"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Contact
                      </h3>
                      <div className="flex items-center mb-2">
                        <MailIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-700">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Skills section */}
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Skills</CardTitle>
                  <Link href="/profile/edit">
                    <Button size="sm" variant="outline">
                      <PlusIcon className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {isLoadingSkills ? (
                    <div className="animate-pulse space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : skills && skills.length > 0 ? (
                    <div className="space-y-4">
                      {skills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{skill.name}</div>
                            <div className="text-sm text-gray-500">
                              {skill.yearsExperience} {skill.yearsExperience === 1 ? "year" : "years"} experience
                            </div>
                          </div>
                          <Badge variant="info">{skill.category}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No skills added yet</p>
                      <Link href="/profile/edit">
                        <Button size="sm" variant="link" className="mt-2">
                          Add your first skill
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="gigs">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="gigs">
                    My Gigs
                  </TabsTrigger>
                  <TabsTrigger value="bids">
                    My Bids
                  </TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="gigs">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Posted Gigs</CardTitle>
                      <Link href="/gigs/new">
                        <Button>
                          <PlusIcon className="h-4 w-4 mr-2" /> Post New Gig
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      {isLoadingGigs ? (
                        <div className="animate-pulse space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                          ))}
                        </div>
                      ) : gigs && gigs.length > 0 ? (
                        <div className="space-y-4">
                          {gigs.map((gig) => (
                            <div key={gig.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Link href={`/gigs/${gig.id}`}>
                                    <a className="text-lg font-medium hover:text-primary">
                                      {gig.title}
                                    </a>
                                  </Link>
                                  <div className="mt-1 flex items-center space-x-2">
                                    <Badge variant="info">{gig.category}</Badge>
                                    <Badge variant={
                                      gig.status === "open" ? "success" : 
                                      gig.status === "completed" ? "secondary" : "outline"
                                    }>
                                      {gig.status}
                                    </Badge>
                                  </div>
                                  <p className="mt-2 text-sm text-gray-500">
                                    Budget: {formatCurrency(gig.budget)}
                                  </p>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                  Posted {formatDateFromNow(gig.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900">No gigs posted yet</h3>
                          <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                            Start posting gigs to find talented students for your projects.
                          </p>
                          <Link href="/gigs/new">
                            <Button className="mt-4">Post Your First Gig</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="bids">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Bid Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingBids ? (
                        <div className="animate-pulse space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                          ))}
                        </div>
                      ) : bids && bids.length > 0 ? (
                        <div className="space-y-4">
                          {bids.map((bid) => (
                            <div key={bid.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Link href={`/gigs/${bid.gigId}`}>
                                    <a className="text-lg font-medium hover:text-primary">
                                      Gig #{bid.gigId}
                                    </a>
                                  </Link>
                                  <p className="mt-1 text-gray-500">
                                    Amount: {formatCurrency(bid.amount)}
                                  </p>
                                  <p className="mt-2 text-sm text-gray-600">
                                    {bid.coverLetter.substring(0, 60)}...
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge variant={
                                    bid.status === "accepted" ? "success" :
                                    bid.status === "rejected" ? "destructive" : "secondary"
                                  }>
                                    {bid.status}
                                  </Badge>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Submitted {formatDateFromNow(bid.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900">No bids submitted yet</h3>
                          <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                            Browse available gigs and submit bids to start earning.
                          </p>
                          <Link href="/gigs">
                            <Button className="mt-4">Browse Gigs</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reviews Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingReviews ? (
                        <div className="animate-pulse space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                          ))}
                        </div>
                      ) : reviews && reviews.length > 0 ? (
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div key={review.id} className="border rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    <UserIcon className="h-6 w-6" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="ml-3">
                                  <p className="font-medium">User #{review.reviewerId}</p>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIcon
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                        fill={i < review.rating ? "currentColor" : "none"}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="ml-auto text-sm text-gray-500">
                                  {formatDateFromNow(review.createdAt)}
                                </div>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                              <div className="mt-2 text-sm">
                                <Link href={`/gigs/${review.gigId}`}>
                                  <a className="text-primary hover:underline">
                                    View associated gig
                                  </a>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                          <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                            Complete gigs and get reviews from clients to build your reputation.
                          </p>
                          <Link href="/gigs">
                            <Button className="mt-4">Find Gigs</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyProfilePage;
