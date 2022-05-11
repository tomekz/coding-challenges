import exp from "constants";
import { IDeviceRepository } from "../persistence/device.repository";
import { Algorithm, Device } from "./device";
import deviceService, { DeviceService } from "./device.service";
import { SignService } from "./sign.service";

describe("SignService", () => {
  let signService: SignService;
  let mockDevice: Device = {
    id: "xxxxxx",
    algorithm: Algorithm.RSA,
    keyPair: { private: "private", public: "public" },
    signature_counter: 0,
  };
  let mockDeviceRepo: jest.Mocked<IDeviceRepository> = {
    createNew: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    getAll: jest.fn(),
  };
  let mockDeviceService: jest.Mocked<DeviceService> = {
    getById: jest.fn(),
    createNew: jest.fn(),
    updateLastSignature: jest.fn(),
    getAll: jest.fn(),
    deviceRepo: mockDeviceRepo,
  };
  beforeEach(() => {
    jest.clearAllMocks();
    signService = new SignService(mockDeviceService);
  });
  test("signs the transaction in the correct format", async () => {
    const { signature, signed_data } = await signService.signTransaction({
      device: mockDevice,
      data: "dataToSign",
    });
    expect(signed_data).toMatch(new RegExp(".*_.*_.*"));
    expect(signature).toBe("eHh4eHh4");
  });
  test("updates device`s `last_signature`", async () => {
    const { signature } = await signService.signTransaction({
      device: mockDevice,
      data: "dataToSign",
    });
    expect(mockDeviceService.updateLastSignature).toHaveBeenCalledWith(
      mockDevice.id,
      signature,
      1
    );
  });
});
