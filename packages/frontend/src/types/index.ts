export interface Passage {
  id: string;
  vehicleId: string;
  vehicleType: string;
  timestamp: string;
  baseFee: number;
  chargedFee: number;
  dailyTotal: number;
}

export interface VehicleTypeOption {
  vehicleType: string;
  tollFree: boolean;
}

export interface ApiListResponse<T> {
  data: T;
}

export interface CreatePassagePayload {
  vehicleId: string;
  vehicleType: string;
  timestamp: string;
}
