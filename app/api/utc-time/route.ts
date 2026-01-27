
import { encryptDataApi } from "@/components/shared/encryption";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const utcTimestamp = parseFloat((Date.now() / 1000).toFixed(3));
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  res
    .status(200)
    .json({ fx_dyn: encryptDataApi(utcTimestamp, process.env.SECRET_KEY as string) });
}