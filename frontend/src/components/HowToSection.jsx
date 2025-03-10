const HowToSection = () => {
  return (
    <div className="w-auto mx-auto flex flex-col items-center justify-center min-h-screen p-8 bg-cream text-[#A31621] border border-red-300">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 w-full">
        <div className="text-center ml-[150px] md:text-left">
          <h3 className="uppercase font-bold text-sm tracking-wider mb-4">
            How-To
          </h3>
          <p className="text-lg leading-relaxed">
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
        <div className="flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Chocolate chip cookies being placed in the oven"
            className="rounded-lg shadow-lg w-[550px] max-w-full"
          />
        </div>
      </div>
      <div className="text-center mt-12  p-6 w-auto">
        <h2 className="text-2xl font-semibold text-[#A31621] mb-4">
          Build your box
        </h2>
        <p className="text-lg text-[#A31621] leading-relaxed">
          Munchies is a premium chocolate company specializing in crafting
          high-quality chocolate chips for baking enthusiasts and professionals
          alike.
        </p>
      </div>
    </div>
  );
};

export default HowToSection;
