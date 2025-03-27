import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Gig, User, Bid } from "@shared/schema";

interface GigCardProps {
  gig: Gig;
}

// Function to determine price badge display based on budget
const getPriceBadge = (budget: number) => {
  if (budget >= 500) {
    return "$$$";
  } else if (budget >= 100) {
    return "$$";
  } else {
    return "$";
  }
};

const GigCard: React.FC<GigCardProps> = ({ gig }) => {
  const { data: gigOwner } = useQuery<User>({
    queryKey: [`/api/users/${gig.userId}`],
  });

  const { data: bids } = useQuery<Bid[]>({
    queryKey: [`/api/gigs/${gig.id}/bids`],
  });

  // Default image for gigs by category
  const defaultImageMap: Record<string, string> = {
    "Web Development": "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "Graphic Design": "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "Content Writing": "https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "Digital Marketing": "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "Mobile Development": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  };

  const defaultImage = defaultImageMap[gig.category] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
  const gigImage = gig.imageUrl || defaultImage;

  // Format the date
  const timeAgo = gig.createdAt 
    ? formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true }) 
    : "recently";

  const bidCount = bids?.length || 0;

  return (
    <Card className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
      <div className="flex-shrink-0">
        <img className="h-48 w-full object-cover" src={gigImage} alt={gig.title} />
      </div>
      <CardContent className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary flex gap-2">
            <Badge variant="price">{getPriceBadge(gig.budget)}</Badge>
            <Badge variant="info">{gig.category}</Badge>
          </p>
          <Link href={`/gigs/${gig.id}`}>
            <a className="block mt-2">
              <p className="text-xl font-semibold text-gray-900">{gig.title}</p>
              <p className="mt-3 text-base text-gray-500">{gig.description}</p>
            </a>
          </Link>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            <Link href={`/users/${gig.userId}`}>
              <a>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={gigOwner?.profilePicture} alt={gigOwner?.fullName || "User"} />
                  <AvatarFallback>{gigOwner?.fullName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </a>
            </Link>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              <Link href={`/users/${gig.userId}`}>
                <a className="hover:underline">
                  {gigOwner?.fullName || gigOwner?.username || "Loading..."}
                </a>
              </Link>
            </p>
            <div className="flex space-x-1 text-sm text-gray-500">
              <time dateTime={gig.createdAt}>Posted {timeAgo}</time>
              <span aria-hidden="true">&middot;</span>
              <span>{bidCount} {bidCount === 1 ? "applicant" : "applicants"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GigCard;
