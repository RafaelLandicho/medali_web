import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { db } from "@/firebaseConfig"
import { ref, push, set } from "firebase/database"
import { useAuth } from "@/auth/authprovider"


export type User = {
  id: string
  username: string
  firstName: string
  lastName: string
  field: string
  medicalId: string
  type: string
  email: string
  requestedBy?: string[]
  requestedTo?: string[]
  uid?: string
}

type AddPrescriptionProps = {
  patient: {
    patientId: string
    firstName: string
    lastName: string
    gender?: string
    age?: number
    address: string
   
  }
}

export function AddPrescription({ patient }: AddPrescriptionProps) {
  const { user } = useAuth()

  const [fields, setFields] = useState({
    patientDiagnosis: "",
    patientExamination: "",
    patientRecommendation: "",
    dateIssued:""
  })

  const [prescriptions, setPrescriptions] = useState([{ medicine: "", unit: "", dosage: "" }])

 
  useEffect(() => {
    if (patient) {
      console.log("Loaded patient:", patient)
    }
  }, [patient])

  const handleChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddPrescription = () => setPrescriptions([...prescriptions, { medicine: "", unit: "", dosage: "" }])
  const handleRemovePrescription = (index: number) =>
    setPrescriptions(prescriptions.filter((_, i) => i !== index))



  const handlePrescriptionChange = (index: number, key: "medicine" | "unit" | "dosage", value: string) => {
    const updated = [...prescriptions]
    updated[index][key] = value
    setPrescriptions(updated)
  }

  const addPrescription = async () => {
    try {
      const logsRef = ref(db,'logs/')
      const prescriptionsRef = ref(db, `prescriptions/`)
      const newPrescription = push(prescriptionsRef)
      const newLog = push(logsRef)

      await set(newPrescription, {
        patientFirstName:patient.firstName,
        patientLastName: patient.lastName,
        patientAddress: patient.address,
        patientAge: patient.age, 
        patientGender: patient.gender,
        prescriptionId: newPrescription.key,
        diagnosis: fields.patientDiagnosis,
        examination: fields.patientExamination,
        recommendation: fields.patientRecommendation,
        drugs: prescriptions,
        addedBy: `${user?.firstName} ${user?.lastName}`,
        field:user?.field,
        createdBy: user?.uid,
        createdAt: new Date().toLocaleString(),
      })

      await set(newLog,{
        prescriptionLog:`Prescription added by ${user?.firstName} ${user?.lastName} `,
        logTime: new Date().toLocaleString(),
      })
      
      toast.success(`Prescription added for ${patient.firstName}`)
      console.log("prescription added")
    } catch (error) {
      console.error(error)
      toast.error("Failed to add prescription")
    }
  }

  return (
    <div className="w-screen max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addPrescription()
        }}
      >
        <FieldGroup>
          <FieldSet>
            <h3 className="font-semibold mb-2">
              Prescription for {patient.firstName} {patient.lastName}
            </h3>

            <Field>
              <FieldLabel>Diagnosis</FieldLabel>
              <Input
                type="text"
                value={fields.patientDiagnosis}
                onChange={(e) => handleChange("patientDiagnosis", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Drug Prescriptions</FieldLabel>
              {prescriptions.map((drug, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder={`Medicine`}
                    value={drug.medicine}
                    onChange={(e) => handlePrescriptionChange(index, "medicine", e.target.value)}
                  />
                   <Input
                    type="text"
                    placeholder={`Unit`}
                    value={drug.unit}
                    onChange={(e) => handlePrescriptionChange(index, "unit", e.target.value)}
                  />
                   <Input
                    type="text"
                    placeholder={`Dosage`}
                    value={drug.dosage}
                    onChange={(e) => handlePrescriptionChange(index, "dosage", e.target.value)}
                  />
                  {prescriptions.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleRemovePrescription(index)}
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
                onClick={handleAddPrescription}
              >
                   + 
              </Button>
            </Field>

            <Field>
              <FieldLabel>Examination</FieldLabel>
              <Input
                type="text"
                value={fields.patientExamination}
                onChange={(e) => handleChange("patientExamination", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Recommendations</FieldLabel>
              <Input
                type="text"
                value={fields.patientRecommendation}
                onChange={(e) => handleChange("patientRecommendation", e.target.value)}
              />
            </Field>

            <Field>
              <Button type="submit" className="!bg-blue-500 !text-white mt-4">
                Save Prescription
              </Button>
            </Field>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  )
}
