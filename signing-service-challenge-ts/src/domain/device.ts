import { KeyPair } from "../crypto/generation";

export enum Algorithm {
  RSA = "RSA",
  ECC = "ECC",
}

export interface Device {
  id: string;
  label?: string;
  algorithm: Algorithm;
  signature_counter: number;
  last_signature?: string;
  keyPair: KeyPair;
  updatedAt?: Date;
}
