import { useState } from "react";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const handleClickBtn = (e) => {
    e.preventDefault();
    if (email === "") {
      alert("Enter a email");
    }
    setEmail("");
    alert(`Subscribe Done With EmailID : {email}`);
  };
  const handleEmail = (e) => {
    setEmail(e.target.value);
  };
  return (
    <section
      className="max-container flex justify-between items-center max-lg:flex-col gap-9"
      id="contact-us"
    >
      <div className="p-6 sm:p-8 mt-8 rounded-lg w-4/5 mx-auto text-center">
        <h3 className="text-3xl sm:text-4xl font-bold text-[#A31621] mb-4">
          Subscribe to get 10% off.
        </h3>
        <form
          onSubmit={handleClickBtn}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={handleEmail}
            required
            placeholder="Email address"
            className="w-full sm:w-2/3 p-3 border-2 border-[#A31621] rounded-full text-[#A31621] placeholder-[#A31621] focus:outline-none  "
          />
          <button
            name="btn"
            className="px-6 py-3 border-2 border-[#A31621] text-[#A31621] rounded-full font-semibold hover:bg-[#A31621] hover:text-white transition-colors duration-300"
          >
            Subscribe
          </button>
        </form>
        <p className="text-xs text-[#A31621] mt-2">
          By signing up to receive emails from CookiesMan, you agree to our{" "}
          <span className="underline cursor-pointer">privacy policy</span>. We
          treat your info responsibly.
        </p>
      </div>
    </section>
  );
};

export default Subscribe;
