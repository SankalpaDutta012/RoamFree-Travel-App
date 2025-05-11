"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LocationSearch } from '@/components/location-search';
import { LocationDetails } from '@/components/location-details';
import type { Location } from '@/lib/types';
import { RoamFreeLogo } from '@/components/icons/roamfree-logo';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Globe, 
  Menu, 
  X, 
  Search, 
  MapPin, 
  Compass, 
  Heart, 
  User, 
  Settings,
  ChevronDown,
  HelpCircle,
  Bell
} from 'lucide-react';

// Dynamically import InteractiveMap with ssr: false
const InteractiveMap = dynamic(() => 
  import('@/components/interactive-map').then(mod => mod.InteractiveMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-100 rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    )
  }
);

// Default coordinates (London, UK)
const DEFAULT_LONGITUDE = -0.1278;
const DEFAULT_LATITUDE = 51.5074;
const DEFAULT_LOCATION_NAME = "London";
const DEFAULT_COUNTRY = "United Kingdom";

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState<{ longitude: number; latitude: number; zoom: number; key: number }>({
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE,
    zoom: 9,
    key: Date.now(), 
  });
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setMapCenter({
      longitude: location.longitude,
      latitude: location.latitude,
      zoom: 13,
      key: Date.now(),
    });
  };
  
  useEffect(() => {
    if (!initialSearchDone) {
      const defaultLocation: Location = {
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        name: DEFAULT_LOCATION_NAME,
        fullName: `${DEFAULT_LOCATION_NAME}, ${DEFAULT_COUNTRY}`,
        country: DEFAULT_COUNTRY,
      };
      setSelectedLocation(defaultLocation);
      setInitialSearchDone(true);
    }
  }, [initialSearchDone]);

  const handleMapClick = (event: L.LeafletMouseEvent) => {
    console.log("Map clicked at:", event.latlng);
    // Potentially update selected location based on reverse geocoding result for event.latlng
  };

  // Popular destinations for quick selection
  const popularDestinations = [
    { name: "Paris", country: "France" },
    { name: "New York", country: "USA" },
    { name: "Tokyo", country: "Japan" },
    { name: "Sydney", country: "Australia" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg">
                <RoamFreeLogo className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                RoamFree
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>Explore</span>
              </a>
              <a href="#" className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Destinations</span>
              </a>
              <a href="#" className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-1">
                <Compass className="h-4 w-4" />
                <span>Adventures</span>
              </a>
              <a href="#" className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>Saved</span>
              </a>
            </nav>

            {/* User profile and mobile menu button */}
            <div className="flex items-center space-x-4">
              <button className="hidden md:flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                <Bell className="h-4 w-4 text-slate-600" />
              </button>
              
              <div className="relative hidden md:block">
                <button 
                  onClick={toggleUserDropdown}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-600" />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Your Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Settings</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Help & Support</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Sign out</a>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={toggleMobileMenu}
                className="md:hidden rounded-md p-2 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                  <Globe className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-medium">Explore</span>
                </a>
                <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                  <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-medium">Destinations</span>
                </a>
                <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                  <Compass className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-medium">Adventures</span>
                </a>
                <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                  <Heart className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-medium">Saved</span>
                </a>
                <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                  <User className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-medium">Profile</span>
                </a>
                <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                  <Settings className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-medium">Settings</span>
                </a>
                <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-slate-100 transition-colors">
                  <HelpCircle className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-medium">Help</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container py-6 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Section with gradient background */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg overflow-hidden">
          <div className="px-6 py-12 md:py-16 md:px-12 text-center sm:text-left flex flex-col sm:flex-row items-center">
            <div className="max-w-xl mb-8 sm:mb-0 sm:mr-8">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                Discover Your Next Adventure
              </h2>
              <p className="text-blue-100 text-lg mb-6">
                Explore beautiful destinations around the world with interactive maps and detailed guides.
              </p>
              
              {/* Enhanced Search Box */}
              <div className="relative max-w-md mx-auto sm:mx-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <LocationSearch 
                  onLocationSelect={handleLocationSelect}
                  initialSearchTerm={selectedLocation?.fullName || DEFAULT_LOCATION_NAME}
                />
              </div>
            </div>
            <div className="hidden sm:block flex-shrink-0">
              <img 
                src="https://images.pexels.com/photos/1181809/pexels-photo-1181809.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="World exploration" 
                className="rounded-lg shadow-md h-48 w-48 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Popular Destinations</h3>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
              View all
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularDestinations.map((destination, index) => (
              <button 
                key={index}
                className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
                onClick={() => {
                  // In a real app, this would fetch the location data and call handleLocationSelect
                  console.log(`Selected ${destination.name}`);
                }}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium">{destination.name}</h4>
                <p className="text-sm text-gray-500">{destination.country}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 h-full min-h-[calc(100vh-24rem)]">
          {/* Map Container */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                {selectedLocation?.name || "Location"} Map
              </h3>
              <div className="h-[500px] lg:h-[600px] rounded-lg overflow-hidden border border-slate-200">
                <InteractiveMap
                  key={mapCenter.key} 
                  location={selectedLocation}
                  zoom={mapCenter.zoom}
                  markerLabel={selectedLocation?.name}
                  onMapClick={handleMapClick}
                />
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-20">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                {selectedLocation?.name || "Location"} Details
              </h3>
              <LocationDetails location={selectedLocation} />
              
              {/* Additional UI elements for the details panel */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Heart className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Compass className="h-4 w-4" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg">
                  <RoamFreeLogo className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">RoamFree</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Discover the world's most amazing places with our interactive travel exploration platform.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Explore</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Destinations</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Cities</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Countries</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Adventures</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Team</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Contact Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} RoamFree. All rights reserved. Built with passion for exploration.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}