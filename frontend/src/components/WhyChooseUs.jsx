import {
  LucideCoffee,
  LucideDollarSign,
  LucideAward,
  LucideCupSoda,
} from "lucide-react";

const features = [
  {
    title: "Premium Quality",
    description: "Ethically sourced Arabica beans, roasted to perfection",
    icon: <LucideCoffee size={40} className="text-[#A31621]" />,

    text: "text-[#A31621]",
  },
  {
    title: "Fair Pricing",
    description: "Premium quality at honest price",
    icon: <LucideDollarSign size={40} className="text-[#A31621]" />,

    text: "text-[#A31621]",
  },
  {
    title: "Unique Teast",
    description: "Artisan blends crafted by master roasters",
    icon: <LucideCupSoda size={40} className="text-[#A31621]" />,

    text: "text-[#A31621]",
  },
  {
    title: "Award Winning",
    description: "Recognized for excellence in Cookies craftsmanship",
    icon: <LucideAward size={40} className="text-[#A31621]" />,

    text: "text-[#A31621]",
  },
];

export default function WhyChooseUs() {
  return (
    <div className=" text-center">
      <h2 className="text-3xl font-bold text-[#A31621] text-brown-700 mb-4">
        Why Choose Us?
      </h2>
      <p className=" text-[#A31621] mb-10">
        Crafting moments of perfection in every cup
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8">
        {features.map((feature, index) => (
          <div key={index} className={`rounded-2xl shadow-lg ${feature.bg}`}>
            <div className="p-8 flex flex-col items-center text-center">
              <div className="mb-4">{feature.icon}</div>
              <h3 className={`text-xl font-semibold ${feature.text}`}>
                {feature.title}
              </h3>
              <p className={`italic mt-2 ${feature.text}`}>
                {feature.description}
              </p>
              <div className={`border-t mt-4 w-full ${feature.text}`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
