import React from 'react';
import { Truck, Users, Globe, Award, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative py-16 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Notre Histoire
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Depuis plus de 20 ans, FruitExpress s'engage à fournir les meilleurs fruits 
              aux professionnels de l'alimentation à travers toute la France.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h2>
              <p className="text-gray-600 mb-4">
                Chez FruitExpress, notre mission est de révolutionner la distribution de fruits 
                en combinant qualité exceptionnelle, service personnalisé et innovation logistique.
              </p>
              <p className="text-gray-600 mb-6">
                Nous travaillons directement avec les producteurs pour garantir les meilleurs 
                produits et assurer une chaîne d'approvisionnement transparente et durable.
              </p>
              <div className="flex items-center text-orange-500 hover:text-orange-600 cursor-pointer">
                <span className="font-medium">En savoir plus sur nos valeurs</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </div>
            <div className="relative h-96">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
                alt="Entrepôt FruitExpress"
                className="w-full h-full object-cover rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '20+', label: 'Années d\'expérience' },
              { number: '500+', label: 'Clients satisfaits' },
              { number: '50+', label: 'Pays d\'origine' },
              { number: '10k+', label: 'Livraisons par an' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Truck className="h-8 w-8" />,
                title: 'Efficacité Logistique',
                description: 'Livraison rapide et fiable pour garantir la fraîcheur de vos produits.'
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: 'Service Client',
                description: 'Une équipe dédiée à votre satisfaction et à votre réussite.'
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: 'Développement Durable',
                description: 'Engagement pour des pratiques responsables et écologiques.'
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: 'Qualité Premium',
                description: 'Sélection rigoureuse des meilleurs produits du marché.'
              }
            ].map((value, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-orange-500 mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Équipe</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une équipe passionnée de professionnels dédiés à votre satisfaction et au 
              développement de solutions innovantes pour vos besoins.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Marie Laurent',
                role: 'Directrice Générale',
                image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=500'
              },
              {
                name: 'Thomas Dubois',
                role: 'Responsable Logistique',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=500'
              },
              {
                name: 'Sophie Martin',
                role: 'Responsable Qualité',
                image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=500'
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;