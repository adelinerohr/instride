export interface QuickBooksAddress {
  Line1?: string;
  City?: string;
  CountrySubDivisionCode?: string;
  PostalCode?: string;
}

export interface QuickBooksCustomerRef {
  value: string;
  name?: string;
}

export interface QuickBooksLineItem {
  Amount: number;
  DetailType: "SalesItemLineDetail";
  Description?: string;
  SalesItemLineDetail: {
    Qty?: number;
    UnitPrice?: number;
    ItemRef?: {
      value: string;
      name?: string;
    };
  };
}

export interface QuickBooksInvoicePayload {
  Line: QuickBooksLineItem[];
  CustomerRef: QuickBooksCustomerRef;
  BillEmail?: {
    Address: string;
  };
  AllowOnlineACHPayment?: boolean;
  AllowOnlineCreditCardPayment?: boolean;
  DueDate?: string;
  TxnDate?: string;
}

export interface QuickBooksInvoice {
  Id: string;
  SyncToken: string;
  DocNumber: string;
  TxnDate: string;
  CustomerRef: QuickBooksCustomerRef;
  Line: QuickBooksLineItem[];
  TotalAmt: number;
  Balance: number;
  EmailStatus?: string;
  InvoiceLink?: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
}

export interface QuickBooksInvoiceResponse {
  Invoice: QuickBooksInvoice;
  time: string;
}

export interface QuickBooksErrorDetail {
  Message: string;
  Detail: string;
  code: string;
  element?: string;
}

export interface QuickBooksErrorResponse {
  Fault: {
    Error: QuickBooksErrorDetail[];
    type: string;
  };
  time: string;
}
