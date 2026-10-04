import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB Limit

const DEPT_MAP: Record<string, string> = {
  CS: "Computer Science",
  SE: "Software Engineering",
  EE: "Electrical Engineering",
  ME: "Mechanical Engineering",
  CE: "Civil Engineering",
  CH: "Chemical Engineering",
  CHE: "Chemical Engineering",
  BBA: "Business Administration",
  ARCH: "Architecture",
  MATH: "Mathematics",
  PHY: "Physics",
  CHEM: "Chemistry",
  BIO: "Biotechnology",
  AI: "Artificial Intelligence",
  DS: "Data Science",
  CY: "Cyber Security",
  CYS: "Cyber Security",
  MC: "Mechatronics Engineering",
  MTE: "Mechatronics Engineering",
  TE: "Telecom Engineering",
  PE: "Petroleum & Gas Engineering",
  ENV: "Environmental Engineering",
  MIN: "Mining Engineering",
  MET: "Metallurgical & Materials Engineering",
  IE: "Industrial & Manufacturing Engineering",
};

interface ParsedCardResult {
  valid: boolean;
  error?: string;
  data?: {
    name: string;
    studentId: string;
    university: string;
    cnic: string;
    expiryDate: string;
    department: string;
    program: string;
    batch: string;
  };
}

/**
 * Strict verification and field extraction for university student cards.
 * Validates registration number format, institution credentials, and parses student metadata.
 */
function parseStudentCardText(text: string): ParsedCardResult {
  if (!text || typeof text !== "string" || text.trim().length < 15) {
    return {
      valid: false,
      error:
        "Please upload a valid student card. No legible text could be recognized from the image.",
    };
  }

  const lower = text.toLowerCase();

  // 1. Strict screenshot & website UI rejection
  if (
    lower.includes("localhost:") ||
    lower.includes("/sign-up") ||
    lower.includes("profile photo") ||
    lower.includes("chatgpt image") ||
    lower.includes("devtools") ||
    lower.includes("browser")
  ) {
    return {
      valid: false,
      error:
        "Please upload a valid student card, not a screenshot of the web page or screen.",
    };
  }

  // 2. Identify Student Registration / Roll Number Pattern
  // Matches: 2023-CS-807, 2022-EE-104, 21L-1234, FA20-BCS-001, etc.
  const regPattern = /\b([0-9]{4}-[A-Za-z]{2,5}-[0-9]{1,5})\b/i;
  const fastPattern = /\b([0-9]{2}[A-Za-z]-[0-9]{3,5})\b/i;
  const comsatsPattern = /\b((?:FA|SP)[0-9]{2}-[A-Za-z]{2,4}-[0-9]{3,4})\b/i;
  const labeledPattern =
    /(?:Reg(?:istration)?\.?\s*(?:No|#)?|Roll\s*(?:No|#)?|Student\s*ID|CMS\s*ID|ID\s*#?)[:\s]*([A-Za-z0-9\/-]{4,20})/i;

  const regMatch =
    text.match(regPattern) ||
    text.match(fastPattern) ||
    text.match(comsatsPattern) ||
    text.match(labeledPattern);

  // 3. Identify University / Educational Institution Indicators
  const hasUniKeyword =
    /(?:UNIVERSITY|COLLEGE|INSTITUTE|TECHNOLOGY|CAMPUS|POLYTECHNIC|ACADEMY|FACULTY|DEPARTMENT|UET|FAST|NUST|LUMS|COMSATS|GIKI|NED|PU\b)/i.test(
      text
    );

  const hasCardKeyword =
    /(?:STUDENT|CARD|IDENTITY|REGISTRATION|REG\.?\s*NO|ROLL\.?\s*NO|EXPIRY|VALID\s*THRU|ENROLLMENT|CNIC)/i.test(
      text
    );

  // If no registration number pattern AND no academic card keywords found, it is definitely not a student card
  if (!regMatch || (!hasUniKeyword && !hasCardKeyword)) {
    return {
      valid: false,
      error:
        "Please upload a valid student card. The uploaded image could not be verified as a university student ID.",
    };
  }

  const rawStudentId = (regMatch[1] || regMatch[0]).trim().toUpperCase();

  // 4. Extract CNIC (13 digits: 3660128257509 or 36601-2825750-9)
  const cnicMatch = text.match(
    /(?:CNIC|NIC|National\s*ID)?[:#\s]*([0-9]{5}-?[0-9]{7}-?[0-9]{1}|[0-9]{13})/i
  );
  const cnic = cnicMatch ? cnicMatch[1].replace(/[^0-9]/g, "") : "Not specified";

  // 5. Extract Expiry Date
  const expiryMatch =
    text.match(
      /(?:Expiry|Valid\s*(?:Upto|Through|Thru|Till)|Exp\.?\s*Date)[:\s]*([0-9]{1,2}[-\/.][0-9]{1,2}[-\/.][0-9]{2,4})/i
    ) || text.match(/\b([0-9]{2}-[0-9]{2}-[0-9]{4})\b/);
  const expiryDate = expiryMatch ? (expiryMatch[1] || expiryMatch[0]).trim() : "Valid";

  // 6. Extract Student Name
  // On student cards (e.g. UET Lahore), the student's name is typically printed in uppercase lines
  // preceding or near the registration number.
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let name = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.match(
        /Reg|Roll|CNIC|Expiry|University|Technology|Student|Engineering|Identity|Card|Valid|Lahore|Islamabad|Karachi/i
      )
    ) {
      continue;
    }
    // Match line with 2-4 words consisting only of letters and spaces (uppercase)
    if (/^[A-Za-z\s.]{3,35}$/.test(line) && line.split(/\s+/).length >= 2) {
      name = line.toUpperCase();
      break;
    }
  }

  // Fallback: look for "Name:" label if line scan did not match
  if (!name) {
    const nameMatch = text.match(/(?:Name|Student\s*Name)[:\s]*([A-Za-z\s.]{3,35})/i);
    if (nameMatch) {
      name = nameMatch[1].trim().toUpperCase();
    }
  }

  // 7. Department, Degree, and Batch Resolution
  let department = "Engineering & Technology";
  let program = "Undergraduate Degree";
  let batch = new Date().getFullYear().toString();

  const deptCodeMatch = rawStudentId.match(/^[0-9]{4}-([A-Za-z]{2,5})-[0-9]+/);
  if (deptCodeMatch) {
    const deptCode = deptCodeMatch[1].toUpperCase();
    department = DEPT_MAP[deptCode] || `${deptCode} Department`;
    program = `BS ${department}`;
  } else {
    // Check if department name appears in text
    for (const [code, deptName] of Object.entries(DEPT_MAP)) {
      if (text.toUpperCase().includes(deptName.toUpperCase())) {
        department = deptName;
        program = `BS ${deptName}`;
        break;
      }
    }
  }

  const batchMatch = rawStudentId.match(/^([0-9]{4})/);
  if (batchMatch) {
    batch = batchMatch[1];
  }

  // 8. University Identification - ONLY if clearly present in recognized card text
  let university = "";
  if (/UNIVERSITY\s+OF\s+ENGINEERING\s+(?:&|AND)\s+TECHNOLOGY|UET\s+LAHORE/i.test(text)) {
    university = "University of Engineering & Technology Lahore";
  } else if (/FAST\b|NUCES/i.test(text)) {
    university = "FAST National University of Computer and Emerging Sciences";
  } else if (/NUST\b/i.test(text)) {
    university = "National University of Sciences and Technology (NUST)";
  } else if (/COMSATS/i.test(text)) {
    university = "COMSATS University Islamabad";
  } else if (/LUMS/i.test(text)) {
    university = "Lahore University of Management Sciences (LUMS)";
  } else if (/PUNJAB|PU\b/i.test(text)) {
    university = "University of the Punjab";
  } else if (/NED\s+UNIVERSITY/i.test(text)) {
    university = "NED University of Engineering and Technology";
  } else if (/GIKI\b/i.test(text)) {
    university = "Ghulam Ishaq Khan Institute (GIKI)";
  } else {
    // Check for explicit university/college title in card text
    const uniMatch = text.match(/\b([A-Za-z\s]{3,40}(?:UNIVERSITY|COLLEGE|INSTITUTE)[A-Za-z\s]{0,25})\b/i);
    if (uniMatch) {
      university = uniMatch[1].trim();
    }
  }

  // 9. Strict check: verify that all essential fields are present on the card photo
  const missingInCard: string[] = [];
  if (!university || university.trim() === "") {
    missingInCard.push("University Name");
  }
  if (!name || name.trim() === "" || name === "VERIFIED STUDENT") {
    missingInCard.push("Student Full Name");
  }
  if (!rawStudentId || rawStudentId.trim() === "") {
    missingInCard.push("Roll Number / Student ID");
  }

  if (missingInCard.length > 0) {
    return {
      valid: false,
      error: `Please upload a complete student card photo. The following fields are missing in the picture: ${missingInCard.join(", ")}.`,
    };
  }

  return {
    valid: true,
    data: {
      name,
      studentId: rawStudentId,
      university,
      cnic,
      expiryDate,
      department,
      program,
      batch,
    },
  };
}

/**
 * Perform optical character recognition on uploaded card buffer.
 */
async function performOcr(buffer: Buffer, mimeType: string): Promise<string | null> {
  try {
    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType || "image/png" });
    const fd = new FormData();
    fd.append("file", blob, "card.png");
    fd.append("apikey", "helloworld");
    fd.append("language", "eng");
    fd.append("isOverlayRequired", "false");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: fd,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    const parsedText = data.ParsedResults?.[0]?.ParsedText;
    return parsedText ? parsedText.trim() : null;
  } catch (err) {
    console.warn("OCR service notice:", err);
    return null;
  }
}

async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  try {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          format: "webp",
          resource_type: "image",
          transformation: [{ quality: "auto:good" }, { fetch_format: "webp" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    return uploadResult.secure_url;
  } catch (err) {
    console.warn("Cloudinary upload fallback:", err);
    return `data:image/webp;base64,${buffer.toString("base64")}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cardFile = formData.get("cardFile") as File | null;
    const avatarFile = formData.get("avatarFile") as File | null;
    const email = (formData.get("email") as string | null)?.trim() || "";

    if (!cardFile) {
      return NextResponse.json(
        { success: false, error: "Please upload your university student card image." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Please enter your university or personal email address." },
        { status: 400 }
      );
    }

    // 1. Strict 2MB Size Validation
    if (cardFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `Student card image exceeds 2MB limit (${(cardFile.size / (1024 * 1024)).toFixed(2)}MB). Please upload an image under 2MB.`,
        },
        { status: 400 }
      );
    }

    if (avatarFile && avatarFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `Profile avatar image exceeds 2MB limit (${(avatarFile.size / (1024 * 1024)).toFixed(2)}MB). Please upload an image under 2MB.`,
        },
        { status: 400 }
      );
    }

    const cardBuffer = Buffer.from(await cardFile.arrayBuffer());
    if (cardBuffer.length < 500) {
      return NextResponse.json(
        {
          success: false,
          isClear: false,
          error:
            "The uploaded file is empty or corrupted. Please upload a clear photo of your student card.",
        },
        { status: 400 }
      );
    }

    const cardBase64 = cardBuffer.toString("base64");

    // 2. Upload images to cloud storage
    const [cardPhotoUrl, avatarUrl] = await Promise.all([
      uploadToCloudinary(cardBuffer, "campus_stitch/student_cards"),
      avatarFile
        ? uploadToCloudinary(
            Buffer.from(await avatarFile.arrayBuffer()),
            "campus_stitch/avatars"
          )
        : Promise.resolve(""),
    ]);

    // 3. Verification & Extraction
    let extractedData: any = null;
    let isClear = true;
    let isStudentCard = true;
    let errorMessage = "";

    // Primary Analysis: Try Gemini LLM Vision if enabled and reachable
    const apiKey = process.env.GEMINI_API_KEY?.replace(/^["']|["']$/g, "");
    if (apiKey) {
      try {
        const systemPrompt = `You are a strict, expert AI student ID verification system.
Analyze the provided image of a student card.
You must perform the following critical checks strictly:
1. COMPLETE CARD PHOTO: Is the student card complete and fully shown in the picture, or is it cropped / partially cut off?
   If the university name, institution header, student name, or registration/roll number is cropped or missing, set:
   "isComplete": false,
   "isStudentCard": false,
   "errorFeedback": "Please upload a complete student card photo. The following fields are missing in the picture: [list the missing fields, e.g. University Name]."
2. UNIVERSITY NAME VISIBILITY: Is the university/college name or official institutional header clearly printed and visible in the image?
   DO NOT guess, assume, or auto-fill the university name if it is not clearly readable in the picture!
   If the university name is cropped out, missing, or unreadable, set:
   "university": "",
   "isStudentCard": false,
   "isComplete": false,
   "errorFeedback": "Please upload a complete student card photo. The following fields are missing in the picture: University Name."
3. REQUIRED FIELDS: The image MUST contain all three:
   - University/Institution name (clearly visible in the photo)
   - Student Full Name
   - Student ID / Registration / Roll Number
   If ANY of these required fields are missing or cropped out in the image:
   set isStudentCard: false, isComplete: false, and specify which fields are missing in errorFeedback.
4. If valid, complete, and clear, extract the fields directly from the card.

Return ONLY a JSON object:
{
  "isStudentCard": boolean,
  "isClear": boolean,
  "isComplete": boolean,
  "missingFields": string[],
  "errorFeedback": string,
  "name": string,
  "studentId": string,
  "university": string,
  "cnic": string,
  "expiryDate": string,
  "department": string,
  "program": string,
  "batch": string
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: systemPrompt },
                    {
                      inlineData: {
                        mimeType: "image/webp",
                        data: cardBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            isStudentCard = parsed.isStudentCard !== false && parsed.isComplete !== false;
            isClear = parsed.isClear !== false;
            if (!isClear || !isStudentCard || !parsed.university || parsed.university.trim() === "") {
              isStudentCard = false;
              errorMessage =
                parsed.errorFeedback ||
                "Please upload a complete student card photo. The university name is missing in the picture.";
            } else {
              extractedData = parsed;
            }
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini vision analysis notice:", geminiErr);
      }
    }

    // Secondary Analysis: High-precision OCR verification if Gemini was unavailable or inconclusive
    if (!extractedData && isStudentCard) {
      const ocrText = await performOcr(cardBuffer, cardFile.type || "image/png");

      if (ocrText) {
        const parsedCard = parseStudentCardText(ocrText);
        if (!parsedCard.valid) {
          return NextResponse.json(
            {
              success: false,
              isClear: false,
              isStudentCard: false,
              error:
                parsedCard.error ||
                "Please upload a valid student card. The uploaded image could not be verified as a university student ID.",
            },
            { status: 400 }
          );
        }
        extractedData = parsedCard.data;
      }
    }

    // If card validation failed or no valid student card was identified
    if (!extractedData || !isStudentCard || !isClear) {
      return NextResponse.json(
        {
          success: false,
          isClear: false,
          isStudentCard: false,
          error:
            errorMessage ||
            "Please upload a valid student card. The uploaded image could not be verified as a university student ID.",
        },
        { status: 400 }
      );
    }

    // Strict verification: Ensure no required fields are missing or cropped in the picture
    const missingFields: string[] = [];
    if (
      !extractedData?.university ||
      extractedData.university.trim() === "" ||
      extractedData.university.toLowerCase() === "unknown" ||
      extractedData.university.toLowerCase().includes("not specified")
    ) {
      missingFields.push("University Name");
    }
    if (
      !extractedData?.name ||
      extractedData.name.trim() === "" ||
      extractedData.name.toUpperCase() === "VERIFIED STUDENT" ||
      extractedData.name.toLowerCase() === "unknown"
    ) {
      missingFields.push("Student Full Name");
    }
    if (
      !extractedData?.studentId ||
      extractedData.studentId.trim() === "" ||
      extractedData.studentId.toLowerCase() === "unknown"
    ) {
      missingFields.push("Roll Number / Student ID");
    }

    if (missingFields.length > 0 || extractedData?.isComplete === false) {
      return NextResponse.json(
        {
          success: false,
          isClear: false,
          isStudentCard: false,
          error:
            extractedData?.errorFeedback ||
            `Please upload a complete student card photo. The following fields are missing in the picture: ${missingFields.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    // Successful Verification: Return extracted student credentials
    return NextResponse.json({
      success: true,
      isClear: true,
      isStudentCard: true,
      extracted: {
        name: extractedData.name,
        studentId: extractedData.studentId,
        university: extractedData.university,
        cnic: extractedData.cnic,
        expiryDate: extractedData.expiryDate,
        department: extractedData.department,
        program: extractedData.program,
        batch: extractedData.batch,
        email,
        cardPhotoUrl,
        avatarUrl,
      },
    });
  } catch (error: any) {
    console.error("Student card verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Please upload a valid student card. Could not process the uploaded image.",
      },
      { status: 500 }
    );
  }
}
