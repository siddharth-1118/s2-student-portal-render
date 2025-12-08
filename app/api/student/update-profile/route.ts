// app/api/student/update-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Valid students list - in a real app, this would be in a database
const validStudents = [
  { roll: "RA2511026010868", name: "GURRAM VINAY JASWANTH" },
  { roll: "RA2511026010869", name: "VARNIKA JAIN" },
  { roll: "RA2511026010870", name: "KONDA VEERAVENKATAGANESH" },
  { roll: "RA2511026010871", name: "Y HARSHITHA" },
  { roll: "RA2511026010872", name: "ESAKI KESAVAN V" },
  { roll: "RA2511026010874", name: "KAVI PRIYA M" },
  { roll: "RA2511026010875", name: "SAMRIDDHI SINGH" },
  { roll: "RA2511026010876", name: "SATVIK SAHU" },
  { roll: "RA2511026010877", name: "MOHAMMED UBAID UL NAFEY" },
  { roll: "RA2511026010878", name: "ADITYA SHUBHANKAR" },
  { roll: "RA2511026010879", name: "PARUL TEKADE" },
  { roll: "RA2511026010880", name: "SIDDHARTHA MAJUMDER" },
  { roll: "RA2511026010881", name: "KEVIN K SHIBU" },
  { roll: "RA2511026010882", name: "BOBBALA MANJUNATH REDDY" },
  { roll: "RA2511026010883", name: "AARYA JAIN" },
  { roll: "RA2511026010884", name: "HARSHITHA GUNTUR VENKATESWARLU" },
  { roll: "RA2511026010885", name: "L NAGA ABHIESH REDDY" },
  { roll: "RA2511026010886", name: "SHARMISTHA MOHAPATRA" },
  { roll: "RA2511026010887", name: "VENKATA SAI TEJEESH CH" },
  { roll: "RA2511026010888", name: "ARYA G A" },
  { roll: "RA2511026010889", name: "MIHIR SINHA" },
  { roll: "RA2511026010890", name: "PRANAV SINGH" },
  { roll: "RA2511026010891", name: "AMRITHA H" },
  { roll: "RA2511026010892", name: "A SAI SANZANA RREDDY" },
  { roll: "RA2511026010893", name: "ARTH PARETA" },
  { roll: "RA2511026010894", name: "ARPIT SINGH" },
  { roll: "RA2511026010895", name: "SHARON NILUPHA J" },
  { roll: "RA2511026010896", name: "ADUTIYA AGARWAL" },
  { roll: "RA2511026010897", name: "TEG SINGH GILL" },
  { roll: "RA2511026010898", name: "DHANUSH KUMAR S" },
  { roll: "RA2511026010899", name: "ADIBOINA DIGVIJAY" },
  { roll: "RA2511026010900", name: "DARSHIL JOSHI" },
  { roll: "RA2511026010901", name: "RACHIT JHA" },
  { roll: "RA2511026010902", name: "TAYDEN J" },
  { roll: "RA2511026010903", name: "MANNI HARSHINI CHOWDARY" },
  { roll: "RA2511026010904", name: "EISHIT JAIN" },
  { roll: "RA2511026010905", name: "MALIK MOHMMAD AUSAIB" },
  { roll: "RA2511026010906", name: "VOOKA SAI SIDDHARTH" },
  { roll: "RA2511026010907", name: "SHUBHANG DARSHAN" },
  { roll: "RA2511026010908", name: "SRI VAISHNAVIMEENA LA" },
  { roll: "RA2511026010909", name: "ANURAG PRASAD" },
  { roll: "RA2511026010910", name: "DONALD ABISHAI FERNANDO A" },
  { roll: "RA2511026010911", name: "HARIHARAN R" },
  { roll: "RA2511026010912", name: "PANDIPRAJIN S" },
  { roll: "RA2511026010913", name: "VISHNUVARDHAN RAMPRABU" },
  { roll: "RA2511026010914", name: "S AHAMED THALHA" },
  { roll: "RA2511026010915", name: "PARTH SINGH" },
  { roll: "RA2511026010916", name: "THIRISHA M" },
  { roll: "RA2511026010917", name: "MOHITHA SK" },
  { roll: "RA2511026010918", name: "SHAGUN" },
  { roll: "RA2511026010919", name: "AARON LOW" },
  { roll: "RA2511026010920", name: "KRISH SHARMA" },
  { roll: "RA2511026010921", name: "M SARVESH" },
  { roll: "RA2511026010922", name: "KUNSH KAKKAR" },
  { roll: "RA2511026010923", name: "PASALA GHANA CHARAN NARAYANA" },
  { roll: "RA2511026010924", name: "DIKSHA GULATI" },
  { roll: "RA2511026010925", name: "NOORUL ARFIN S" },
  { roll: "RA2511026010926", name: "ARNAV SINGH" },
  { roll: "RA2511026010927", name: "M MANUSREE" },
  { roll: "RA2511026010928", name: "SHAURYA SINGLA" },
  { roll: "RA2511026010929", name: "SUBHANKAR BISWAL" },
  { roll: "RA2511026010930", name: "DHANUNJAY DAS" },
  { roll: "RA2511026010931", name: "AANJNAY SAROHA" },
  { roll: "RA2511026010932", name: "NAGULESH R" },
  { roll: "RA2511026010933", name: "EPURI NITHIN" },
  { roll: "RA2511026010934", name: "SAYED AYESHA" },
  { roll: "RA2511026010935", name: "K ARAVIND" },
  { roll: "RA2511026010936", name: "DEVA PRIYA DARSINI PINNAMANENI" },
  { roll: "RA2511026010937", name: "KATEPALLI RAJESH" },
  { roll: "RA2511026010938", name: "GOLI THANMAYE" },
  { roll: "RA2511026010939", name: "YALLAPU VIHAS" },
  { roll: "RA2511026010940", name: "AQIB SHAFEEQUE" },
  { roll: "RA2511026010603", name: "YESHVANTHKRITHIK" },
  { roll: "SV3824", name: "Student with email sv3824@srmist.edu.in" }
];

export async function POST(req: NextRequest) {
  try {
    const { email, registerNo, name } = await req.json();

    if (!email || !registerNo || !name) {
      return NextResponse.json({ 
        success: false, 
        error: "Email, register number, and name are required" 
      }, { status: 400 });
    }

    // Validate register number against the valid students list
    const validStudent = validStudents.find(s => s.roll === registerNo.toUpperCase());
    
    if (!validStudent) {
      return NextResponse.json({ 
        success: false, 
        error: "Register number not found in class list. Please check your register number." 
      }, { status: 400 });
    }

    // Check if the name matches the register number (case insensitive)
    if (validStudent.name.toLowerCase() !== name.toLowerCase()) {
      return NextResponse.json({ 
        success: false, 
        error: "Name does not match the register number. Please verify your name." 
      }, { status: 400 });
    }

    // Update student record with the correct register number
    const updatedStudent = await prisma.student.update({
      where: { email: email },
      data: {
        registerNo: registerNo.toUpperCase(),
        name: name,
        profileCompleted: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      student: updatedStudent 
    });
  } catch (error) {
    console.error("Error updating student profile:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update profile. Please try again." 
    }, { status: 500 });
  }
}