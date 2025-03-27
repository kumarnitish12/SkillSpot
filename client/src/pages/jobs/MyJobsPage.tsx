import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Bid, Gig } from "@shared/schema";
import { formatDateFromNow, formatCurrency } from "@/lib/helpers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BriefcaseIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon } from "lucide-react";

const MyJobsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("active");

  // Fetch user's gigs (if they're a client)
  const { data: myGigs, isLoading: isLoadingGigs } = useQuery<Gig[]>({
    queryKey: [`/api/users/${user?.id}/gigs`],
    enabled: !!user?.id && isAuthenticated,
  });

  // Fetch user's bids (if they're a student)
  const { data: myBids, isLoading: isLoadingBids } = useQuery<Bid[]>({
    queryKey: [`/api/users/${user?.id}/bids`],
    enabled: !!user?.id && isAuthenticated,
  });

  // Fetch all gigs to find the ones the user has bid on
  const { data: allGigs } = useQuery<Gig[]>({
    queryKey: ["/api/gigs"],
    enabled: !!myBids && myBids.length > 0,
  });

  // Connect bids with gig details
  const bidsWithGigs = myBids && allGigs
    ? myBids.map(bid => ({
        ...bid,
        gig: allGigs.find(gig => gig.id === bid.gigId)
      }))
    : [];

  // Filter gigs by status
  const filterGigsByStatus = (status: string) => {
    if (!myGigs) return [];
    if (status === "active") return myGigs.filter(gig => gig.status === "open" || gig.status === "in-progress");
    if (status === "completed") return myGigs.filter(gig => gig.status === "completed");
    return myGigs;
  };

  // Filter bids by status
  const filterBidsByStatus = (status: string) => {
    if (!bidsWithGigs) return [];
    if (status === "active") return bidsWithGigs.filter(bid => bid.status === "pending" || bid.status === "accepted");
    if (status === "completed") return bidsWithGigs.filter(bid => bid.status === "completed");
    return bidsWithGigs;
  };

  const isClient = user?.role === "client";
  const isLoading = isLoadingGigs || isLoadingBids;

  // Get content based on user role
  const getContent = () => {
    if (isClient) {
      return (
        <Tabs defaultValue="active" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Gigs</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Gigs</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="active">
                <ClientGigList gigs={filterGigsByStatus("active")} status="active" />
              </TabsContent>
              <TabsContent value="completed">
                <ClientGigList gigs={filterGigsByStatus("completed")} status="completed" />
              </TabsContent>
              <TabsContent value="all">
                <ClientGigList gigs={myGigs || []} status="all" />
              </TabsContent>
            </>
          )}
        </Tabs>
      );
    } else {
      return (
        <Tabs defaultValue="active" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Bids</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Bids</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="active">
                <StudentBidList bidsWithGigs={filterBidsByStatus("active")} status="active" />
              </TabsContent>
              <TabsContent value="completed">
                <StudentBidList bidsWithGigs={filterBidsByStatus("completed")} status="completed" />
              </TabsContent>
              <TabsContent value="all">
                <StudentBidList bidsWithGigs={bidsWithGigs} status="all" />
              </TabsContent>
            </>
          )}
        </Tabs>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
            <p className="mt-2 text-gray-600">
              {isClient 
                ? "Manage your posted gigs and review applications" 
                : "Track your bid applications and ongoing projects"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">{getContent()}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Component for client gig list
interface ClientGigListProps {
  gigs: Gig[];
  status: string;
}

const ClientGigList = ({ gigs, status }: ClientGigListProps) => {
  if (gigs.length === 0) {
    return (
      <div className="text-center py-16">
        <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No {status} gigs found</h3>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          {status === "active" 
            ? "You don't have any active gigs right now. Post a new gig to find talented students."
            : "You haven't completed any gigs yet."}
        </p>
        <Link href="/gigs/new">
          <Button className="mt-4">Post a New Gig</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {gigs.map((gig) => (
        <Card key={gig.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex-1">
                <Link href={`/gigs/${gig.id}`}>
                  <a className="text-xl font-semibold text-gray-900 hover:text-primary">
                    {gig.title}
                  </a>
                </Link>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="info">{gig.category}</Badge>
                  <Badge 
                    variant={
                      gig.status === "open" ? "success" : 
                      gig.status === "completed" ? "secondary" : 
                      "outline"
                    }
                  >
                    {gig.status}
                  </Badge>
                  <Badge variant="price">{formatCurrency(gig.budget)}</Badge>
                </div>
                
                <p className="mt-4 text-gray-600">{gig.description.substring(0, 150)}...</p>
                
                <div className="flex items-center mt-4 text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>Posted {formatDateFromNow(gig.createdAt)}</span>
                  <span className="mx-2">•</span>
                  <span>Deadline: {gig.deadline}</span>
                </div>
              </div>
              
              <div className="md:ml-6 mt-4 md:mt-0 flex flex-col items-end justify-between">
                <div className="text-right">
                  <div className="text-sm text-gray-500">0 bids</div>
                </div>
                
                <div className="mt-4 space-x-2">
                  <Link href={`/gigs/${gig.id}`}>
                    <Button size="sm" variant="outline">View Details</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Component for student bid list
interface StudentBidListProps {
  bidsWithGigs: Array<Bid & { gig?: Gig }>;
  status: string;
}

const StudentBidList = ({ bidsWithGigs, status }: StudentBidListProps) => {
  if (bidsWithGigs.length === 0) {
    return (
      <div className="text-center py-16">
        <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No {status} bids found</h3>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          {status === "active" 
            ? "You don't have any active bids right now. Browse gigs to find opportunities."
            : "You haven't completed any jobs yet."}
        </p>
        <Link href="/gigs">
          <Button className="mt-4">Browse Gigs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {bidsWithGigs.map((bid) => (
        <Card key={bid.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex-1">
                <Link href={`/gigs/${bid.gigId}`}>
                  <a className="text-xl font-semibold text-gray-900 hover:text-primary">
                    {bid.gig?.title || `Gig #${bid.gigId}`}
                  </a>
                </Link>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {bid.gig && <Badge variant="info">{bid.gig.category}</Badge>}
                  <Badge 
                    variant={
                      bid.status === "accepted" ? "success" : 
                      bid.status === "rejected" ? "destructive" : 
                      "secondary"
                    }
                  >
                    {bid.status}
                  </Badge>
                  <Badge variant="price">Your bid: {formatCurrency(bid.amount)}</Badge>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm text-gray-600 font-medium">Your cover letter:</div>
                  <p className="text-gray-600 mt-1">{bid.coverLetter.substring(0, 150)}...</p>
                </div>
                
                <div className="flex items-center mt-4 text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>Submitted {formatDateFromNow(bid.createdAt)}</span>
                </div>
              </div>
              
              <div className="md:ml-6 mt-4 md:mt-0 flex flex-col items-end justify-between">
                <div className="text-right">
                  {bid.status === "accepted" && (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      <span>Accepted</span>
                    </div>
                  )}
                  {bid.status === "rejected" && (
                    <div className="flex items-center text-red-600">
                      <AlertTriangleIcon className="h-4 w-4 mr-1" />
                      <span>Rejected</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <Link href={`/gigs/${bid.gigId}`}>
                    <Button size="sm" variant="outline">View Gig</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MyJobsPage;
