import express from "express";
import bodyParser from "body-parser";
import DeviceService from "../domain/device.service";
import SignService from "../domain/sign.service";

const server = express();
server.use(bodyParser.json());

server.get("/health", (req, res) => {
  res.status(200);
  res.send(
    JSON.stringify({
      status: "pass",
      version: "v1",
    })
  );
});

server.post("/api/device", async (req, res) => {
  const { body } = req;
  try {
    const device = await DeviceService.createNew({ ...body });
    // omit confidential keyPair in public client response
    const { keyPair, ...rest } = device;
    res.send({
      rest,
    });
  } catch (error) {
    res.status(500).send("server error");
  }
});

server.post("/api/sign", async (req, res) => {
  const { deviceId, data } = req.body;
  try {
    const device = await DeviceService.getById(deviceId);
    if (!device) {
      res.status(500).send("device not found");
    } else {
      const signatureResponse = await SignService.signTransaction({
        device,
        data,
      });
      res.send(signatureResponse);
    }
  } catch (error) {
    res.status(500).send("server error");
  }
});

// for debugging purposes only, would not be exposed for the clients
server.get("/api/devices", async (req, res) => {
  try {
    const devices = await DeviceService.getAll();
    res.send({ devices });
  } catch (error) {
    res.status(500).send("server error");
  }
});

export default server;
