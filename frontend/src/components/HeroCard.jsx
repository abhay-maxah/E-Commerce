import heroVideo from "../assets/HeroCard.mp4";
import { Link } from "react-router-dom";

export default function HeroCard() {
  return (
    <div className="relative w-full min-h-screen md:h-[500px] md:mt-2 lg:h-[600px]  flex items-center justify-center text-center">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

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
