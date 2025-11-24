"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import type { Prescription } from "./view-prescriptions"
import html2canvas from "html2canvas-pro"
import { db } from "@/firebaseConfig"
import { ref, set, push } from "firebase/database"

import { useAuth } from "@/auth/authprovider"

type EditPrescriptionProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Prescription
}

export function ViewFullPrescription({ patient: prescription, onOpenChange }: EditPrescriptionProps) {
  const { user } = useAuth()
  const [fields, setFields] = useState(prescription)
  const [drugs, setDrugs] = useState(prescription.drugs || [])
  const printRef = useRef<HTMLDivElement>(null)

  const logsRef = ref(db,'logs/')
  const updateLog = async () =>{
    const newLog = push(logsRef)
     await set(newLog, {
            prescriptionLog:`Prescription ${fields.id} ${fields.patientFirstName} ${fields.patientLastName} downloaded by ${user?.firstName} ${user?.lastName} `,
            logTime: new Date().toLocaleString(),
          })

  }

  useEffect(() => {
    setFields(prescription)
    setDrugs(prescription.drugs || [])
  }, [prescription])

  const handleDownloadImage = async () => {
    if (!printRef.current) return

    const canvas = await html2canvas(printRef.current, { scale: 2 })
    const imgData = canvas.toDataURL("image/png")

    const link = document.createElement("a")
    link.href = imgData
    link.download = `${fields.patientFirstName}_${fields.patientLastName}_Prescription.png`
    link.click()
    updateLog()
  }

  return (
    <div className="flex flex-col gap-4">
     
      <div
        ref={printRef}
        className="p-8 bg-white border border-gray-300 shadow-lg w-full max-w-4xl h-[80vh] mx-auto font-serif text-black overflow-y-auto"
      >
        <div className="text-center py-3 border-b border-gray-400">
          <h1 className="text-xl font-bold uppercase">Medical Prescription</h1>
        </div>

        <div className="flex justify-between mb-4">
          <div>
            <span className="font-semibold">Name: </span>
            <span className="underline">
              {fields.patientFirstName} {fields.patientLastName}
            </span>
          </div>
          <div>
            <span className="font-semibold">Age/Sex: </span>
            <span className="underline">{fields.patientAge} / {fields.patientGender}</span>
          </div>
        </div>

        <div className="flex justify-between mb-4">
          <div>
            <span className="font-semibold">Address: </span>
            <span className="underline">{fields.patientAddress}</span>
          </div>
          <div>
            <span className="font-semibold">Date: </span>
            <span className="underline">{fields.createdAt}</span>
          </div>
        </div>

    
        <div className="text-4xl font-bold mb-6">Px</div>

     
        <div className="mb-4">
          <div>
            <span className="font-semibold">Diagnosis: </span>
            <span>{fields.diagnosis}</span>
          </div>
          <div>
            <span className="font-semibold">Examination: </span>
            <span>{fields.examination}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="font-semibold mb-2">Prescribed Drugs:</div>
          <ul className="list-disc list-inside space-y-1">
            {Array.isArray(drugs) && drugs.length > 0 ? (
              drugs.map((drug, i) => (
                <li key={i}>
                  {drug.medicine} — {drug.dosage} {drug.unit}
                </li>
              ))
            ) : (
              <li>No prescribed drugs</li>
            )}
          </ul>
        </div>

        {/* Recommendation */}
        <div className="mb-12">
          <div className="font-semibold mb-1">Recommendation:</div>
          <div>{fields.recommendation}</div>
        </div>

       
        <div className="flex justify-end mt-8">
          <div className="text-center">
            <div className="border-t border-black w-32"></div>
            <div>Dr. {fields.addedBy}</div>
            <div>{fields.field}</div>
           
            <div>100-234-1431</div>
          </div>
        </div>
      </div>

    
      <div className="flex justify-center mt-4">
        <Button onClick={handleDownloadImage} className="!bg-blue-600 !text-white">
          Download as Image
        </Button>
      </div>
    </div>
  )
}
