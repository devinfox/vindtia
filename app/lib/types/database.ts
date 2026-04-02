export type GenderIdentity = 'male' | 'female' | 'nonbinary';
export type PresentationStyle = 'masculine' | 'feminine';
export type ProductStyle = 'masculine' | 'feminine' | 'unisex';

export type Profile = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  membership_tier: number;
  created_at: string;
  updated_at: string;
  // Body profile for AI outfit generation
  front_photo_url: string | null;
  side_photo_url: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  bust_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  inseam_cm: number | null;
  shoulder_width_cm: number | null;
  clothing_size_top: string | null;
  clothing_size_bottom: string | null;
  shoe_size: string | null;
  skin_tone: string | null;
  ethnicity: string | null;
  hair_color: string | null;
  hair_length: string | null;
  body_type: string | null;
  style_preferences: string[] | null;
  body_profile_updated_at: string | null;
  // Gender and style preferences
  gender_identity: GenderIdentity | null;
  presentation_style_preference: PresentationStyle[] | null;
};

export type UserBodyProfile = {
  front_photo_url: string | null;
  side_photo_url: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  bust_cm: number | null; // Also used as chest_cm for masculine
  waist_cm: number | null;
  hips_cm: number | null;
  inseam_cm: number | null;
  shoulder_width_cm: number | null;
  clothing_size_top: string | null;
  clothing_size_bottom: string | null;
  shoe_size: string | null;
  skin_tone: string | null;
  ethnicity: string | null;
  hair_color: string | null;
  hair_length: string | null;
  body_type: string | null;
  style_preferences: string[] | null;
  // Gender and style preferences
  gender_identity: GenderIdentity | null;
  presentation_style_preference: PresentationStyle[] | null;
};

export type Designer = {
  id: string;
  name: string;
  slug: string | null;
  bio: string | null;
  image_url: string | null;
  founded: string | null;
  origin: string | null;
  headquarters: string | null;
  signature: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  designer_id: string | null;
  description: string | null;
  ai_description: string | null;
  ai_description_generated_at: string | null;
  price_per_rental: number;
  size: string | null;
  color: string | null;
  category: string | null;
  condition: string | null;
  era: string | null;
  material: string | null;
  style: ProductStyle;
  archive: boolean;
  tier_required: number;
  created_at: string;
  updated_at: string;
};

export type ProductMedia = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  created_at: string;
};

export type Inventory = {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type RentalStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'active'
  | 'return_initiated'
  | 'return_shipped'
  | 'returned'
  | 'completed'
  | 'cancelled';

export type Rental = {
  id: string;
  user_id: string;
  product_id: string;
  start_date: string;
  end_date: string;
  status: RentalStatus;
  shipped_at: string | null;
  delivered_at: string | null;
  return_initiated_at: string | null;
  return_shipped_at: string | null;
  returned_at: string | null;
  tracking_number: string | null;
  return_tracking_number: string | null;
  shipping_carrier: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  rental_id: string | null;
  amount: number;
  stripe_payment_intent: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AdminRole = {
  id: string;
  user_id: string;
  role: "admin" | "super_admin";
  created_at: string;
};

export type MembershipTier = {
  id: number;
  name: string;
  price_id: string | null;
  features: string[];
  monthly_rental_limit: number | null;
  rental_duration_days: number;
  archive_access: boolean;
  created_at: string;
  updated_at: string;
};

export type CleaningType = 'standard' | 'deep' | 'spot' | 'preservation';
export type CleaningStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export type CleaningSchedule = {
  id: string;
  product_id: string;
  rental_id: string | null;
  scheduled_date: string;
  status: CleaningStatus;
  cleaning_type: CleaningType;
  notes: string | null;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RevenueAnalytics = {
  month: string;
  total_orders: number;
  total_revenue: number;
  unique_customers: number;
  avg_order_value: number;
};

export type MembershipAnalytics = {
  tier_id: number;
  tier_name: string;
  member_count: number;
  percentage: number;
};

export type InventoryPerformance = {
  product_id: string;
  product_name: string;
  designer_name: string | null;
  category: string | null;
  era: string | null;
  current_stock: number;
  total_rentals: number;
  active_rentals: number;
  total_revenue: number;
  utilization_rate: number;
};
