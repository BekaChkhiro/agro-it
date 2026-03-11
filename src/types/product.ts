export interface Product {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  description: string;
  descriptionEn: string;
  specifications: string[];
  specificationsEn: string[];
  videoUrl?: string;
  images?: string[];
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  image?: string;
  slug: string;
}

export interface SuccessStory {
  id: string;
  company: string;
  companyEn: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  year: number;
  products?: string[];
}
