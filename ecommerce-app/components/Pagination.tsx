import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers = [...Array(totalPages).keys()].map((i) => i + 1);

  return (
    <div className="flex items-center justify-center mt-4">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-gray-100 text-gray-500 rounded-md py-2 px-3 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageNumbers.map((page) => (
        <button
          type="button"
          key={page}
          onClick={() => onPageChange(page)}
          className={`py-2 px-4 rounded-md mx-1 ${
            currentPage === page
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-gray-100 text-gray-500 rounded-md py-2 px-3 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next Page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;
