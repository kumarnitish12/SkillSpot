import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Search, 
  Filter, 
  Briefcase, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  X 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GigCard from "@/components/gigs/GigCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Gig, Category } from "@shared/schema";

const BrowseGigsPage = () => {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<URLSearchParams>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<{
    category?: string;
    price?: string;
    status?: string;
  }>({});

  useEffect(() => {
    // Parse search query from URL
    const params = new URLSearchParams(location.split("?")[1]);
    setSearchParams(params);
    
    const query = params.get("search") || "";
    setSearchQuery(query);
    
    const category = params.get("category") || "";
    if (category) {
      setSelectedCategory(category);
      setActiveFilters(prev => ({ ...prev, category }));
    }

    const price = params.get("price") || "";
    if (price) {
      setPriceRange(price);
      setActiveFilters(prev => ({ ...prev, price }));
    }

    const status = params.get("status") || "";
    if (status) {
      setStatusFilter(status);
      setActiveFilters(prev => ({ ...prev, status }));
    }
  }, [location]);

  // Fetch gigs
  const { data: gigs, isLoading: isLoadingGigs } = useQuery<Gig[]>({
    queryKey: ["/api/gigs"],
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (priceRange) params.set("price", priceRange);
    if (statusFilter) params.set("status", statusFilter);
    
    window.history.pushState({}, "", `?${params.toString()}`);
    setSearchParams(params);
  };

  // Filter gigs based on search parameters
  const filteredGigs = gigs?.filter(gig => {
    // Search query filter
    if (searchQuery && !gig.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !gig.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory && gig.category !== selectedCategory) {
      return false;
    }
    
    // Price range filter
    if (priceRange) {
      if (priceRange === "low" && gig.budget > 100) return false;
      if (priceRange === "medium" && (gig.budget < 100 || gig.budget > 500)) return false;
      if (priceRange === "high" && gig.budget < 500) return false;
    }
    
    // Status filter
    if (statusFilter && gig.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  // Remove a filter
  const removeFilter = (filterKey: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(filterKey);
    window.history.pushState({}, "", `?${params.toString()}`);
    
    if (filterKey === "category") setSelectedCategory("");
    if (filterKey === "price") setPriceRange("");
    if (filterKey === "status") setStatusFilter("");
    
    setActiveFilters(prev => {
      const updated = { ...prev };
      delete updated[filterKey as keyof typeof updated];
      return updated;
    });
    
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {/* Search Header */}
        <div className="bg-primary-700 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-white">Find the Perfect Gig</h1>
            <p className="mt-2 text-lg text-primary-100">Search through gigs posted by startups and other students</p>
            
            <form onSubmit={handleSearch} className="mt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Search for gigs..."
                    className="pl-10 py-2 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-56">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit">Search</Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2" /> Filters
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
              <div>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Price</SelectItem>
                    <SelectItem value="low">$ (Under $100)</SelectItem>
                    <SelectItem value="medium">$$ ($100-$500)</SelectItem>
                    <SelectItem value="high">$$$ ($500+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setPriceRange("");
                  setStatusFilter("");
                  setActiveFilters({});
                  window.history.pushState({}, "", location.split("?")[0]);
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
          
          {/* Active filters */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500">Active filters:</span>
                {activeFilters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {activeFilters.category}
                    <button onClick={() => removeFilter("category")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {activeFilters.price && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {activeFilters.price === "low" ? "Under $100" : 
                      activeFilters.price === "medium" ? "$100-$500" : "Over $500"}
                    <button onClick={() => removeFilter("price")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {activeFilters.status && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activeFilters.status}
                    <button onClick={() => removeFilter("status")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <Separator className="mb-6" />
          
          {/* Results section */}
          <div>
            {isLoadingGigs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-lg shadow-lg overflow-hidden bg-white animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-6">
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
            ) : filteredGigs && filteredGigs.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-gray-500">Showing {filteredGigs.length} gigs</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGigs.map((gig) => (
                    <GigCard key={gig.id} gig={gig} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No gigs found</h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setPriceRange("");
                    setStatusFilter("");
                    setActiveFilters({});
                    window.history.pushState({}, "", location.split("?")[0]);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrowseGigsPage;
