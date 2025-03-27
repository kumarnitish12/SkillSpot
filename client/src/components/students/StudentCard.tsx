import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Skill, Review } from "@shared/schema";
import { Star, StarHalf } from "lucide-react";

interface StudentCardProps {
  student: User;
  skills?: Skill[];
  reviews?: Review[];
}

const StudentCard: React.FC<StudentCardProps> = ({ student, skills, reviews }) => {
  // Calculate average rating
  const totalReviews = reviews?.length || 0;
  const sumRatings = reviews?.reduce((sum, review) => sum + review.rating, 0) || 0;
  const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="text-yellow-400 h-4 w-4" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="text-yellow-400 h-4 w-4" />);
    }

    return stars;
  };

  // Get top skills (limited to 3)
  const topSkills = skills?.slice(0, 3) || [];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage 
              src={student.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
              alt={student.fullName} 
            />
            <AvatarFallback>{student.fullName?.charAt(0) || student.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <h3 className="text-lg font-semibold">{student.fullName}</h3>
          <p className="text-primary text-sm">{student.major} @ {student.university}</p>
          
          <div className="flex items-center mt-2">
            {renderStars(averageRating)}
            <span className="ml-1 text-sm text-gray-500">({totalReviews} reviews)</span>
          </div>
          
          <div className="w-full border-t border-gray-200 my-4"></div>
          
          <p className="text-sm text-gray-500 text-center mb-4 line-clamp-2">
            {student.bio || "No bio available"}
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {topSkills.length > 0 ? (
              topSkills.map((skill) => (
                <Badge key={skill.id} variant="info">
                  {skill.name}
                </Badge>
              ))
            ) : (
              <>
                <Badge variant="info">Design</Badge>
                <Badge variant="info">Development</Badge>
                <Badge variant="info">Writing</Badge>
              </>
            )}
          </div>
          
          <div className="mt-5 w-full">
            <Link href={`/users/${student.id}`}>
              <a className="block text-center text-sm text-primary hover:text-primary-600">
                View Profile
              </a>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
