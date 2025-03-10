import { useLocation } from "react-router-dom";

const ErrorPage = () => {
  const location = useLocation();
  const errorMessage = location.state?.error || "404 - Page Not Found";

  return (
    <div className="flex items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold text-red-600">{errorMessage}</h1>
    </div>
  );
};

export default ErrorPage;
