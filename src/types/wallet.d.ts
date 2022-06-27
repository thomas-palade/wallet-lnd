type WalletObject = {
  readonly coins: number;
  readonly transactionId: string;
};

type Wallet = WalletObject & {
  readonly createdAt: string;
  readonly id: number;
  readonly updatedAt: string;
};

type WalletInsert = {
  readonly coins: number;
  readonly transaction_id: string;
};

type WalletRow = WalletInsert & {
  readonly created_at: Date;
  readonly id: string;
  readonly updated_at: Date;
};