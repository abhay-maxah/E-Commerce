import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroVideo from "../assets/HeroCard.mp4";
import image3 from "../assets/Herocard4.jpg";

const backgrounds = [heroVideo, image3];
export default function HeroCard() {
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 4000); // Switch every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-[75vh] lg:min-h-screen md:min-h-[75vh] sm:min-h-[73vh] md:mt-2 flex items-center justify-center text-center">
      {/* Background Video or Images */}
      {backgroundIndex === 0 ? (
        <video
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          autoPlay
          loop
          muted
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      ) : (
        <img
          src={backgrounds[backgroundIndex]}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          alt="Hero"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Content */}
      <div className="relative z-10 top-3 text-white flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">
          Cozy up with our new cookies collection
        </h1>
        <Link
          to="/category/Cookies"
          className="px-6 py-3 bg-[#fcf7f8] border text-[#A31621] border-[#A31621] hover:bg-[#A31621] hover:text-white transition-colors duration-300 text-lg font-semibold rounded-full shadow-md"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}
