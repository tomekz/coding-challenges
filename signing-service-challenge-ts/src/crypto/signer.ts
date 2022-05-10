import { Device } from '../domain/device';
import { SignatureResponse } from '../domain/sign.service';

export interface Signer {
  sign: (device: Device, data: string) => SignatureResponse | Error;
}
