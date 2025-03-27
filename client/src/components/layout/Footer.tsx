import { Link } from "wouter";
import { 
  FacebookIcon, 
  InstagramIcon, 
  TwitterIcon, 
  LinkedinIcon 
} from "lucide-react";

const Footer = () => {
  const links = {
    platform: [
      { title: "How it works", href: "#" },
      { title: "Pricing", href: "#" },
      { title: "FAQ", href: "#" },
      { title: "Find Gigs", href: "/gigs" },
    ],
    resources: [
      { title: "Blog", href: "#" },
      { title: "Guides", href: "#" },
      { title: "Success Stories", href: "#" },
      { title: "Events", href: "#" },
    ],
    company: [
      { title: "About", href: "#" },
      { title: "Team", href: "#" },
      { title: "Partners", href: "#" },
      { title: "Careers", href: "#" },
    ],
    legal: [
      { title: "Privacy", href: "#" },
      { title: "Terms", href: "#" },
      { title: "Cookie Policy", href: "#" },
      { title: "Contact", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: <FacebookIcon className="h-5 w-5" />, href: "#" },
    { icon: <InstagramIcon className="h-5 w-5" />, href: "#" },
    { icon: <TwitterIcon className="h-5 w-5" />, href: "#" },
    { icon: <LinkedinIcon className="h-5 w-5" />, href: "#" },
  ];

  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-4">
              {links.platform.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <a className="text-base text-gray-300 hover:text-white">
                      {link.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              {links.resources.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <a className="text-base text-gray-300 hover:text-white">
                      {link.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              {links.company.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <a className="text-base text-gray-300 hover:text-white">
                      {link.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              {links.legal.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <a className="text-base text-gray-300 hover:text-white">
                      {link.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {socialLinks.map((link, index) => (
              <a key={index} href={link.href} className="text-gray-400 hover:text-white">
                <span className="sr-only">Social media</span>
                {link.icon}
              </a>
            ))}
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} SkillHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
