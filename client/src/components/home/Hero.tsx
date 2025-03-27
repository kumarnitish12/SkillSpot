import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gigs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative bg-primary-700">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
          alt="Students working together"
        />
        <div className="absolute inset-0 bg-primary-700 mix-blend-multiply" aria-hidden="true"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Find gigs. Showcase skills.
        </h1>
        <p className="mt-6 max-w-xl text-xl text-gray-100">
          A marketplace for college students to monetize their skills and find opportunities with startups and peers.
        </p>
        <div className="mt-10 max-w-sm">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative rounded-md shadow-sm">
              <Input
                type="text"
                placeholder="Search for skills or gigs"
                className="pl-4 pr-12 py-3 text-lg border-gray-300 rounded-md w-full focus:ring-primary focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button
                  type="submit"
                  className="h-full bg-primary px-4 rounded-r-md text-white hover:bg-primary/90 focus:outline-none"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero;
