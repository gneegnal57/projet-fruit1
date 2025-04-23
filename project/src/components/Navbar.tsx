import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Apple } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500';
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Apple className="h-8 w-8 text-orange-500" />
              <span className="ml-2 text-xl font-bold text-gray-800">FruitExpress</span>
            </Link>
          </div>
          
          <div className="hidden sm:flex sm:items-center">
            <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
              Accueil
            </Link>
            <Link to="/catalogue" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/catalogue')}`}>
              Catalogue
            </Link>
            <Link to="/a-propos" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/a-propos')}`}>
              À Propos
            </Link>
            <Link to="/contact" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/contact')}`}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;