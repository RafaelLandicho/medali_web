"use client";

import { useState, useEffect, useRef, use } from "react";
import type { Patient } from "./medical_records";
import html2canvas from "html2canvas-pro";
import { Button } from "@/components/ui/button";
import { db } from "@/firebaseConfig";
import { ref, set, push } from "firebase/database";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/auth/authprovider";
type FullDetails = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
};

export function ViewFullPatient({ patient, onOpenChange }: FullDetails) {
  const { user } = useAuth();
  const [fields, setFields] = useState(patient);
  const printRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const logsRef = ref(db, "logs/");
  const updateLog = async () => {
    const newLog = push(logsRef);
    await set(newLog, {
      medicalRecordLog: `Medical Record ${fields.id} ${fields.firstName} ${fields.lastName} downloaded by ${user?.firstName} ${user?.lastName}`,
      logTime: new Date().toLocaleString(),
    });
  };
  useEffect(() => {
    setFields(patient);
    console.log("medicalHistory:", patient.medicalHistory);
  }, [patient]);

  const medicalHistory = Object.values(fields.medicalHistory || {});

  const handleDownloadImage = async () => {
    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      scrollY: -window.scrollY,
      useCORS: true,
      windowWidth: document.documentElement.scrollWidth,
    });

    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = `${fields.firstName}_${fields.lastName}_MedicalRecord.png`;
    link.click();

    updateLog();
  };
  if (!isMobile) {
    return (
      <div className="flex flex-col max-h-[75vh] overflow-y-auto p-0">
        <div
          ref={printRef}
          className="w-full max-w-5xl bg-white border border-gray-300 shadow-md font-sans text-gray-800 p-4 mx-auto"
        >
          {/*  PREVIOUS RECORDS  */}
          <div className="bg-blue-300 text-white px-6 py-3 rounded-t-md">
            <h1 className="text-2xl font-bold">Previous Records</h1>
          </div>

          <div className="flex flex-col space-y-6">
            {medicalHistory?.map((item, index) => (
              <div key={index} className="border rounded shadow-sm">
                <div className="p-4 grid grid-cols-3 gap-4">
                  {/* DEMOGRAPHICS */}
                  <div className="col-span-1 border border-gray-300 rounded shadow-sm">
                    <div className="bg-blue-300 text-white px-4 py-2 font-semibold text-lg">
                      Patient Demographics
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-3 text-sm">
                      <Field
                        label="Patient Name"
                        value={`${item.firstName} ${item.lastName}`}
                      />
                      <Field label="Sex/Gender" value={item.gender || ""} />
                      <Field label="Address" value={item.address || ""} />
                      <Field label="Phone" value={item.telephone || ""} />
                    </div>
                  </div>

                  {/* VITAL SIGNS */}
                  <div className="col-span-1 border border-gray-300 rounded shadow-sm">
                    <div className="bg-blue-300 text-white px-4 py-2 font-semibold text-lg">
                      Vital Signs
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-3 text-sm">
                      <Field
                        label="Blood Pressure"
                        value={item.bloodPressure || ""}
                      />
                      <Field label="Heart Rate" value={item.heartRate || ""} />
                      <Field
                        label="Respiratory Rate"
                        value={item.respiratoryRate || ""}
                      />
                      <Field
                        label="Temperature"
                        value={item.temperature || ""}
                      />
                      <Field
                        label="Oxygen Saturation"
                        value={item.oxygenSaturation || ""}
                      />
                    </div>
                  </div>

                  {/* MEDICAL HISTORY */}
                  <div className="col-span-1 border border-gray-300 rounded shadow-sm">
                    <div className="bg-blue-300 text-white px-4 py-2 font-semibold text-lg">
                      Medical History
                    </div>
                    <div className="p-4 text-sm space-y-4">
                      <div>
                        <label className="font-semibold">
                          Past Illnesses / Chronic Conditions:
                        </label>
                        <div className="border border-gray-300 p-2 rounded min-h-[60px]"></div>
                      </div>

                      <div>
                        <label className="font-semibold">
                          Surgeries & Hospitalizations:
                        </label>
                        <div className="border border-gray-300 p-2 rounded min-h-[60px]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ===== CURRENT RECORD (same column) ===== */}
          <div className="bg-[#00a896] text-white px-6 py-3 mt-10 rounded-t-md">
            <h1 className="text-2xl font-bold">Medical Record</h1>
          </div>

          <div className="p-4 grid grid-cols-3 gap-4">
            {/* DEMOGRAPHICS */}
            <div className="col-span-1 border border-gray-300 rounded shadow-sm">
              <div className="bg-[#00a896] text-white px-4 py-2 font-semibold text-lg">
                Patient Demographics
              </div>
              <div className="p-4 grid grid-cols-1 gap-3 text-sm">
                <Field
                  label="Patient Name"
                  value={`${fields.firstName} ${fields.lastName}`}
                />
                <Field label="Sex/Gender" value={fields.gender || ""} />
                <Field label="Address" value={fields.address || ""} />
                <Field label="Phone" value={fields.telephone || ""} />
              </div>
            </div>

            {/* VITAL SIGNS */}
            <div className="col-span-1 border border-gray-300 rounded shadow-sm">
              <div className="bg-[#00a896] text-white px-4 py-2 font-semibold text-lg">
                Vital Signs
              </div>
              <div className="p-4 grid grid-cols-1 gap-3 text-sm">
                <Field
                  label="Blood Pressure"
                  value={fields.bloodPressure || ""}
                />
                <Field label="Heart Rate" value={fields.heartRate || ""} />
                <Field
                  label="Respiratory Rate"
                  value={fields.respiratoryRate || ""}
                />
                <Field label="Temperature" value={fields.temperature || ""} />
                <Field
                  label="Oxygen Saturation"
                  value={fields.oxygenSaturation || ""}
                />
              </div>
            </div>

            {/* MEDICAL HISTORY */}
            <div className="col-span-1 border border-gray-300 rounded shadow-sm">
              <div className="bg-[#00a896] text-white px-4 py-2 font-semibold text-lg">
                Medical History
              </div>
              <div className="p-4 text-sm space-y-4">
                <div>
                  <label className="font-semibold">
                    Past Illnesses / Chronic Conditions:
                  </label>
                  <div className="border border-gray-300 p-2 rounded min-h-[60px]"></div>
                </div>

                <div>
                  <label className="font-semibold">
                    Surgeries & Hospitalizations:
                  </label>
                  <div className="border border-gray-300 p-2 rounded min-h-[60px]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 mx-auto">
          <Button
            onClick={handleDownloadImage}
            className="!bg-orange-500 text-white hover:bg-indigo-800"
          >
            Download Medical Record
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6">
      <div
        ref={printRef}
        className="w-full max-w-l bg-white border border-gray-300 shadow-md font-sans text-gray-800 overflow-y-auto max-h-[80vh] p-4"
      >
        <div className="bg-blue-600 text-white px-6 py-3 rounded-t-md">
          <h1 className="text-2xl font-bold">Medical Record</h1>
        </div>

        <div className="mt-4">
          <div className="bg-[#0c208a] text-white px-4 py-2 font-semibold text-lg">
            Patient Demographics
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 text-sm">
            <Field
              label="Patient Name"
              value={`${fields.firstName} ${fields.lastName}`}
            />
            {/* <Field label="Date of Birth" value={fields.birthDate || ""} /> */}
            <Field label="Sex/Gender" value={fields.gender || ""} />
            <Field label="Address" value={fields.address || ""} colSpan={2} />
            <Field label="Phone" value={fields.telephone || ""} />
            {/* <Field label="Email" value={fields.email || ""} />
            <Field label="Emergency Contact Name" value={fields.emergencyContactName || ""} colSpan={2} />
            <Field label="Relationship" value={fields.emergencyRelationship || ""} />
            <Field label="Phone" value={fields.emergencyPhone || ""} />
            <Field label="Primary Care Provider" value={fields.primaryCareProvider || ""} />
            <Field label="Insurance Details" value={fields.insurance || ""} /> */}
          </div>
        </div>

        {/* Vital Signs */}
        <div className="mt-4">
          <div className="bg-[#0c208a] text-white px-4 py-2 font-semibold text-lg">
            Vital Signs
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 text-sm">
            <Field label="Blood Pressure" value={fields.bloodPressure || ""} />
            <Field label="Heart Rate" value={fields.heartRate || ""} />
            <Field
              label="Respiratory Rate"
              value={fields.respiratoryRate || ""}
            />
            <Field label="Temperature" value={fields.temperature || ""} />
            <Field
              label="Oxygen Saturation"
              value={fields.oxygenSaturation || ""}
            />
            {/* <Field label="Pain Level" value={fields.painLevel || ""} />
            <Field label="Weight" value={fields.weight || ""} />
            <Field label="Height" value={fields.height || ""} /> */}
          </div>
        </div>

        <div className="mt-4 mb-6">
          <div className="bg-[#0c208a] text-white px-4 py-2 font-semibold text-lg">
            Medical History
          </div>
          <div className="p-4 text-sm space-y-4">
            <div>
              <label className="font-semibold">
                Past Illnesses / Chronic Conditions:
              </label>
              <div className="border border-gray-300 p-2 rounded min-h-[60px]">
                {/* {fields.pastConditions || ""} */}
              </div>
            </div>

            <div>
              <label className="font-semibold">
                Surgeries & Hospitalizations (with dates):
              </label>
              <div className="border border-gray-300 p-2 rounded min-h-[60px]">
                {/* {fields.surgeries || ""} */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Button
          onClick={handleDownloadImage}
          className="bg-indigo-700 text-white hover:bg-indigo-800"
        >
          Download Medical Record
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  colSpan = 1,
}: {
  label: string;
  value: string;
  colSpan?: number;
}) {
  return (
    <div className={`col-span-${colSpan} flex flex-col`}>
      <label className="font-semibold">{label}:</label>
      <div className="border border-gray-300 rounded p-1.5 bg-gray-50 min-h-[24px]">
        {value || ""}
      </div>
    </div>
  );
}
