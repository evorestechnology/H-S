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
    frontView: img1,
    backView: img2,
    colors: [
      { name: 'Heather Grey', code: '#6B7280', frontView: img1, backView: img2 }
    ],
    isNew: true,
    isBestSeller: true,
    totalSold: 142,
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
    images: [img2, img4],
    coverPhoto: img2,
    frontView: img2,
    backView: img4,
    colors: [
      { name: 'Optic White', code: '#FFFFFF', frontView: img2, backView: img4 }
    ],
    isNew: false,
    isBestSeller: true,
    totalSold: 98,
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
    images: [img3, img1],
    coverPhoto: img3,
    frontView: img3,
    backView: img1,
    colors: [
      { name: 'Olive Green', code: '#3F6212', frontView: img3, backView: img1 }
    ],
    isNew: true,
    isBestSeller: false,
    totalSold: 32,
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
    images: [img4, img2],
    coverPhoto: img4,
    frontView: img4,
    backView: img2,
    colors: [
      { name: 'Jet Black', code: '#000000', frontView: img4, backView: img2 }
    ],
    isNew: false,
    isBestSeller: false,
    totalSold: 10,
    inStock: false,
    dropId: 'drop-1',
    drop: { title: 'Summer Collection 24', status: 'Live' }
  }
];
