import { Request, Response } from "express";
import os from "os";

const getLocalIPv4 = (): string | null => {
  const interfaces = os.networkInterfaces();

  for (const networkInterface of Object.values(interfaces)) {
    if (!networkInterface) continue;

    for (const address of networkInterface) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }

  return null;
};

export const getHudUrlHandler = (_req: Request, res: Response) => {
  const host = getLocalIPv4() ?? "localhost";
  res.status(200).json({
    url: `http://${host}:1349/api/hud`,
  });
};
