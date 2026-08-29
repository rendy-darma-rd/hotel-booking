// @types/midtrans-client only declares `transaction_details` on
// SnapTransactionParameters. This augments it with the other Snap API fields
// this project actually sends — see Midtrans's Snap API docs for the full
// (much larger) set of optional fields if you need more later.
//
// The `export {}` below is required: without it, this file has no top-level
// import/export and TypeScript treats it as a global script, which makes the
// `declare module` block REPLACE the real midtrans-client module instead of
// merging with it (and its actual exports like `Snap` disappear).
export {};

declare module 'midtrans-client' {
  interface SnapTransactionParameters {
    customer_details?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
    item_details?: Array<{
      id?: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    callbacks?: {
      finish?: string;
      error?: string;
      pending?: string;
    };
  }
}
