import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import ProductCard from './ProductCard';
import { useCatalogStore } from '../shared/store/useCatalogStore';

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchKeyword = (searchParams.get('search') || searchParams.get('q') || '').trim();
  
  const [sortOption, setSortOption] = useState(categoryName === 'best-sellers' ? 'best-sellers' : 'newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  const { products, isLoading, fetchProducts } = useCatalogStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (categoryName === 'best-sellers') {
      setSortOption('best-sellers');
    }
  }, [categoryName]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('search');
    nextParams.delete('q');
    setSearchParams(nextParams);
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category (if not 'all' or empty)
    const isAll = !categoryName || categoryName.toLowerCase() === 'all';
    if (!isAll && categoryName !== 'new-arrivals' && categoryName !== 'best-sellers') {
      // Decode URI component just in case it has spaces or special chars
      const decodedCategory = decodeURIComponent(categoryName).toLowerCase();
      result = result.filter(p => p.category?.toLowerCase() === decodedCategory);
    } else if (categoryName === 'new-arrivals') {
      result = result.filter(p => p.isNew);
    } else if (categoryName === 'best-sellers') {
      const flaggedOrSold = result.filter(p => p.isBestSeller || (p.totalSold && p.totalSold > 0));
      result = flaggedOrSold.length > 0 ? flaggedOrSold : result.filter(p => p.inStock !== false);
    }

    // Filter by Search Keyword across name, category, description, fit, colors
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      const tokens = q.split(/\s+/).filter(Boolean);
      result = result.filter(p => {
        const name = (p.name || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const fit = (p.fit || '').toLowerCase();
        const colorNames = Array.isArray(p.colors)
          ? p.colors.map(c => (typeof c === 'string' ? c : c?.name || c?.color || '')).join(' ').toLowerCase()
          : '';
        const combined = `${name} ${category} ${desc} ${fit} ${colorNames}`;

        return combined.includes(q) || tokens.every(t => combined.includes(t));
      });
    }

    // Sorting
    switch (sortOption) {
      case 'best-sellers':
        result.sort((a, b) => {
          const soldA = a.totalSold || 0;
          const soldB = b.totalSold || 0;
          if (soldB !== soldA) return soldB - soldA;
          if (b.isBestSeller && !a.isBestSeller) return 1;
          if (a.isBestSeller && !b.isBestSeller) return -1;
          const stockA = a.inStock !== false ? 1 : 0;
          const stockB = b.inStock !== false ? 1 : 0;
          if (stockB !== stockA) return stockB - stockA;
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        break;
      case 'price-low':
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'newest':
        result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
        break;
      default:
        break;
    }

    return result;
  }, [categoryName, searchKeyword, sortOption, products]);

  const categoryTitle = searchKeyword
    ? `Search Results`
    : categoryName && categoryName.toLowerCase() !== 'all'
    ? decodeURIComponent(categoryName).replace('-', ' ')
    : 'All Products';

  return (
    <div className="pt-16 sm:pt-18 md:pt-20 pb-16 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[100dvh]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-12 border-b border-border pb-6 gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold uppercase tracking-tight">
            {categoryTitle}
          </h1>
          {searchKeyword && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Query: <span className="text-foreground font-bold font-mono">"{searchKeyword}"</span> &bull; {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
              </span>
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 ml-2 px-2 py-0.5 border border-red-200 rounded hover:bg-red-50 transition-colors"
                title="Clear search"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6 text-sm self-end md:self-auto">
          <div className="relative group" ref={sortRef}>
            <button 
              onClick={() => setIsSortOpen(prev => !prev)}
              className="flex items-center gap-2 font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors"
            >
              Sort By <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`absolute right-0 top-full mt-2 w-48 bg-background border border-border shadow-xl z-20 transition-all ${
              isSortOpen ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
            }`}>
              <button onClick={() => { setSortOption('best-sellers'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-muted ${sortOption === 'best-sellers' ? 'font-bold' : ''}`}>Best Sellers</button>
              <button onClick={() => { setSortOption('newest'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-muted border-t border-border/50 ${sortOption === 'newest' ? 'font-bold' : ''}`}>Newest</button>
              <button onClick={() => { setSortOption('price-low'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-muted border-t border-border/50 ${sortOption === 'price-low' ? 'font-bold' : ''}`}>Price: Low to High</button>
              <button onClick={() => { setSortOption('price-high'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover:bg-muted border-t border-border/50 ${sortOption === 'price-high' ? 'font-bold' : ''}`}>Price: High to Low</button>
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
            <p className="text-muted-foreground uppercase text-sm tracking-widest max-w-md mx-auto">
              {searchKeyword
                ? `No products match "${searchKeyword}". Check the spelling or try searching for another term.`
                : 'No products available in this category'}
            </p>
            {searchKeyword && (
              <button
                type="button"
                onClick={clearSearch}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
              >
                View All Products
              </button>
            )}
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
