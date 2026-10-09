import "./CatalogHeader.css";
import { PlusCircle } from "lucide-react";
const CatalogHeader = ({ onAddDrop }) => {
    return (<div className="catalog-header">
            <div className="catalog-title">
                <h1>Catalogue</h1>
                <p>
                    Manage all clothing drops, products, and inventory.
                </p>
            </div>

            <button className="btn btn-primary" onClick={onAddDrop}>
                <PlusCircle size={18}/>
                <span>Add Drop</span>
            </button>
        </div>);
};
export default CatalogHeader;
