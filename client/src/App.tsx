import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import HomePage from "@/pages/HomePage";
import SignInPage from "@/pages/auth/SignInPage";
import SignUpPage from "@/pages/auth/SignUpPage";
import BrowseGigsPage from "@/pages/gigs/BrowseGigsPage";
import GigDetailsPage from "@/pages/gigs/GigDetailsPage";
import PostGigPage from "@/pages/gigs/PostGigPage";
import MyProfilePage from "@/pages/profile/MyProfilePage";
import EditProfilePage from "@/pages/profile/EditProfilePage";
import MyJobsPage from "@/pages/jobs/MyJobsPage";
import MessagesPage from "@/pages/messages/MessagesPage";
import NotFound from "@/pages/not-found";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading state to ensure auth state is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/signin" component={SignInPage} />
          <Route path="/signup" component={SignUpPage} />
          <Route path="/gigs" component={BrowseGigsPage} />
          <Route path="/gigs/:id" component={GigDetailsPage} />
          <Route path="/gigs/new" component={PostGigPage} />
          <Route path="/profile" component={MyProfilePage} />
          <Route path="/profile/edit" component={EditProfilePage} />
          <Route path="/jobs" component={MyJobsPage} />
          <Route path="/messages" component={MessagesPage} />
          <Route path="/messages/:userId" component={MessagesPage} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
