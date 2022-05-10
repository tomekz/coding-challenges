import fs from "fs";
import path from "path";
import { Log } from "../utils/logger";
import { Device } from "../domain/device";

export interface IDeviceRepository {
  getAll(): Promise<Array<Device>>;
  update(id: string, data: Partial<Device>): Promise<Device>;
  findOne(id: string): Promise<Device | undefined>;
  createNew(device: Device): Promise<Device>;
}

const DB_JSON_PATH = path.join(__dirname, "db.json");
/**
 * Repository for easy swapping of persistence logic to a database system such as PostgreSQL.
 **/
class DeviceRepository implements IDeviceRepository {
  private _devices: Array<Device> = [];

  private load(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      fs.readFile(DB_JSON_PATH, "utf8", (err, data) => {
        if (err) reject(err);
        this._devices = data ? JSON.parse(data) : [];
        resolve();
      });
    });
  }

  private save(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(DB_JSON_PATH, JSON.stringify(this._devices), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async update(id: string, data: Partial<Device>): Promise<Device> {
    await this.load();
    let index = this._devices.findIndex((d) => d.id === id);
    let device = this._devices[index];
    this._devices[index] = { ...device, ...data };
    await this.save();
    return this._devices[index];
  }

  async findOne(deviceId: string): Promise<Device | undefined> {
    await this.load();
    return this._devices.find((d) => d.id === deviceId);
  }

  async createNew(newDevice: Device): Promise<Device> {
    this._devices.push(newDevice);
    await this.save();
    Log.info(this, `saved new Device#${newDevice.id}`);
    console.log({ level: Log.logLevel });
    return newDevice;
  }
  async getAll(): Promise<Device[]> {
    await this.load();
    return this._devices;
  }
}

export const deviceRepository = new DeviceRepository();
