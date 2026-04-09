/**
 * API layer — this is part of the challenge.
 *
 * Implement the functions below to communicate with the backend.
 * You are free to choose your approach:
 *
 *  - Plain `fetch` calls (no extra dependencies needed)
 *  - A library such as axios, ky, or similar
 *  - React Query, SWR, or another data-fetching/caching library
 *
 * The backend runs at http://localhost:4000 by default.
 * Override with the NEXT_PUBLIC_API_BASE_URL environment variable if needed.
 *
 * Available endpoints:
 *
 *   GET    /api/passages            → list all passages (with calculated fees)
 *   POST   /api/passages            → create a new passage
 *   DELETE /api/passages/:id        → remove a passage
 *   GET    /api/meta/vehicle-types  → list available vehicle types
 */

import {
  ApiListResponse,
  CreatePassagePayload,
  Passage,
  VehicleTypeOption
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function fetchPassages(): Promise<Passage[]> {
  // TODO: Implement — GET /api/passages
  throw new Error("fetchPassages not implemented");
}

export async function fetchVehicleTypes(): Promise<VehicleTypeOption[]> {
  // TODO: Implement — GET /api/meta/vehicle-types
  throw new Error("fetchVehicleTypes not implemented");
}

export async function createPassage(
  payload: CreatePassagePayload
): Promise<void> {
  // TODO: Implement — POST /api/passages
  throw new Error("createPassage not implemented");
}

export async function deletePassage(id: string): Promise<void> {
  // TODO: Implement — DELETE /api/passages/:id
  throw new Error("deletePassage not implemented");
}
