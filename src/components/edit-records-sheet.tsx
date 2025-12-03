import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Patient } from "./medical_records";
import { ref, update, get, push } from "firebase/database";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/auth/authprovider";
import { toast } from "sonner";
import { motion } from "framer-motion";

type EditRecordsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
};

export function EditRecordsSheet({
  open,
  onOpenChange,
  patient,
}: EditRecordsSheetProps) {
  const { user } = useAuth();
  const [fields, setFields] = useState(patient);

  useEffect(() => {
    if (patient) {
      setFields(patient);
    }
  }, [patient]);

  const handleChange = (key: keyof Patient, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const updateRecords = async () => {
    if (!fields.id) {
      toast.error("Invalid patient record.");
      return;
    }

    const patientRef = ref(db, `patients/${fields.id}`);
    const patientHistoryRef = ref(db, `patients/${fields.id}/medicalHistory`);

    const snapshot = await get(patientRef);
    const currentPatient = snapshot.val();
    console.log("Current patient: ", currentPatient);
    const { medicalHistory, ...oldHistory } = currentPatient || {};
    await update(patientRef, {
      ...fields,
      updatedBy: user?.uid || "",
      updatedAt: Date.now(),
    });
    await push(patientHistoryRef, {
      ...oldHistory,
      savedAt: Date.now(),
    });

    toast.success("Patient record updated successfully.");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto !w-[75vw] !max-w-none p-10 bg-gradient-to-br from-blue-50 to-blue-100">
        <SheetClose
          className="absolute top-6 right-6 flex items-center justify-center rounded-full p-2.5
                     !bg-red-500/90 hover:bg-red-600 transition-all duration-200 text-white "
        >
          <X className="w-5 h-5" />
        </SheetClose>

        <SheetHeader className="mb-6 text-center">
          <SheetTitle className="text-3xl font-bold text-blue-900 tracking-tight">
            Edit Patient Record
          </SheetTitle>
          <SheetDescription className="text-lg text-gray-600">
            Update the patient’s details and vital signs.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="basic">
              <AccordionTrigger className="!bg-[#00a896]  text-white !text-xl px-4 py-3 rounded-lg transition-all">
                Basic Details
              </AccordionTrigger>
              <AccordionContent className="mt-4 !bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["firstName", "First Name"],
                    ["lastName", "Last Name"],
                    ["gender", "Gender"],
                    ["age", "Age"],
                    ["telephone", "Contact Number"],
                    ["address", "Address"],
                  ].map(([key, label]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid gap-2"
                    >
                      <Label className="!text-lg font-semibold text-gray-700">
                        {label}
                      </Label>
                      <Input
                        className="h-12 !text-lg px-4 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                        placeholder={`Enter ${label.toLowerCase()}`}
                        value={fields[key as keyof Patient] || ""}
                        onChange={(e) =>
                          handleChange(key as keyof Patient, e.target.value)
                        }
                      />
                    </motion.div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="vitals">
              <AccordionTrigger className="!bg-[#00a896] text-white !text-xl px-4 py-3 rounded-lg transition-all">
                Vital Signs
              </AccordionTrigger>
              <AccordionContent className="mt-4 bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["bloodPressure", "Blood Pressure"],
                    ["heartRate", "Heart Rate"],
                    ["respiratoryRate", "Respiratory Rate"],
                    ["temperature", "Temperature"],
                    ["oxygenSaturation", "Oxygen Saturation"],
                  ].map(([key, label]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid gap-2"
                    >
                      <Label className="!text-lg font-semibold text-gray-700">
                        {label}
                      </Label>
                      <Input
                        className="h-12 !text-lg px-4 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                        placeholder={`Enter ${label.toLowerCase()}`}
                        value={fields[key as keyof Patient] || ""}
                        onChange={(e) =>
                          handleChange(key as keyof Patient, e.target.value)
                        }
                      />
                    </motion.div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <SheetFooter className="mt-10">
          <div className="flex justify-center w-full">
            <Button
              type="button"
              onClick={updateRecords}
              className="!bg-orange-400"
            >
              Save Changes
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
