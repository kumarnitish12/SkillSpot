import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Create Your Profile",
      description: "Sign up and build your professional profile highlighting your skills, experience, and portfolio.",
      imageSrc: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      imageAlt: "Student creating profile",
    },
    {
      number: 2,
      title: "Browse or Post Gigs",
      description: "Find gigs that match your skills or post a project when you need student talent.",
      imageSrc: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      imageAlt: "Browsing gigs",
    },
    {
      number: 3,
      title: "Get Paid Securely",
      description: "Complete work, get client approval, and receive payment through our secure escrow system.",
      imageSrc: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      imageAlt: "Payment transaction",
    },
  ];

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary tracking-wide uppercase">Process</h2>
          <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">How SkillHub Works</p>
          <p className="max-w-xl mt-5 mx-auto text-base text-gray-500">
            Simple steps to start earning or finding the perfect student for your project.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="bg-white p-8 rounded-lg shadow-md">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 bg-primary rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-xl">
                    {step.number}
                  </div>
                  <img
                    className="h-48 w-full object-cover rounded"
                    src={step.imageSrc}
                    alt={step.imageAlt}
                  />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">{step.title}</h3>
                <p className="mt-2 text-base text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
