import { encryptDataApi } from "@/components/shared/encryption";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const utcTimestamp = parseFloat((Date.now() / 1000).toFixed(3));
    const apiKey = `O9Fybfhn.0bhxrjD5NH5OyZYPTBDsAhf2xSV2RD3R///${utcTimestamp}`;
    const apiKeyEncrypt = encryptDataApi(apiKey, process.env.SECRET_KEY as string);
    
    return NextResponse.json(
      { apiKey: apiKeyEncrypt },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          "Surrogate-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error generating API key:", error);
    return NextResponse.json(
      { error: "Failed to generate API key" },
      { status: 500 }
    );
  }
}
