export interface Product {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  images: string[]
  categoryId: string
  category?: Category
  featured: boolean
  available: boolean
  variants: ProductVariant[]
  options: ProductOption[]
  reviews?: Review[]
  _count?: { reviews: number }
  avgRating?: number
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  price: number
  available: boolean
}

export interface ProductOption {
  id: string
  productId: string
  name: string
  type: 'SELECT' | 'TEXT' | 'CHECKBOX'
  required: boolean
  values: OptionValue[]
}

export interface OptionValue {
  label: string
  priceAdd: number
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: string
  description?: string
}

export interface CartItem {
  productId: string
  product: Product
  variantId: string
  variant: ProductVariant
  selectedOptions: Record<string, string>
  quantity: number
  price: number
  extras: CartExtra[]
}

export interface CartExtra {
  name: string
  price: number
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  address: string
  city: string
  pincode: string
  deliveryDate: string
  deliverySlot: string
  specialNote?: string
  items: OrderItem[]
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
  couponCode?: string
  paymentMethod: string
  paymentStatus: string
  status: OrderStatus
  createdAt: string
}

export interface OrderItem {
  id: string
  productName: string
  variantName?: string
  options?: Record<string, string>
  quantity: number
  price: number
  total: number
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'

export interface Coupon {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderValue: number
  active: boolean
}

export interface Review {
  id: string
  name: string
  rating: number
  comment: string
  image?: string
  createdAt: string
}

export interface CheckoutForm {
  customerName: string
  customerPhone: string
  customerEmail: string
  address: string
  city: string
  pincode: string
  deliveryDate: string
  deliverySlot: string
  specialNote: string
  paymentMethod: string
  couponCode: string
}
