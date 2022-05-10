import generateKeyPair from "../crypto/generation";
import { Log, Logger } from "../utils/logger";
import { Device } from "./device";
import {
  deviceRepository,
  IDeviceRepository,
} from "../persistence/device.repository";

export type NewDeviceData = Pick<Device, "id" | "label" | "algorithm">;

/**
 * Data-access-layer service for the Device model
 */
export class DeviceService {
  constructor(readonly deviceRepo: IDeviceRepository) {}

  async getById(id: string) {
    return await this.deviceRepo.findOne(id);
  }

  async createNew(newDeviceData: NewDeviceData): Promise<Device> {
    const device = await this.getById(newDeviceData.id);
    if (!device) {
      try {
        const keyPair = await generateKeyPair(newDeviceData.algorithm);
        return await this.deviceRepo.createNew({
          ...newDeviceData,
          signature_counter: 0,
          keyPair,
        });
      } catch (err) {
        Log.error(this, err);
        throw err;
      }
    } else {
      Log.error(this, `Device#${newDeviceData.id} already exists`);
      throw new Error(`Such device already exists`);
    }
  }

  async updateLastSignature(
    id: string,
    signature: string,
    signature_counter: number
  ): Promise<Device | undefined> {
    await this.deviceRepo.update(id, {
      signature_counter,
      last_signature: signature,
      updatedAt: new Date(),
    });
    Log.info(
      this,
      `updated Device#${id} singature_counter to ${signature_counter}`
    );
    return this.getById(id);
  }

  async getAll(): Promise<Array<Device>> {
    return await this.deviceRepo.getAll();
  }
}

export default new DeviceService(deviceRepository);
