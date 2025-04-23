import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  origin_country: string | null;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  description,
  price,
  image_url,
  category,
  origin_country,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img
          src={image_url || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=500'}
          alt={name}
          className="w-full h-full object-cover"
        />
        {category && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-sm">
            {category}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          <span className="text-orange-500 font-semibold">{price.toFixed(2)} €/kg</span>
        </div>
        {description && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{description}</p>
        )}
        {origin_country && (
          <p className="text-sm text-gray-500 mb-4">Origine: {origin_country}</p>
        )}
        <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Commander
        </button>
      </div>
    </div>
  );
};

export default ProductCard;