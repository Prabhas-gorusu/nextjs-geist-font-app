// User Types
export interface User {
  id: string;
  contactNumber: string;
  email?: string;
  role: 'farmer' | 'retailer' | 'admin';
  name: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Farmer extends User {
  role: 'farmer';
  landLocation: string;
  soilType: 'clay' | 'loam' | 'sandy' | 'silt' | 'peat' | 'chalk';
  landSize?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Retailer extends User {
  role: 'retailer';
  shopName: string;
  companyName?: string;
  location: string;
  businessType?: string;
}

// Crop and AI Types
export interface CropSuggestion {
  id: string;
  name: string;
  scientificName?: string;
  growthPeriod: number; // in days
  season: 'kharif' | 'rabi' | 'zaid';
  waterRequirement: 'low' | 'medium' | 'high';
  soilSuitability: string[];
  expectedYield: string;
  marketPrice?: number;
  confidence: number; // AI confidence score
}

export interface CropDetails {
  cropId: string;
  timeline: {
    stage: string;
    duration: number;
    description: string;
  }[];
  weatherNeeds: {
    temperature: { min: number; max: number };
    rainfall: number;
    humidity: string;
  };
  irrigationSchedule: string[];
  fertilizerRecommendations: {
    type: string;
    quantity: string;
    timing: string;
  }[];
  harvestingPrediction: {
    estimatedDate: Date;
    indicators: string[];
  };
}

// Pesticide Types
export interface PesticideRecommendation {
  id: string;
  name: string;
  type: 'insecticide' | 'fungicide' | 'herbicide' | 'fertilizer';
  targetPests: string[];
  applicationMethod: string;
  dosage: string;
  safetyPeriod: number; // days before harvest
  price?: number;
  availability: 'available' | 'limited' | 'out_of_stock';
}

// Weather Types
export interface WeatherData {
  location: {
    name: string;
    coordinates: { lat: number; lon: number };
  };
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  forecast: {
    date: Date;
    temperature: { min: number; max: number };
    humidity: number;
    rainfall: number;
    description: string;
  }[];
}

// Threshing Marketplace Types
export interface ThreshingListing {
  id: string;
  farmerId: string;
  cropType: string;
  quantity: number;
  unit: 'kg' | 'quintal' | 'ton';
  pricePerUnit: number;
  totalPrice: number;
  quality: 'premium' | 'standard' | 'basic';
  harvestDate: Date;
  location: string;
  description?: string;
  images?: string[];
  status: 'available' | 'reserved' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  listingId: string;
  retailerId: string;
  quantity: number;
  requestedPrice?: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  farmerId: string;
  retailerId: string;
  listingId: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'otp' | 'crop_suggestion' | 'listing_interest' | 'transaction_update' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form Types
export interface SignupFormData {
  contactNumber: string;
  otp: string;
  role: 'farmer' | 'retailer';
  name: string;
  // Farmer specific
  landLocation?: string;
  soilType?: string;
  coordinates?: { latitude: number; longitude: number };
  // Retailer specific
  shopName?: string;
  companyName?: string;
  location?: string;
}

export interface LoginFormData {
  contactNumber: string;
  password?: string;
  otp?: string;
}

// Search and Filter Types
export interface SearchFilters {
  cropType?: string;
  location?: string;
  priceRange?: { min: number; max: number };
  quality?: string;
  availability?: string;
  sortBy?: 'price' | 'date' | 'quantity';
  sortOrder?: 'asc' | 'desc';
}
