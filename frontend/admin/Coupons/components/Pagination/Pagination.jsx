import "./Pagination.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1)
        return null;
    return (<div className="coupons-pagination">
            <button className="page-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                <ChevronLeft size={16}/>
                <span>Prev</span>
            </button>

            <span className="page-info">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
                <span>Next</span>
                <ChevronRight size={16}/>
            </button>
        </div>);
};
export default Pagination;
