import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedGigs from "@/components/home/FeaturedGigs";
import TopStudents from "@/components/home/TopStudents";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Categories />
        <FeaturedGigs />
        <TopStudents />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
