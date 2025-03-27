import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { 
  CalendarIcon, 
  DollarSignIcon, 
  ClockIcon, 
  TagIcon, 
  StarIcon, 
  MessageCircleIcon, 
  AlertCircleIcon, 
  CheckCircleIcon 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Gig, User, Bid, Review } from "@shared/schema";
import { formatDateFromNow, formatCurrency, formatDeadline } from "@/lib/helpers";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const GigDetailsPage = () => {
  const { id } = useParams();
  const gigId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [bidAmount, setBidAmount] = useState<number>(0);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [bidDialogOpen, setBidDialogOpen] = useState<boolean>(false);

  // Fetch gig details
  const { data: gig, isLoading: isLoadingGig, error: gigError } = useQuery<Gig>({
    queryKey: [`/api/gigs/${gigId}`],
    enabled: !isNaN(gigId),
  });

  // Fetch gig owner
  const { data: gigOwner } = useQuery<User>({
    queryKey: [`/api/users/${gig?.userId}`],
    enabled: !!gig?.userId,
  });

  // Fetch bids for the gig
  const { data: bids } = useQuery<Bid[]>({
    queryKey: [`/api/gigs/${gigId}/bids`],
    enabled: !isNaN(gigId),
  });

  // Fetch reviews for the gig
  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/gigs/${gigId}/reviews`],
    enabled: !isNaN(gigId),
  });

  // Check if user has already bid on this gig
  const userBid = bids?.find(bid => bid.userId === user?.id);

  // Mutation for submitting a bid
  const submitBidMutation = useMutation({
    mutationFn: async (bidData: { amount: number, coverLetter: string }) => {
      const response = await apiRequest("POST", `/api/gigs/${gigId}/bids`, bidData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bid submitted successfully!",
        description: "The client will review your application.",
      });
      setBidDialogOpen(false);
      setBidAmount(0);
      setCoverLetter("");
      queryClient.invalidateQueries({ queryKey: [`/api/gigs/${gigId}/bids`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit bid",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Handle bid submission
  const handleSubmitBid = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a bid.",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    if (bidAmount <= 0) {
      toast({
        title: "Invalid bid amount",
        description: "Please enter a positive amount.",
        variant: "destructive",
      });
      return;
    }

    if (!coverLetter.trim()) {
      toast({
        title: "Cover letter required",
        description: "Please explain why you're the right person for this gig.",
        variant: "destructive",
      });
      return;
    }

    submitBidMutation.mutate({ amount: bidAmount, coverLetter });
  };

  if (isLoadingGig) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (gigError || !gig) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Gig Not Found</h1>
            <p className="text-gray-600 mb-6">The gig you're looking for doesn't exist or has been removed.</p>
            <Link href="/gigs">
              <Button>Browse Other Gigs</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{gig.title}</h1>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="info">{gig.category}</Badge>
                          <Badge variant={gig.status === "open" ? "success" : "secondary"}>
                            {gig.status || "Open"}
                          </Badge>
                          {gig.budget && (
                            <Badge variant="price">
                              {formatCurrency(gig.budget)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Posted {formatDateFromNow(gig.createdAt)}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Deadline: {formatDeadline(gig.deadline)}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <TagIcon className="w-4 h-4 mr-1" />
                        {bids?.length || 0} bids
                      </span>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {/* Main image */}
                  {gig.imageUrl && (
                    <div className="mb-6">
                      <img 
                        src={gig.imageUrl}
                        alt={gig.title}
                        className="w-full h-auto rounded-lg object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <p className="whitespace-pre-line">{gig.description}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tabs section */}
              <div className="mt-8">
                <Tabs defaultValue="bids">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bids">
                      Bids ({bids?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="reviews">
                      Reviews ({reviews?.length || 0})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="bids">
                    <Card>
                      <CardHeader>
                        <CardTitle>Bid Applications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {bids && bids.length > 0 ? (
                          <div className="space-y-4">
                            {bids.map((bid) => (
                              <div key={bid.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src="" alt="" />
                                      <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4">
                                      <p className="font-medium">Bidder #{bid.userId}</p>
                                      <p className="text-sm text-gray-500">
                                        Bid: {formatCurrency(bid.amount)}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant={
                                    bid.status === "accepted" ? "success" :
                                    bid.status === "rejected" ? "destructive" : "secondary"
                                  }>
                                    {bid.status}
                                  </Badge>
                                </div>
                                <div className="mt-2">
                                  <p className="text-gray-700">{bid.coverLetter}</p>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Submitted {formatDateFromNow(bid.createdAt)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500">No bids yet. Be the first to bid!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="reviews">
                    <Card>
                      <CardHeader>
                        <CardTitle>Client & Freelancer Reviews</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {reviews && reviews.length > 0 ? (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <div key={review.id} className="border rounded-lg p-4">
                                <div className="flex items-center">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src="" alt="" />
                                    <AvatarFallback>U</AvatarFallback>
                                  </Avatar>
                                  <div className="ml-4">
                                    <p className="font-medium">Reviewer #{review.reviewerId}</p>
                                    <div className="flex items-center">
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
                                </div>
                                <div className="mt-2">
                                  <p className="text-gray-700">{review.comment}</p>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Posted {formatDateFromNow(review.createdAt)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500">No reviews yet.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Sidebar */}
            <div>
              {/* Action card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Gig Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center">
                        <DollarSignIcon className="w-4 h-4 mr-2" /> Budget
                      </span>
                      <span className="font-semibold">{formatCurrency(gig.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" /> Deadline
                      </span>
                      <span className="font-semibold">{formatDeadline(gig.deadline)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center">
                        <TagIcon className="w-4 h-4 mr-2" /> Category
                      </span>
                      <span className="font-semibold">{gig.category}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {isAuthenticated && gig.userId !== user?.id && gig.status === "open" && (
                    userBid ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center text-gray-700">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                          <p>You have already placed a bid</p>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Your bid: {formatCurrency(userBid.amount)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Status: {userBid.status || "pending"}
                        </p>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => setBidDialogOpen(true)}
                      >
                        Submit a Bid
                      </Button>
                    )
                  )}
                  
                  {gig.userId === user?.id && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">This is your gig</p>
                      <div className="mt-4 space-x-2">
                        <Button variant="outline" size="sm">
                          Edit Gig
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {!isAuthenticated && (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">
                        Sign in to bid on this gig
                      </p>
                      <Link href="/signin">
                        <Button className="w-full">Sign In</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Client card */}
              <Card>
                <CardHeader>
                  <CardTitle>About the Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={gigOwner?.profilePicture} 
                        alt={gigOwner?.fullName || "Client"} 
                      />
                      <AvatarFallback>
                        {gigOwner?.fullName?.charAt(0) || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-medium">{gigOwner?.fullName || "Loading..."}</p>
                      <p className="text-sm text-gray-500">{gigOwner?.university || "Company"}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm">
                    <p>{gigOwner?.bio || "No bio available"}</p>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Link href={`/messages/${gig.userId}`}>
                    <Button variant="outline" className="w-full">
                      <MessageCircleIcon className="w-4 h-4 mr-2" />
                      Contact Client
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bid submission dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit a Bid</DialogTitle>
            <DialogDescription>
              Provide your bid amount and explain why you're the right person for this gig.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bid-amount">Your bid (USD)</Label>
              <Input
                id="bid-amount"
                type="number"
                min="1"
                placeholder="Enter your bid amount"
                value={bidAmount || ""}
                onChange={(e) => setBidAmount(parseFloat(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Client's budget: {formatCurrency(gig.budget)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cover-letter">Cover Letter</Label>
              <Textarea
                id="cover-letter"
                placeholder="Explain why you're the best fit for this gig..."
                rows={6}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBidDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitBid}
              disabled={submitBidMutation.isPending}
            >
              {submitBidMutation.isPending ? "Submitting..." : "Submit Bid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default GigDetailsPage;
