export type VehicleType =
  | "car"
  | "motorbike"
  | "emergency"
  | "tractor"
  | "diplomat"
  | "military"
  | "foreign"
  | "bus";

export const VEHICLE_TYPES: VehicleType[] = [
  "car",
  "motorbike",
  "emergency",
  "tractor",
  "diplomat",
  "military",
  "foreign",
  "bus",
];

export const TOLL_FREE_VEHICLE_TYPES: VehicleType[] = [
  "motorbike",
  "emergency",
  "tractor",
  "diplomat",
  "military",
  "bus",
];

export interface TollPassage {
  id: string;
  vehicleId: string;
  vehicleType: VehicleType;
  timestamp: string;
}

export interface PassageCharge {
  passageId: string;
  baseFee: number;
  chargedFee: number;
  dailyTotal: number;
}

export interface PassageEvent {
  timestamp: string;
}

export interface ChargedPassage {
  windowStart: string;
  windowEnd: string;
  appliedFeeDkk: number;
  triggeringTimestamp: string;
}

export interface DailyTollRequest {
  vehicleType: string;
  passages: PassageEvent[];
}

export interface DailyTollResponse {
  date: string;
  totalFeeDkk: number;
  chargedPassages?: ChargedPassage[];
  notes?: string[];
}
