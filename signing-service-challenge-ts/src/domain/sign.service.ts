import signRsa from "../crypto/rsa";
import signEcdsa from "../crypto/ecdsa";
import { Signer } from "../crypto/signer";
import { Log } from "../utils/logger";
import { Algorithm, Device } from "./device";
import {
  deviceRepository,
  IDeviceRepository,
} from "../persistence/device.repository";
import { DeviceService } from "./device.service";
import { Mutex, MutexInterface } from "async-mutex";

export interface SignatureResponse {
  signature: string;
  signed_data: string;
}

function prepareDataToBeSigned(device: Device, data: string) {
  const { id, keyPair, signature_counter } = device;
  const signature = device.last_signature || Buffer.from(id).toString("base64");
  const dataToBeSigned = [signature_counter.toString(10), data, signature];
  return { signature, dataToBeSigned };
}
class EcdsaSigner implements Signer {
  sign(device: Device, data: string): Error | SignatureResponse {
    try {
      const { signature, dataToBeSigned } = prepareDataToBeSigned(device, data);
      return {
        signature,
        signed_data: dataToBeSigned
          .map((d) => signEcdsa(d, device.keyPair))
          .join("_"),
      };
    } catch (error) {
      Log.error(this, error);
      return new Error("Unable to sign the data");
    }
  }
}
class RsaSigner implements Signer {
  sign(device: Device, data: string): Error | SignatureResponse {
    try {
      const { signature, dataToBeSigned } = prepareDataToBeSigned(device, data);
      return {
        signature,
        signed_data: dataToBeSigned
          .map((d) => signRsa(d, device.keyPair))
          .join("_"),
      };
    } catch (error) {
      Log.error(this, error);
      return new Error("Unable to sign the data");
    }
  }
}

export class SignService {
  private locks: Map<string, MutexInterface>;
  constructor(private readonly deviceService: DeviceService) {
    this.locks = new Map();
  }

  private getSigner(algorithm: Algorithm): Signer {
    if (algorithm === Algorithm.ECC) return new RsaSigner();
    else if (algorithm === Algorithm.RSA) return new EcdsaSigner();
    throw new Error("unrecognized signing algorithm");
  }

  private async updateSignature(device: Device, signature: string) {
    if (!this.locks.has(device.id)) {
      this.locks.set(device.id, new Mutex());
    }

    this.locks
      .get(device.id)
      ?.acquire()
      .then(async (release) => {
        try {
          await this.deviceService.updateLastSignature(
            device.id,
            signature,
            device.signature_counter + 1
          );
        } catch (error) {
        } finally {
          release();
        }
      });
  }

  async signTransaction({
    device,
    data,
  }: {
    device: Device;
    data: string;
  }): Promise<SignatureResponse> {
    const result = this.getSigner(device.algorithm).sign(device, data);
    if (result instanceof Error) {
      throw result;
    }
    await this.updateSignature(device, result.signature);
    return result;
  }
}
export default new SignService(new DeviceService(deviceRepository));
