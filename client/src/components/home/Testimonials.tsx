import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, StarHalf } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Mia Thompson",
      role: "Computer Science Student",
      content:
        "SkillHub has been a game-changer for me financially. I've been able to pay my tuition by taking on web development projects while gaining real-world experience that looks great on my resume.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      id: 2,
      name: "David Kim",
      role: "Startup Founder",
      content:
        "As a bootstrapped startup, finding affordable talent was crucial. Through SkillHub, we connected with talented students who delivered exceptional work at rates that fit our budget.",
      rating: 4.5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ];

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="text-yellow-400" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="text-yellow-400" />);
    }

    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:pb-32 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary tracking-wide uppercase">
            Testimonials
          </h2>
          <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What Students & Clients Say
          </p>
          <p className="max-w-xl mt-5 mx-auto text-base text-gray-500">
            Hear from the SkillHub community about their experiences on the platform.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 p-8 rounded-lg shadow">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold">{testimonial.name}</h4>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 italic">"{testimonial.content}"</p>
                <div className="mt-4">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
