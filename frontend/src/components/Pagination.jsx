import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-4 mt-6 p-4">
      {/* Previous Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        className="flex items-center px-4 py-2 bg-[#A31621] text-white rounded-lg shadow-md hover:bg-[#7c0f19] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="ml-1 hidden sm:inline">Prev</span>
      </button>

      {/* Page Indicator */}
      <span className="text-[#A31621] font-semibold text-base sm:text-lg">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        disabled={currentPage >= totalPages}
        onClick={() => setCurrentPage((prev) => prev + 1)}
        className="flex items-center px-4 py-2 bg-[#A31621] text-white rounded-lg shadow-md hover:bg-[#7c0f19] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
      >
        <span className="mr-1 hidden sm:inline">Next</span>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;
