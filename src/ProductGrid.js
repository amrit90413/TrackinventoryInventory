import React from 'react';
import ProductCard from './ProductCard';

const products = [
  {
    id: 1,
    name: 'Smartphone',
    price: '$499',
    images: [
      'https://picsum.photos/400/400?random=1',
      'https://picsum.photos/400/400?random=11',
      'https://picsum.photos/400/400?random=111',
    ],
  },
  {
    id: 2,
    name: 'Laptop',
    price: '$899',
    images: [
      'https://picsum.photos/400/400?random=2',
      'https://picsum.photos/400/400?random=22',
      'https://picsum.photos/400/400?random=222',
    ],
  },
  {
    id: 3,
    name: 'Headphones',
    price: '$99',
    images: [
      'https://picsum.photos/400/400?random=3',
      'https://picsum.photos/400/400?random=33',
      'https://picsum.photos/400/400?random=333',
    ],
  },
  {
    id: 4,
    name: 'Smartwatch',
    price: '$199',
    images: [
      'https://picsum.photos/400/400?random=4',
      'https://picsum.photos/400/400?random=44',
      'https://picsum.photos/400/400?random=444',
    ],
  },
  {
    id: 5,
    name: 'Camera',
    price: '$699',
    images: [
      'https://picsum.photos/400/400?random=5',
      'https://picsum.photos/400/400?random=55',
      'https://picsum.photos/400/400?random=555',
    ],
  },
  {
    id: 6,
    name: 'Speaker',
    price: '$59',
    images: [
      'https://picsum.photos/400/400?random=6',
      'https://picsum.photos/400/400?random=66',
      'https://picsum.photos/400/400?random=666',
    ],
  },
];

export default function ProductGrid() {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} {...p} />
      ))}
    </div>
  );
}