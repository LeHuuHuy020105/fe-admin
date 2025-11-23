// ===== ENUM / UNION TYPE =====
export type DeliveryStatus = "PENDING" | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "REFUNDED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";
export type PaymentType = "CASH" | "VNPAY" | "MOMO" | "BANKING";

// ===== UI TYPES =====
export interface StatusTab {
    key: "ALL" | DeliveryStatus;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}

// ===== ROOT =====
export interface OrderlistResponse {
    id: number;
    userResponse: UserResponse | null;
    customerName: string;
    customerPhone: string;
    deliveryWardName: string;
    deliveryDistrictId: number;
    deliveryProvinceId: number;
    deliveryDistrictName: string;
    deliveryProvinceName: string;
    deliveryWardCode: string;
    deliveryAddress: string;
    totalAmount: number;
    note: string;
    updatedAt: string;
    createdAt: string;
    isConfimed: boolean;
    totalFeeShip: number;
    discountValue: number;
    originalOrderAmount: number;
    deliveryStatus: DeliveryStatus;
    paymentStatus: PaymentStatus;
    paymentType: PaymentType;
    orderTrackingCode: string | null;
    orderItemResponses: OrderItemResponse[];
}

export interface OrderDetail {
    id: number;
    userResponse: UserResponse;

    customerName: string;
    customerPhone: string;

    deliveryWardName: string;
    deliveryDistrictId: number;
    deliveryProvinceId: number;
    deliveryDistrictName: string;
    deliveryProvinceName: string;
    deliveryWardCode: string;
    deliveryAddress: string;

    totalAmount: number;
    note: string;
    isConfimed: boolean;

    totalFeeShip: number;
    discountValue: number;
    originalOrderAmount: number;

    // từ object: "CANCELLED" | "PENDING"..., để string cho đỡ cứng
    deliveryStatus: string;
    paymentStatus: string; // "UNPAID"
    paymentType: string; // "CASH"

    orderTrackingCode: string | null;

    orderItemResponses: OrderItemResponse[];
}

// =====SUPPORT =====
export interface UserResponse {
    id: number;
    userName: string | null;
    fullName: string;
    gender: string | null; // hoặc "MALE" | "FEMALE" | "OTHER"
    dateOfBirth: string; // ISO string
    email: string;
    phone: string | null;
    avatar: string | null;
    status: "ACTIVE" | "INACTIVE";
    point: number;
    verifiedEmail: boolean;
    addressResponses: AddressResponse[];
    totalSpent: number | null;
    userRankResponse: UserRankResponse | null;
    roles: RoleResponse[] | null;
}

export interface AddressResponse {
    id: number;
    province: string;
    district: string;
    ward: string;
    provinceId: number;
    districtId: number;
    wardId: string;
    streetAddress: string;
    addressType: "HOME" | "WORK" | string;
    customerName: string;
    phoneNumber: string;
    status: "ACTIVE" | "INACTIVE";
    defaultAddress: boolean;
}

export interface UserRankResponse {
    id: number;
    name: string;
    minSpent: number;
    status: string;
}

export interface RoleResponse {
    name: string;
    description: string;
    permissions: string[];
}

export interface OrderItemResponse {
    orderItemId: number;

    productBaseResponse: ProductBaseResponse;
    isReviewed: boolean;

    productVariantResponse: ProductVariantResponse;

    quantity: number;
    listPriceSnapShot: number;
    finalPrice: number;

    urlImageSnapShot: string;
    nameProductSnapShot: string;
    variantSnapShot: string;
    returnQuantity: number;
}

export interface ProductBaseResponse {
    id: number;
    name: string;
    listPrice: number;
    salePrice: number;
    description: string;
    urlvideo: string | null;
    urlCoverImage: string;
    soldQuantity: number;
    avgRating: number;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    updateAt: string;
}

export interface ProductVariantResponse {
    id: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    price: number;
    quantity: number;
    sku: string;
    variantAttributes: VariantAttribute[];
}

export interface VariantAttribute {
    id: number;
    attribute: string; // "Màu sắc", "Kích thước", ...
    value: string; // "Đen", "S", ...
}
