const Footer = () => {
  return (
    <footer className="bg-[#69292e] text-white p-6 sm:p-8 md:p-16 w-full">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Contact Info */}
        <div className="text-center sm:text-left">
          <p className="text-lg font-semibold">123 Maple Street,</p>
          <p className="text-lg font-semibold">Springfield, IL 62704</p>
          <p className="mt-2">(555) 123-4567</p>
        </div>

        {/* Hours */}
        <div className="text-center sm:text-left">
          <p className="text-lg font-semibold">Monday - Friday:</p>
          <p>12:00 PM - 10:00 PM</p>
          <p className="text-lg font-semibold mt-2">Saturday - Sunday:</p>
          <p>10:00 AM - 6:00 PM</p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold">Shop all</p>
            <p className="font-semibold">FAQs</p>
          </div>
          <div>
            <p className="font-semibold">Cookies club</p>
            <p className="font-semibold">Chocolate based</p>
            <p className="font-semibold">Fruit & Spice</p>
            <p className="font-semibold">Crunchy</p>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="text-center text-5xl sm:text-6xl md:text-8xl font-bold mt-8">
        CookiesMan
      </div>

      {/* Bottom Links */}
      <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-11 text-sm font-semibold text-center">
        <p>&copy; 2025 CopyRight</p>
        <p>SHIPPING & DELIVERY</p>
        <p>PRIVACY POLICY</p>
      </div>
    </footer>
  );
};

export default Footer;
