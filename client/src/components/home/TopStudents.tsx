import { useQuery } from "@tanstack/react-query";
import { Star, StarHalf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { User, Review } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StudentWithReviews extends User {
  averageRating: number;
  totalReviews: number;
  skills: string[];
}

// Mock top skills for students (in a real app, would come from API)
const studentSkills: Record<number, string[]> = {
  1: ["Figma", "Adobe XD", "Sketch"],
  2: ["React", "Node.js", "MongoDB"],
  3: ["Blogging", "SEO", "Copywriting"],
};

const TopStudents = () => {
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: reviewsData } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  // Calculate top students based on ratings
  const topStudents: StudentWithReviews[] = users
    ? users
        .filter((user) => user.role === "student")
        .map((user) => {
          const userReviews = reviewsData?.filter(
            (review) => review.revieweeId === user.id
          ) || [];
          const totalReviews = userReviews.length;
          const sumRatings = userReviews.reduce(
            (sum, review) => sum + review.rating,
            0
          );
          const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

          return {
            ...user,
            averageRating,
            totalReviews,
            skills: studentSkills[user.id] || ["Design", "Coding", "Writing"],
          };
        })
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 3)
    : [];

  // Fallback data if no users loaded yet
  const fallbackStudents: StudentWithReviews[] = [
    {
      id: 1,
      username: "emilychen",
      password: "",
      email: "emily@university.edu",
      fullName: "Emily Chen",
      bio: "UI/UX Designer with a passion for creating beautiful experiences",
      university: "Design Institute",
      major: "Interactive Design",
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
      isVerified: true,
      role: "student",
      averageRating: 5,
      totalReviews: 24,
      skills: ["Figma", "Adobe XD", "Sketch"],
    },
    {
      id: 2,
      username: "mjohnson",
      password: "",
      email: "marcus@university.edu",
      fullName: "Marcus Johnson",
      bio: "Full stack developer with experience in modern web technologies",
      university: "Tech University",
      major: "Computer Science",
      profilePicture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
      isVerified: true,
      role: "student",
      averageRating: 4.5,
      totalReviews: 19,
      skills: ["React", "Node.js", "MongoDB"],
    },
    {
      id: 3,
      username: "sophiar",
      password: "",
      email: "sophia@university.edu",
      fullName: "Sophia Rodriguez",
      bio: "Content writer specializing in tech and education topics",
      university: "Liberal Arts College",
      major: "English",
      profilePicture: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
      isVerified: true,
      role: "student",
      averageRating: 5,
      totalReviews: 31,
      skills: ["Blogging", "SEO", "Copywriting"],
    },
  ];

  const displayStudents = topStudents.length ? topStudents : fallbackStudents;

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="text-yellow-400" />);
    }

    return stars;
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 text-center sm:px-6 lg:px-8 lg:py-24">
        <div className="space-y-12">
          <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Top Rated Students</h2>
            <p className="text-xl text-gray-500">
              Discover talented students with proven skills and excellent feedback from clients.
            </p>
          </div>
          <ul className="mx-auto space-y-16 sm:grid sm:grid-cols-2 sm:gap-16 sm:space-y-0 lg:grid-cols-3 lg:max-w-5xl">
            {displayStudents.map((student) => (
              <li key={student.id}>
                <div className="space-y-6">
                  <Avatar className="mx-auto h-40 w-40 rounded-full xl:w-56 xl:h-56">
                    <AvatarImage src={student.profilePicture} alt={student.fullName} />
                    <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="text-lg leading-6 font-medium space-y-1">
                      <h3>{student.fullName}</h3>
                      <p className="text-primary">{student.bio?.split(' ').slice(0, 2).join(' ')}</p>
                    </div>
                    <div className="flex justify-center">
                      <div className="flex items-center">
                        {renderStars(student.averageRating)}
                        <span className="ml-1 text-gray-500">({student.totalReviews} reviews)</span>
                      </div>
                    </div>
                    <ul className="flex justify-center space-x-2">
                      {student.skills.map((skill, index) => (
                        <li key={index}>
                          <Badge variant="info">{skill}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TopStudents;
