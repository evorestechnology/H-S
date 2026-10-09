export const mockDrops = [
  {
    id: 'drop-1',
    title: 'Summer Collection 24',
    dropName: 'Summer Collection 24',
    status: 'Live',
    isActive: true,
  }
];

const img1 = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop";
const img2 = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop";
const img3 = "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop";
const img4 = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop";

export const mockProducts = [
  {
    id: 'prod-1',
    name: 'Heavyweight Hoodie',
    description: 'Premium heavyweight cotton hoodie designed for ultimate comfort and durability.',
    price: 89.99,
    category: 'Hoodies',
    images: [img1, img2],
    coverPhoto: img1,
    isNew: true,
    isBestSeller: true,
    inStock: true,
    dropId: 'drop-1',
    drop: { title: 'Summer Collection 24', status: 'Live' }
  },
  {
    id: 'prod-2',
    name: 'Essential T-Shirt',
    description: 'The perfect everyday t-shirt with a relaxed fit.',
    price: 35.00,
    category: 'T-Shirts',
    images: [img2],
    coverPhoto: img2,
    isNew: false,
    isBestSeller: true,
    inStock: true,
    dropId: 'drop-1',
    drop: { title: 'Summer Collection 24', status: 'Live' }
  },
  {
    id: 'prod-3',
    name: 'Cargo Pants',
    description: 'Utility cargo pants with multiple pockets and adjustable cuffs.',
    price: 75.00,
    category: 'Pants',
    images: [img3],
    coverPhoto: img3,
    isNew: true,
    isBestSeller: false,
    inStock: true,
    dropId: 'drop-1',
    drop: { title: 'Summer Collection 24', status: 'Live' }
  },
  {
    id: 'prod-4',
    name: 'Logo Beanie',
    description: 'Classic knit beanie featuring our signature embroidered logo.',
    price: 25.00,
    category: 'Accessories',
    images: [img4],
    coverPhoto: img4,
    isNew: false,
    isBestSeller: false,
    inStock: false,
    dropId: 'drop-1',
    drop: { title: 'Summer Collection 24', status: 'Live' }
  }
];
