export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface RoomType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  max_occupancy: number;
  size_sqm: number | null;
  amenities: string[];
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  room_type_id: string;
  num_rooms: number;
  check_in: string;
  check_out: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  num_adults: number;
  num_children: number;
  status: BookingStatus;
  total_price: number;
  currency: string;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  provider: string;
  provider_session_id: string | null;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface HotelSettings {
  id: boolean;
  hotel_name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  check_in_time: string;
  check_out_time: string;
  updated_at: string;
}
