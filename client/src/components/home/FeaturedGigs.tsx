import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRightIcon } from "lucide-react";
import { Gig } from "@shared/schema";
import GigCard from "@/components/gigs/GigCard";

const FeaturedGigs = () => {
  const { data: gigs, isLoading, error } = useQuery<Gig[]>({
    queryKey: ["/api/gigs"],
  });

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase">Opportunities</h2>
            <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">Featured Gigs</p>
            <p className="max-w-xl mt-5 text-base text-gray-500">
              Latest opportunities posted by startups and peers looking for talented students.
            </p>
          </div>
          <div className="hidden md:block">
            <Link href="/gigs">
              <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                View all gigs
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
            {[1, 2, 3].map((placeholder) => (
              <div key={placeholder} className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="flex-1 p-6 flex flex-col">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-6"></div>
                  <div className="flex mt-6">
                    <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                    <div className="ml-3">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-12 text-center text-red-500">Error loading gigs</div>
        ) : (
          <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
            {gigs?.length ? (
              gigs.slice(0, 3).map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No gigs available yet. Be the first to post a gig!</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 text-center md:hidden">
          <Link href="/gigs">
            <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              View all gigs
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedGigs;
