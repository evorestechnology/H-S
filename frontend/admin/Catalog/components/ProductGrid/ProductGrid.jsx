import "./ProductGrid.css";
import ProductCard from "../ProductCard/ProductCard";
const ProductGrid = ({ products, onEditProduct, onUpdateProductPrice }) => {
    if (products.length === 0) {
        return (<div className="product-grid-empty">
                <p>No products in this drop.</p>
            </div>);
    }
    return (<div className="product-grid">
            {products.map(product => (<ProductCard key={product.id} product={product} onEdit={onEditProduct} onUpdatePrice={onUpdateProductPrice}/>))}
        </div>);
};
export default ProductGrid;
