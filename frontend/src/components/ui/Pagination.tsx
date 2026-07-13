import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push('...');
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-center gap-1 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {pages.map((page, idx) =>
                page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-500 text-sm">
                        ···
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page as number)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${currentPage === page
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                            }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
