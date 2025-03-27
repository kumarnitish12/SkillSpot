import { User, Gig, Review, Skill } from "@shared/schema";
import { format, formatDistanceToNow } from "date-fns";

// Date formatting helpers
export const formatDate = (date: string | Date) => {
  try {
    return format(new Date(date), "MMM d, yyyy");
  } catch (error) {
    return "Invalid date";
  }
};

export const formatDateFromNow = (date: string | Date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (error) {
    return "Invalid date";
  }
};

// User helpers
export const getUserFullName = (user?: User | null) => {
  if (!user) return "Unknown User";
  return user.fullName || user.username || "Unknown User";
};

export const getInitials = (name: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

export const getProfileImageFallback = (user?: User | null) => {
  if (!user || !user.fullName) return "U";
  return user.fullName.charAt(0).toUpperCase();
};

// Calculate average rating
export const calculateAverageRating = (reviews?: Review[]) => {
  if (!reviews || reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};

// Format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Get price range indicator ($ - $$$)
export const getPriceRangeIndicator = (budget: number) => {
  if (budget >= 500) return "$$$";
  if (budget >= 100) return "$$";
  return "$";
};

// Group skills by category
export const groupSkillsByCategory = (skills: Skill[]) => {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
};

// Get appropriate gig image based on category
export const getGigImageByCategory = (gig: Gig) => {
  const defaultImageMap: Record<string, string> = {
    "Web Development": "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "Graphic Design": "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "Content Writing": "https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "Digital Marketing": "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "Mobile Development": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "Video & Animation": "https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "Data Analysis": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "Photography": "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  };

  // Return image URL from gig if available, otherwise default by category
  return gig.imageUrl || defaultImageMap[gig.category] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
};

// Truncate text
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Format deadline
export const formatDeadline = (deadline: string) => {
  try {
    if (deadline.includes('T')) {
      // If it's an ISO string
      return format(new Date(deadline), "MMM d, yyyy");
    } else {
      // Try to parse various date formats
      return deadline;
    }
  } catch (error) {
    return deadline; // Return as is if parsing fails
  }
};
