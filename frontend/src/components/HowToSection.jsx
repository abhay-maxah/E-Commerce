const HowToSection = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-[#A31621] px-6 md:px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 w-full max-w-[1200px]">
        {/* Left Side - Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left lg:text-center w-full lg:mt-0 md:mt-0 sm:mt-12 md:w-[80%] lg:w-[60%] max-w-[800px]">
          <h3 className="uppercase font-bold text-lg md:text-xl lg:text-2xl tracking-wider mb-4">
            How-To
          </h3>
          <hr className="w-full border-t-2 border-[#A31621] mb-4" />
          <p className="text-base lg:text-xl md:text-sm leading-relaxed">
            Every batch is crafted with the finest ingredients, mixed to
            perfection, and baked with love to create a treat that's not just
            delicious, but memorable. Our cookies are made using time-honored
            recipes, ensuring each bite delivers a perfect balance of flavor and
            texture. From the careful selection of premium ingredients to the
            delicate baking process, we pay attention to every detail to
            guarantee freshness and quality. Whether it's a classic favorite or
            a new flavor, each cookie is a little piece of happiness—crafted to
            satisfy your cravings and create moments worth savoring.
          </p>
        </div>

        {/* Right Side - Image */}
        <div className="flex items-center justify-center md:mt-0">
          <img
            src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Chocolate chip cookies being placed in the oven"
            className="rounded-lg shadow-lg w-full max-w-[550px]"
          />
        </div>
      </div>
    </div>
  );
};

export default HowToSection;
