import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import WhyChooseUs from "../components/WhyChooseUs";
import HowToSection from "../components/HowToSection";
import HeroCard from "../components/HeroCard";
import Subscribe from "../components/Subscribe";
import Footer from "../components/Footer";

const categories = [
  { href: "/Cookies", name: "Cookies", imageUrl: "/baseCookies.jpg" },
  { href: "/Chocolates", name: "Chocolates", imageUrl: "/baseChocolates.jpg" },
];

const HomePage = () => {
  const { fetchFeaturedProducts, products, isLoading } = useProductStore();
  const location = useLocation();
  const categorySectionRef = useRef(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  // Move useEffect OUTSIDE JSX
  useEffect(() => {
    if (location.state?.scrollToCategories && categorySectionRef.current) {
      categorySectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <HeroCard />

      <div
        ref={categorySectionRef} // Add the ref to the category section
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-center mt-10 text-5xl sm:text-6xl font-bold mb-4">
          Explore Our Categories
        </h1>
        <p className="text-center text-xl mb-12">
          Discover the Delicious Variety
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>

        {!isLoading && products.length > 0 && (
          <FeaturedProducts featuredProducts={products} />
        )}
      </div>

      <WhyChooseUs />
      <HowToSection />
      <Subscribe />
      <Footer />
    </div>
  );
};

export default HomePage;
