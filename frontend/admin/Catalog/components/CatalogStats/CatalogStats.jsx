import "./CatalogStats.css";
import CatalogCard from "./CatalogCard";
const CatalogStats = ({ summary }) => {
    if (!summary) {
        return (<div className="catalog-stats">
                {[1, 2, 3, 4].map((i) => (<div key={i} className="catalog-card skeleton-card">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-value"></div>
                    </div>))}
            </div>);
    }
    return (<div className="catalog-stats">
            <CatalogCard title="TOTAL DROPS" amount={summary.totalDrops} type="drops"/>
            <CatalogCard title="TOTAL PRODUCTS" amount={summary.totalProducts} type="products"/>
            <CatalogCard title="LIVE PRODUCTS" amount={summary.liveProducts} type="live"/>
            <CatalogCard title="DRAFT PRODUCTS" amount={summary.draftProducts} type="draft"/>
        </div>);
};
export default CatalogStats;
