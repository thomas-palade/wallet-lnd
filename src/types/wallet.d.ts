type WalletObject = {
  readonly coins: number;
};

type Wallet = WalletObject & {
  readonly createdAt: string;
  readonly id: number;
  readonly updatedAt: string;
};

type WalletInsert = {
  readonly coins: number;
};

type WalletRow = WalletInsert & {
  readonly created_at: Date;
  readonly id: string;
  readonly updated_at: Date;
};