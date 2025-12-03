import * as React from "react";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ChevronDownIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/firebaseConfig";
import { ref, set, push, remove, onValue, get } from "firebase/database";
import { useAuth } from "@/auth/authprovider";

export function AddRecords() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const initialState = {
    patientFirstName: "",
    patientLastName: "",
    patientGender: "",
    patientAge: "",
    patientSymptoms: "",
    patientBirthdate: "",
    patientTelephone: "",
    patientAddress: "",
    patientBloodPressure: "",
    patientHeartRate: "",
    patientRespiratoryRate: "",
    patientTemperature: "",
    patientOxygenSaturation: "",
  };

  const [fields, setFields] = useState(initialState);
  const [openSections, setOpenSections] = useState<string[]>(["basic"]);
  const [isLoading, setIsLoading] = useState(false);
  const [patientDiagnosis, setDiagnosis] = useState([
    { diagnosis: "", severity: "", notes: "" },
  ]);
  const [linkedUsers, setLinkedUsers] = React.useState<any[]>([]);
  const [selectedLinkedUser, setSelectedLinkedUser] = React.useState("");

  React.useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, async (snapshot) => {
      const userData = snapshot.val();
      if (!userData) return;

      let linkedUserIds: string[] = [];

      if (user.type?.toLowerCase() === "secretary") {
        // Secretary: get linked doctors
        linkedUserIds = userData.doctors || [];
      } else if (user.type?.toLowerCase() === "doctor") {
        // Doctor: get linked secretaries
        linkedUserIds = userData.secretaries || [];
      }

      // Fetch details of linked users
      const linkedUsersPromises = linkedUserIds.map(async (userId: string) => {
        const linkedUserRef = ref(db, `users/${userId}`);
        const linkedUserSnap = await get(linkedUserRef);
        if (linkedUserSnap.exists()) {
          return { id: userId, ...linkedUserSnap.val() };
        }
        return null;
      });

      const linkedUsersData = await Promise.all(linkedUsersPromises);
      setLinkedUsers(linkedUsersData.filter(Boolean));
    });

    return () => unsubscribe();
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddDiagnosis = () =>
    setDiagnosis([
      ...patientDiagnosis,
      { diagnosis: "", severity: "", notes: "" },
    ]);

  const handleRemoveDiagnosis = (index: number) =>
    setDiagnosis(patientDiagnosis.filter((_, i) => i !== index));

  const handleDiagnosisChange = (
    index: number,
    key: "diagnosis" | "severity" | "notes",
    value: string
  ) => {
    const updated = [...patientDiagnosis];
    updated[index][key] = value;
    setDiagnosis(updated);
  };

  const addRecords = async () => {
    if (
      !fields.patientFirstName ||
      !fields.patientLastName ||
      !fields.patientGender ||
      !fields.patientAge
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const logsRef = ref(db, "logs/");
      const patientsRef = ref(db, "patients");
      const patient = push(patientsRef);
      const newLog = push(logsRef);

      let sharedWith = [user?.uid];

      if (selectedLinkedUser) {
        sharedWith.push(selectedLinkedUser);
      }
      await set(patient, {
        patientId: patient.key,
        firstName: fields.patientFirstName,
        lastName: fields.patientLastName,
        gender: fields.patientGender,
        age: fields.patientAge,
        birthdate: date ? date.toISOString().split("T")[0] : null,
        telephone: fields.patientTelephone,
        address: fields.patientAddress,
        diagnosis: patientDiagnosis,
        bloodPressure: fields.patientBloodPressure,
        heartRate: fields.patientHeartRate,
        respiratoryRate: fields.patientRespiratoryRate,
        temperature: fields.patientTemperature,
        oxygenSaturation: fields.patientOxygenSaturation,
        addedBy: user?.email,
        createdBy: user?.uid,
        createdAt: Date.now(),
        sharedWith: sharedWith,
      });

      await set(newLog, {
        medicalRecordLog: `Medical Record added by ${user?.firstName} ${user?.lastName} `,
        logTime: new Date().toLocaleString(),
      });

      setFields(initialState);
      setSelectedLinkedUser("");
      setOpenSections(["basic"]);

      toast.success("Record has been added successfully!");
    } catch (error) {
      console.error("Error adding record:", error);
      toast.error("Failed to add record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const userIsAdmin = user?.type?.toLowerCase() === "admin";
  const userIsSecretary = user?.type?.toLowerCase() === "secretary";
  const userIsDoctor = user?.type?.toLowerCase() === "doctor";

  return (
    <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-10">
      <h1 className="text-2xl md:text-3xl font-semibold text-center text-orange-500 mb-6 md:mb-8">
        Add New Patient Record
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addRecords();
        }}
        className="space-y-6 md:space-y-8"
      >
        <Accordion
          type="multiple"
          className="w-full space-y-4"
          value={openSections}
          onValueChange={setOpenSections}
        >
          <AccordionItem value="basic">
            <AccordionTrigger className="!text-xl md:!text-2xl !font-semibold !bg-[#00a896] !text-white rounded-lg md:rounded-xl px-4 py-3">
              Basic Details
            </AccordionTrigger>
            <AccordionContent className="mt-4 md:mt-6 space-y-4 md:space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-lg md:text-xl font-medium">
                    First Name{" "}
                  </Label>
                  <Input
                    className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="Enter first name"
                    value={fields.patientFirstName}
                    onChange={(e) =>
                      handleChange("patientFirstName", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="text-lg md:text-xl font-medium">
                    Last Name{" "}
                  </Label>
                  <Input
                    className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="Enter last name"
                    value={fields.patientLastName}
                    onChange={(e) =>
                      handleChange("patientLastName", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-lg md:text-xl font-medium">
                    Gender{" "}
                  </Label>
                  <Select
                    value={fields.patientGender}
                    onValueChange={(value) =>
                      handleChange("patientGender", value)
                    }
                  >
                    <SelectTrigger className="!bg-[#00a896] !text-base md:!text-lg h-12 md:h-14 !text-white">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-lg md:text-xl font-medium">Age </Label>
                  <Input
                    type="number"
                    className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="Enter age"
                    value={fields.patientAge}
                    onChange={(e) => handleChange("patientAge", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label className="text-lg md:text-xl font-medium">
                    Date of Birth{" "}
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-48 justify-between font-normal !bg-[#00a896] !text-white"
                      >
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0 !bg-blue-400"
                      align="start"
                    >
                      <Calendar
                        className="!bg-white !text-black "
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setDate(date);
                          setOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label className="text-lg md:text-xl font-medium">
                    Contact Number
                  </Label>
                  <Input
                    type="text"
                    className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="Enter contact number"
                    value={fields.patientTelephone}
                    onChange={(e) =>
                      handleChange("patientTelephone", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="text-lg md:text-xl font-medium">
                    Address
                  </Label>
                  <Input
                    type="text"
                    className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="Enter address"
                    value={fields.patientAddress}
                    onChange={(e) =>
                      handleChange("patientAddress", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="text-lg md:text-xl font-medium">
                    Symptoms
                  </Label>
                  <Input
                    type="text"
                    className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="Enter possible symptoms"
                    value={fields.patientSymptoms}
                    onChange={(e) =>
                      handleChange("patientSymptoms", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label className="text-lg md:text-xl font-medium">
                    Diagnosis
                  </Label>
                  {patientDiagnosis.map((diagnosis, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Input
                        type="text"
                        placeholder={`Diagnosis ` + (index + 1)}
                        value={diagnosis.diagnosis}
                        onChange={(e) =>
                          handleDiagnosisChange(
                            index,
                            "diagnosis",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        type="text"
                        placeholder={`Severity ` + (index + 1)}
                        value={diagnosis.severity}
                        onChange={(e) =>
                          handleDiagnosisChange(
                            index,
                            "severity",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        type="text"
                        placeholder={`Notes ` + (index + 1)}
                        value={diagnosis.notes}
                        onChange={(e) =>
                          handleDiagnosisChange(index, "notes", e.target.value)
                        }
                      />

                      {patientDiagnosis.length > 1 && (
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
                    Add more diagnoses
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* VITAL SIGNS */}
          <AccordionItem value="vitals">
            <AccordionTrigger className="!text-xl md:!text-2xl !font-semibold !bg-[#00a896] !text-white rounded-lg md:rounded-xl px-4 py-3">
              Vital Signs
            </AccordionTrigger>
            <AccordionContent className="mt-4 md:mt-6 space-y-4 md:space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Blood Pressure", "patientBloodPressure"],
                  ["Heart Rate", "patientHeartRate"],
                  ["Respiratory Rate", "patientRespiratoryRate"],
                  ["Temperature", "patientTemperature"],
                  ["Oxygen Saturation", "patientOxygenSaturation"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <Label className="text-lg md:text-xl font-medium">
                      {label}
                    </Label>
                    <Input
                      type="text"
                      className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                      placeholder={`Enter ${label.toLowerCase()}`}
                      value={(fields as any)[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {!userIsAdmin && linkedUsers.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Label className="text-lg md:text-xl font-medium text-blue-800 mb-2">
              {userIsSecretary && "Share with Doctor"}
              {userIsDoctor && "Share with Secretary"}
            </Label>
            <Select
              value={selectedLinkedUser}
              onValueChange={setSelectedLinkedUser}
            >
              <SelectTrigger className="!bg-white !text-base md:!text-lg h-12 md:h-14 border-blue-300">
                <SelectValue
                  placeholder={`Select a ${
                    userIsSecretary ? "doctor" : "secretary"
                  } to share this record with`}
                />
              </SelectTrigger>
              <SelectContent>
                {linkedUsers.map((linkedUser) => (
                  <SelectItem key={linkedUser.id} value={linkedUser.id}>
                    {linkedUser.firstName} {linkedUser.lastName}
                    {linkedUser.field && ` - ${linkedUser.field}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-center mt-8 md:mt-10">
          <Button
            type="submit"
            disabled={isLoading}
            className="!bg-orange-400 hover:!bg-orange-500 !text-white !px-8 md:!px-10 !py-4 md:!py-6 !text-xl md:!text-2xl rounded-lg md:rounded-xl transition-all disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Record"}
          </Button>
        </div>
      </form>
    </div>
  );
}
