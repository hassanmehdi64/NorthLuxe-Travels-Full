const BlogPagination = ({ currentPage, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-1.5">
      {/* Previous */}
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`h-8 rounded-lg px-3 text-[11px] font-semibold
          ${
            currentPage === 1
              ? "ql-btn-secondary text-muted/50"
              : "ql-btn-secondary"
          }`}
      >
        Prev
      </button>

      {/* Page Numbers */}
      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        return (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`h-8 w-8 rounded-lg px-0 text-[11px] font-semibold
              ${
                currentPage === page
                  ? "ql-btn-primary"
                  : "ql-btn-secondary"
              }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`h-8 rounded-lg px-3 text-[11px] font-semibold
          ${
            currentPage === totalPages
              ? "ql-btn-secondary text-muted/50"
              : "ql-btn-secondary"
          }`}
      >
        Next
      </button>
    </div>
  );
};

export default BlogPagination;
