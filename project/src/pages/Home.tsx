import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Shield, Award, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1920")'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Les meilleurs fruits <br />pour vos besoins
            </h1>
            <p className="text-xl mb-8 max-w-2xl">
              Importateur et distributeur de fruits de qualité supérieure. 
              Nous fournissons les professionnels avec les meilleurs produits du marché.
            </p>
            <Link 
              to="/catalogue"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
            >
              Découvrir notre catalogue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-orange-500">
                <Truck className="h-12 w-12" />
              </div>
              <h3 className="mt-6 text-lg font-medium">Livraison rapide</h3>
              <p className="mt-2 text-gray-600">
                Service de livraison efficace et ponctuel pour tous vos besoins.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-orange-500">
                <Shield className="h-12 w-12" />
              </div>
              <h3 className="mt-6 text-lg font-medium">Qualité garantie</h3>
              <p className="mt-2 text-gray-600">
                Des fruits soigneusement sélectionnés et contrôlés.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-orange-500">
                <Award className="h-12 w-12" />
              </div>
              <h3 className="mt-6 text-lg font-medium">Service premium</h3>
              <p className="mt-2 text-gray-600">
                Une équipe dédiée à votre satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Nos produits phares</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Mangues Premium",
                image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600",
                origin: "Brésil"
              },
              {
                name: "Avocats Hass",
                image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=600",
                origin: "Mexique"
              },
              {
                name: "Ananas Gold",
                image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=600",
                origin: "Costa Rica"
              }
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600">Origine: {product.origin}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;