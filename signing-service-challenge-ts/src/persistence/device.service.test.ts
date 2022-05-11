import { DeviceService } from "../domain/device.service";
import { IDeviceRepository } from "./device.repository";
import { Algorithm } from "../domain/device";

jest.mock("../crypto/generation", () =>
  jest.fn().mockResolvedValue({ private: "private", public: "public" })
);

describe("DeviceService", () => {
  let mockDeviceRepo: jest.Mocked<IDeviceRepository> = {
    createNew: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    getAll: jest.fn(),
  };
  let deviceService: DeviceService;
  beforeEach(() => {
    jest.clearAllMocks();
    deviceService = new DeviceService(mockDeviceRepo);
  });
  test("creates new device", async () => {
    const newDevice = {
      algorithm: Algorithm.ECC,
      id: "xxx",
      label: "test",
    };
    await deviceService.createNew(newDevice);
    expect(mockDeviceRepo.createNew).toBeCalledWith({
      signature_counter: 0,
      keyPair: { private: "private", public: "public" },
      ...newDevice,
    });
  });
});
