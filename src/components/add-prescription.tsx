import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { ref, push, set } from "firebase/database";
import { useAuth } from "@/auth/authprovider";

export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  field: string;
  medicalId: string;
  type: string;
  email: string;
  requestedBy?: string[];
  requestedTo?: string[];
  uid?: string;
};

type AddPrescriptionProps = {
  patient: {
    patientId: string;
    firstName: string;
    lastName: string;
    gender?: string;
    age?: number;
    address: string;
    patientDiagnosis: {
      diagnosis: string;
      severity: string;
      notes: string;
    }[];
  };
};

export function AddPrescription({ patient }: AddPrescriptionProps) {
  const { user } = useAuth();

  const [prescriptions, setPrescriptions] = useState([
    { medicine: "", unit: "", dosage: "" },
  ]);
  const [diagnosisPres, setDiagnosisPres] = useState<
    { diagnosis: string; severity: string; notes: string }[]
  >([]);

  useEffect(() => {
    console.log("FULL PATIENT:", patient);

    if (patient) {
      console.log("Loaded patient:", patient);
      console.log(patient.patientDiagnosis);
      if (patient.patientDiagnosis && patient.patientDiagnosis.length > 0) {
        setDiagnosisPres(
          patient.patientDiagnosis.map((d) => ({
            diagnosis: d.diagnosis,
            severity: d.severity,
            notes: d.notes,
          }))
        );
      } else {
        setDiagnosisPres([{ diagnosis: "", severity: "", notes: "" }]);
      }
    }
  }, [patient]);

  const [fields, setFields] = useState({
    patientDiagnosis: "",
    patientExamination: "",
    patientRecommendation: "",
    dateIssued: "",
  });

  const handleChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddPrescription = () =>
    setPrescriptions([
      ...prescriptions,
      { medicine: "", unit: "", dosage: "" },
    ]);
  const handleRemovePrescription = (index: number) =>
    setPrescriptions(prescriptions.filter((_, i) => i !== index));

  const handlePrescriptionChange = (
    index: number,
    key: "medicine" | "unit" | "dosage",
    value: string
  ) => {
    const updated = [...prescriptions];
    updated[index][key] = value;
    setPrescriptions(updated);
  };

  const handleAddDiagnosis = () =>
    setDiagnosisPres([
      ...diagnosisPres,
      { diagnosis: "", severity: "", notes: "" },
    ]);
  const handleRemoveDiagnosis = (index: number) =>
    setDiagnosisPres(diagnosisPres.filter((_, i) => i !== index));

  const handleDiagnosisChange = (
    index: number,
    key: "diagnosis" | "severity" | "notes",
    value: string
  ) => {
    const updated = [...diagnosisPres];
    updated[index][key] = value;
    setDiagnosisPres(updated);
  };

  const addPrescription = async () => {
    try {
      const logsRef = ref(db, "logs/");
      const prescriptionsRef = ref(db, `prescriptions/`);
      const newPrescription = push(prescriptionsRef);
      const newLog = push(logsRef);

      await set(newPrescription, {
        patientFirstName: patient.firstName,
        patientLastName: patient.lastName,
        patientAddress: patient.address,
        patientAge: patient.age,
        patientGender: patient.gender,
        prescriptionId: newPrescription.key,
        diagnosis: diagnosisPres,
        examination: fields.patientExamination,
        recommendation: fields.patientRecommendation,
        drugs: prescriptions,
        addedBy: `${user?.firstName} ${user?.lastName}`,
        field: user?.field,
        doctorId: user?.medicalId,
        createdBy: user?.uid,
        createdAt: new Date().toLocaleString(),
      });

      await set(newLog, {
        prescriptionLog: `Prescription added by ${user?.firstName} ${user?.lastName} `,
        logTime: new Date().toLocaleString(),
      });

      toast.success(`Prescription added for ${patient.firstName}`);
      console.log("prescription added");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add prescription");
    }
  };

  return (
    <div className="w-screen max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addPrescription();
        }}
      >
        <FieldGroup>
          <FieldSet>
            <h3 className="font-semibold mb-2">
              Prescription for {patient.firstName} {patient.lastName}
            </h3>

            <Field>
              <FieldLabel>Diagnosis</FieldLabel>

              {diagnosisPres.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 mb-3 border p-3 rounded"
                >
                  <Input
                    type="text"
                    placeholder="Diagnosis"
                    value={item.diagnosis}
                    onChange={(e) =>
                      handleDiagnosisChange(index, "diagnosis", e.target.value)
                    }
                  />

                  <Input
                    type="text"
                    placeholder="Severity"
                    value={item.severity}
                    onChange={(e) =>
                      handleDiagnosisChange(index, "severity", e.target.value)
                    }
                  />

                  <Input
                    type="text"
                    placeholder="Notes"
                    value={item.notes}
                    onChange={(e) =>
                      handleDiagnosisChange(index, "notes", e.target.value)
                    }
                  />

                  {diagnosisPres.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleRemoveDiagnosis(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="!bg-[#00a896] !text-white"
                onClick={handleAddDiagnosis}
              >
                +
              </Button>
            </Field>

            <Field>
              <FieldLabel>Drug Prescriptions</FieldLabel>
              {prescriptions.map((drug, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder={`Medicine`}
                    value={drug.medicine}
                    onChange={(e) =>
                      handlePrescriptionChange(
                        index,
                        "medicine",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    type="text"
                    placeholder={`Unit`}
                    value={drug.unit}
                    onChange={(e) =>
                      handlePrescriptionChange(index, "unit", e.target.value)
                    }
                  />
                  <Input
                    type="text"
                    placeholder={`Dosage`}
                    value={drug.dosage}
                    onChange={(e) =>
                      handlePrescriptionChange(index, "dosage", e.target.value)
                    }
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
                className="!bg-[#00a896] !text-white"
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
                onChange={(e) =>
                  handleChange("patientExamination", e.target.value)
                }
              />
            </Field>

            <Field>
              <FieldLabel>Recommendations</FieldLabel>
              <Input
                type="text"
                value={fields.patientRecommendation}
                onChange={(e) =>
                  handleChange("patientRecommendation", e.target.value)
                }
              />
            </Field>

            <Field>
              <Button type="submit" className="!bg-[#00a896] !text-white mt-4">
                Save Prescription
              </Button>
            </Field>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
