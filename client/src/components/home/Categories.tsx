import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  CodeIcon, 
  PaintbrushIcon, 
  FileTextIcon, 
  LineChartIcon, 
  SmartphoneIcon, 
  FilmIcon, 
  BarChartIcon, 
  CameraIcon,
  ArrowRightIcon
} from "lucide-react";
import { Category } from "@shared/schema";

const Categories = () => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fallback category data if API hasn't loaded yet
  const fallbackCategories = [
    { id: 1, name: "Web Development", icon: "code-s-slash-line", description: "Website creation, frontend, backend, and full-stack development services." },
    { id: 2, name: "Graphic Design", icon: "paint-brush-line", description: "Logos, illustrations, UI/UX design, and other creative visual services." },
    { id: 3, name: "Content Writing", icon: "article-line", description: "Blog posts, articles, copywriting, and academic writing services." },
    { id: 4, name: "Digital Marketing", icon: "line-chart-line", description: "Social media management, SEO, content strategy, and growth hacking." },
  ];

  const displayCategories = isLoading ? fallbackCategories : categories || fallbackCategories;

  const getCategoryIcon = (icon: string) => {
    const iconMap: Record<string, JSX.Element> = {
      "code-s-slash-line": <CodeIcon className="text-white text-xl" />,
      "paint-brush-line": <PaintbrushIcon className="text-white text-xl" />,
      "article-line": <FileTextIcon className="text-white text-xl" />,
      "line-chart-line": <LineChartIcon className="text-white text-xl" />,
      "smartphone-line": <SmartphoneIcon className="text-white text-xl" />,
      "movie-line": <FilmIcon className="text-white text-xl" />,
      "bar-chart-line": <BarChartIcon className="text-white text-xl" />,
      "camera-line": <CameraIcon className="text-white text-xl" />,
    };

    return iconMap[icon] || <CodeIcon className="text-white text-xl" />;
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary tracking-wide uppercase">Explore</h2>
          <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">Popular Categories</p>
          <p className="max-w-xl mt-5 mx-auto text-base text-gray-500">
            Discover skills and gigs across various domains and start your freelancing journey today.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {displayCategories.map((category) => (
            <div key={category.id} className="pt-6">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                      {getCategoryIcon(category.icon)}
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    {category.name}
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    {category.description}
                  </p>
                  <div className="mt-6">
                    <Link href={`/gigs?category=${encodeURIComponent(category.name)}`}>
                      <a className="inline-flex items-center text-primary hover:text-primary/90">
                        Explore
                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
