import { Injectable } from '@angular/core';
import { ProPlusApiBase } from './pro-plus-api-base.service';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  constructor(
    private readonly api: ProPlusApiBase,

  ) { }

  async getAvailability(
    request: AvailabilityRequest
  ): Promise<AvailabilityResponse> {
    const { ok, body } = await this.api.getV2<AvailabilityResponse>(
      'getBranchItemQty',
      request
    );
    if ( !ok || !body ) {
      throw new Error('Failed to get availability');
    }
    return body;
  }
}
export interface AvailabilityRequest {
  itemNumbers: string;
  accountId?: string | null | undefined;
  branchId?: string | null | undefined;
}
export interface AvailabilityResponse {
  messages: string;
  success: boolean;
  result: Result;
}
export interface Items {
  itemNumber: string;
  uom: string;
  totalQty: string;
  availableQty: string;
  avgQty30Days: string;
  avgQty7Days: string;
}
export interface Result {
  items: Items[];
  branchInfo: BranchInfo;
}
export interface BranchInfo {
  branchId: string;
  company: string;
  division: string;
  region: string;
  market: string;
}
