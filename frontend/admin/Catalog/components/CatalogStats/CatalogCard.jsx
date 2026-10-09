import { Package, Layers, CheckCircle, Clock } from "lucide-react";
import "./CatalogStats.css";
const CatalogCard = ({ title, amount, type }) => {
    const renderIcon = () => {
        switch (type) {
            case "drops": return <Layers size={24}/>;
            case "products": return <Package size={24}/>;
            case "live": return <CheckCircle size={24}/>;
            case "draft": return <Clock size={24}/>;
        }
    };
    return (<div className="catalog-card">
            <div>
                <span className="catalog-card-title">{title}</span>
                <h2>{amount.toLocaleString()}</h2>
            </div>
            <div className={`catalog-icon ${type}`}>
                {renderIcon()}
            </div>
        </div>);
};
export default CatalogCard;
