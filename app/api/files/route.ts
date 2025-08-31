import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Missing file" }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const oaiFile = await toFile(Buffer.from(arrayBuffer), file.name, {
      type: file.type || "application/pdf",
    });
    const uploaded = await openai.files.create({ file: oaiFile, purpose: "user_data" });
    return NextResponse.json(
      { success: true, fileId: uploaded.id, filename: file.name },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}


