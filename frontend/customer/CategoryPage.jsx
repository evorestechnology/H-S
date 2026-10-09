import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import { useCatalogStore } from '../shared/store/useCatalogStore';

export default function CategoryPage() {
  const { categoryName } = useParams();
  
  const [sortOption, setSortOption] = useState('newest');

  const { products, isLoading, fetchProducts } = useCatalogStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (categoryName && categoryName !== 'new-arrivals' && categoryName !== 'best-sellers') {
      // Decode URI component just in case it has spaces or special chars
      const decodedCategory = decodeURIComponent(categoryName).toLowerCase();
      result = result.filter(p => p.category?.toLowerCase() === decodedCategory);
    } else if (categoryName === 'new-arrivals') {
      result = result.filter(p => p.isNew);
    } else if (categoryName === 'best-sellers') {
      result = result.filter(p => p.isBestSeller);
    }

    // Sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
        break;
      default:
        break;
    }

    return result;
  }, [categoryName, sortOption, products]);

  const categoryTitle = categoryName 
    ? decodeURIComponent(categoryName).replace('-', ' ') 
    : 'All Products';

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-border pb-6">
        <h1 className="font-heading text-4xl font-bold uppercase tracking-tight mb-4 md:mb-0">
          {categoryTitle}
        </h1>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="relative group">
            <button className="flex items-center gap-2 font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors">
              Sort By <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button onClick={() => setSortOption('newest')} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-muted ${sortOption === 'newest' ? 'font-bold' : ''}`}>Newest</button>
              <button onClick={() => setSortOption('price-low')} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-muted border-t border-border/50 ${sortOption === 'price-low' ? 'font-bold' : ''}`}>Price: Low to High</button>
              <button onClick={() => setSortOption('price-high')} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-muted border-t border-border/50 ${sortOption === 'price-high' ? 'font-bold' : ''}`}>Price: High to Low</button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div>
        {isLoading ? (
          <div className="text-center py-20">
            <h2 className="font-heading text-2xl font-bold uppercase mb-4 text-muted-foreground">Loading Products...</h2>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="font-heading text-2xl font-bold uppercase mb-4">No Products Found</h2>
            <p className="text-muted-foreground uppercase text-sm tracking-widest">No products available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
