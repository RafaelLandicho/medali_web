"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ref, update,push,set } from "firebase/database"
import { db } from "@/firebaseConfig"
import { useAuth } from "@/auth/authprovider"
import { toast } from "sonner"
import type { Prescription } from "./view-prescriptions"

type EditPrescriptionProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prescription: Prescription
}

export function EditPrescription({ prescription, onOpenChange }: EditPrescriptionProps) {
  const { user } = useAuth()
  const [fields, setFields] = useState(prescription)
  const [drugs, setDrugs] = useState(prescription.drugs || [])

  useEffect(() => {
    setFields(prescription)
    setDrugs(prescription.drugs || [])
  }, [prescription])

  const handleChange = (key: keyof Prescription, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }))

  const handleDrugChange = (index: number, key: keyof (typeof drugs)[0], value: string) => {
    const updated = [...drugs]
    updated[index][key] = value
    setDrugs(updated)
  }

  const addDrug = () => setDrugs([...drugs, { medicine: "", dosage: "", unit: "" }])
  const removeDrug = (index: number) => setDrugs(drugs.filter((_, i) => i !== index))

  const updatePrescription = async () => {

    const logsRef = ref(db,'logs/')
    const newLog = push(logsRef)
    if (!fields.id) {
      toast.error("Prescription record missing ID.")
      return
    }

    await update(ref(db, `prescriptions/${fields.id}`), {
      diagnosis: fields.diagnosis,
      examination: fields.examination,
      recommendation: fields.recommendation,
      drugs,
      updatedBy: user?.uid,
      updatedAt: Date.now(),
    })

    await set(newLog,{
        prescriptionLog:`Prescription updated by ${user?.firstName} ${user?.lastName} `,
        logTime: new Date().toLocaleString(),
      })

    toast.success("Prescription updated.")
    onOpenChange(false)
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        updatePrescription()
      }}
    >
      <div>
        <Label>Diagnosis</Label>
        <Input
          value={fields.diagnosis}
          onChange={(e) => handleChange("diagnosis", e.target.value)}
        />
      </div>

      <div>
        <Label>Drugs</Label>
        {drugs.map((drug, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              placeholder="Medicine"
              value={drug.medicine}
              onChange={(e) => handleDrugChange(index, "medicine", e.target.value)}
            />
            <Input
              placeholder="Dosage"
              value={drug.dosage}
              onChange={(e) => handleDrugChange(index, "dosage", e.target.value)}
            />
            <Input
              placeholder="Unit"
              value={drug.unit}
              onChange={(e) => handleDrugChange(index, "unit", e.target.value)}
            />
            {drugs.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeDrug(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="!bg-blue-500 !text-white"
          onClick={addDrug}
        >
          + Add Drug
        </Button>
      </div>

      <div>
        <Label>Examination</Label>
        <Input
          value={fields.examination}
          onChange={(e) => handleChange("examination", e.target.value)}
        />
      </div>

      <div>
        <Label>Recommendation</Label>
        <Input
          value={fields.recommendation}
          onChange={(e) => handleChange("recommendation", e.target.value)}
        />
      </div>

      <Button type="submit" className="!bg-blue-500 !text-white mt-4">
        Save Changes
      </Button>
    </form>
  )
}
