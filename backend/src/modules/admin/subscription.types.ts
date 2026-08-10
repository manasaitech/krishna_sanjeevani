export interface SubscriptionFilters {
  search?: string;
  status?: string; // active, pending, expired, canceled
  planId?: string; // free, standard, premium
  page?: number;
  limit?: number;
}

export interface PaymentFilters {
  search?: string;
  status?: string; // pending, completed, failed, refunded
  page?: number;
  limit?: number;
}
