import { 
  Bar, BarChart, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid,
  Area, AreaChart
} from "recharts"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDownIcon, ChevronLeft,ChevronRight } from "lucide-react"
import { Calendar } from "./ui/calendar"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import * as React from "react"
import { db } from "@/firebaseConfig"
import { useAuth } from "@/auth/authprovider"
import { ref, onValue } from "firebase/database"
import { useIsMobile } from "@/hooks/use-mobile"

const COLORS = ["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"]

export function Analytics() {
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
  const [openStart, setOpenStart] = React.useState(false)
  
  const [openEnd, setOpenEnd] = React.useState(false)
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const [topdPrescription, setTopdPrescription] = React.useState<{ diagnosis: string; count: number }[]>([])
  const [topdPatient, setTopdPatient] = React.useState<{ diagnosis: string; count: number }[]>([])
  const [topdDage, setTopdAge] = React.useState<{ age: string; count: number }[]>([])
  const [topdDageInfant, setTopdAgeInfant] = React.useState<{ diagnosis: string; count: number }[]>([])
  const [topdDageTeen, setTopdAgeTeen] = React.useState<{ diagnosis: string; count: number }[]>([])
  const [topdDageAdult, setTopdAgeAdult] = React.useState<{ diagnosis: string; count: number }[]>([])
  const [topdDageMiddleAge, setTopdAgeMiddleAge] = React.useState<{ diagnosis: string; count: number }[]>([])
  const [topdDageSenior, setTopdAgeSenior] = React.useState<{ diagnosis: string; count: number }[]>([])
  const [topdGender, setTopdGender] = React.useState<{ gender: string; count: number }[]>([])
  const [topdMale, setTopdMale] = React.useState<{ diagnosis: string; count: number }[]>([])
  const [topdFemale, setTopdFemale] = React.useState<{ diagnosis: string; count: number }[]>([])
  const [topdDrugs, setTopdDrugs] = React.useState<{ drug: string; count: number }[]>([]) 

  const isMobile = useIsMobile()
  
  React.useEffect(() => {
    if (!user) return

    const prescriptionRef = ref(db, "prescriptions")
    const unsub = onValue(prescriptionRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) return setLoading(false)

      const arr = Object.values(data) as any[]
     

      let filtered = arr
      if (startDate) filtered = filtered.filter((p) => new Date(p.createdAt) >= startDate)
      if (endDate) filtered = filtered.filter((p) => new Date(p.createdAt) <= endDate)
      const countMap: Record<string, number> = {}
      console.log(filtered)
      filtered.forEach((p) => {
        if (p?.diagnosis) {
          const diag = String(p.diagnosis).trim()
          countMap[diag] = (countMap[diag] || 0) + 1
        }
      })

      const sorted = Object.entries(countMap)
        .map(([diagnosis, count]) => ({ diagnosis, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      

      setTopdPrescription(sorted)
      setLoading(false)
    })
    return () => unsub()
  }, [user,startDate, endDate])

  
  React.useEffect(() => {
    if (!user) return

    const prescriptionRef = ref(db, "prescriptions")
    const unsub = onValue(prescriptionRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) return setTopdDrugs([])

      const arr = Object.values(data) as any[]

      let filtered = arr
      if (startDate) filtered = filtered.filter((p) => new Date(p.createdAt) >= startDate)
      if (endDate) filtered = filtered.filter((p) => new Date(p.createdAt) <= endDate)
      const countMap: Record<string, number> = {}
      

      filtered.forEach((p) => {
        if (Array.isArray(p?.drugs)) {
          p.drugs.forEach((d: { medicine: string }) => {
            const name = d.medicine.trim()
            countMap[name] = (countMap[name] || 0) + 1
          })
        }
      })
      console.log("Diagnosis counts:", countMap)
      console.log(filtered)

      const firstSort = Object.entries(countMap)
        .map(([drug, count]) => ({ drug, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const sortedForGraph = firstSort.sort((a, b) => a.count - b.count)

      setTopdDrugs(sortedForGraph)
    })
    return () => unsub()
  }, [user,startDate, endDate])

  
  React.useEffect(() => {
    if (!user) return

    const patientRef = ref(db, "patients")
    const unsub = onValue(patientRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) return

      const arr = Object.values(data) as any[]

     let filtered = arr
     if (startDate) filtered = filtered.filter((p) => new Date(p.createdAt) >= startDate)
     if (endDate) filtered = filtered.filter((p) => new Date(p.createdAt) <= endDate)
      const countMap: Record<string, number> = {}
      console.log(filtered)
      filtered.forEach((p) => {
        if (p?.diagnosis) {
          countMap[p.diagnosis] = (countMap[p.diagnosis] || 0) + 1
        }
      })

      const sorted = Object.entries(countMap)
        .map(([diagnosis, count]) => ({ diagnosis, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setTopdPatient(sorted)
    })
    return () => unsub()
  }, [user,startDate, endDate])


  React.useEffect(() => {
    if (!user) return

    const patientRef = ref(db, "patients")
    const unsub = onValue(patientRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) return
      const arr = Object.values(data) as any[]
    

     let filtered = arr 
     if (startDate) filtered = filtered.filter((p) => new Date(p.createdAt) >= startDate)
     if (endDate) filtered = filtered.filter((p) => new Date(p.createdAt) <= endDate)

      const countMap: Record<string, number> = {}     
      console.log(filtered)
      filtered.forEach((p) => {
        if (p?.age) {
          countMap[p.age] = (countMap[p.age] || 0) + 1
        }
      })

      const sorted = Object.entries(countMap)
        .map(([age, count]) => ({ age, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
     
      setTopdAge(sorted)

      const infantMap: Record<string, number> = {};
      const teenMap: Record<string, number> = {};
      const adultMap: Record<string, number> = {};
      const middleMap: Record<string, number> = {};
      const seniorMap: Record<string, number> = {};

      const getAgeGroup = (age: number) => {
        if (age <= 1) return "infant";
        if (age <= 12) return "child";      
        if (age <= 20) return "teen";
        if (age <= 44) return "adult";
        if (age <= 64) return "middle";
        return "senior";
      };
      filtered.forEach((p) => {
      if (!p?.age || !p?.diagnosis) return;

      const age = Number(p.age);
      const group = getAgeGroup(age);

      switch (group) {
        case "infant":
          infantMap[p.diagnosis] = (infantMap[p.diagnosis] || 0) + 1;
          break;
        case "teen":
          teenMap[p.diagnosis] = (teenMap[p.diagnosis] || 0) + 1;
          break;
        case "adult":
          adultMap[p.diagnosis] = (adultMap[p.diagnosis] || 0) + 1;
          break;
        case "middle":
          middleMap[p.diagnosis] = (middleMap[p.diagnosis] || 0) + 1;
          break;
        case "senior":
          seniorMap[p.diagnosis] = (seniorMap[p.diagnosis] || 0) + 1;
          break;
      }
    });

    const convert = (map: Record<string, number>) => {
      return Object.entries(map)
        .map(([diagnosis, count]) => ({ diagnosis, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    };

    setTopdAgeInfant(convert(infantMap));
    setTopdAgeTeen(convert(teenMap));
    setTopdAgeAdult(convert(adultMap));
    setTopdAgeMiddleAge(convert(middleMap));
    setTopdAgeSenior(convert(seniorMap));
    })
    return () => unsub()
  }, [user,startDate, endDate])

  React.useEffect(() => {
    if (!user) return

    const patientRef = ref(db, "patients")
    const unsub = onValue(patientRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) return
      const arr = Object.values(data) as any[]
    

     let filtered = arr 
     if (startDate) filtered = filtered.filter((p) => new Date(p.createdAt) >= startDate)
     if (endDate) filtered = filtered.filter((p) => new Date(p.createdAt) <= endDate)

      const countMap: Record<string, number> = {}     
      console.log(filtered)
      filtered.forEach((p) => {
        if (p?.gender) {
          const gender = String(p.gender).trim().toLowerCase();
          countMap[p.gender] = (countMap[p.gender] || 0) + 1
        }
      })

      const sorted = Object.entries(countMap)

        .map(([gender, count]) => ({ gender, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
     
      setTopdGender(sorted)

      const maleMap: Record<string, number> = {};
      const femalMap: Record<string, number> = {};
      

      const getGenderGroup = (gender: string) => {
        if (gender === "male") return "male";
        else return "female";
      };
      filtered.forEach((p) => {
      if (!p?.gender || !p?.diagnosis) return;

      const gender = String(p.gender).trim().toLowerCase();
      const group = getGenderGroup(gender);

      switch (group) {
        case "male":
          maleMap[p.diagnosis] = (maleMap[p.diagnosis] || 0) + 1;
          break;
        case "female":
          femalMap[p.diagnosis] = (femalMap[p.diagnosis] || 0) + 1;
          break;
      }
    });

    const convert = (map: Record<string, number>) => {
      return Object.entries(map)
        .map(([diagnosis, count]) => ({ diagnosis, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    };

    setTopdMale(convert(maleMap));
    setTopdFemale(convert(femalMap));
    })
    return () => unsub()
  }, [user,startDate, endDate])

  if (loading) return <div>Loading...</div>

  if(!isMobile){
    return (
    <div className="p-4 w-full space-y-10">
      <div className="flex flex-row items-start  gap-4 w-full">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <Card  className="w-full p-5">
            <CardHeader className=" text-3xl flex flex-col items-stretch border-b !p-0 sm:flex-row">Analysis Reports</CardHeader>
              <CardDescription className="text-l items-start">Showing reports for the medical records and prescriptions</CardDescription>
          </Card>
        </div>
        
        <Card className="p-4">
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col">
              <Label className="text-lg md:text-xl font-medium">Start Date</Label>
              <Popover open={openStart} onOpenChange={setOpenStart}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-48 justify-between font-normal !bg-blue-600 !text-white">
                    {startDate ? startDate.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 !bg-blue-400" align="start">
                  <Calendar
                    className="!bg-white !text-black"
                    mode="single"
                    selected={startDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setStartDate(date)
                      setOpenStart(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col">
              <Label className="text-lg md:text-xl font-medium">End Date</Label>
              <Popover open={openEnd} onOpenChange={setOpenEnd}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-48 justify-between font-normal !bg-blue-600 !text-white"
                  >
                    {endDate ? endDate.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 !bg-blue-400" align="start">
                  <Calendar
                    className="!bg-white !text-black"
                    mode="single"
                    selected={endDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setEndDate(date)
                      setOpenEnd(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>

      </div>
      <div className="flex flex-row items-start justify-center gap-4 w-full">
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-4">Top Prescription Diagnoses</h2>
              <h2 className="text-lg  mb-4"> Most prescriptions have patients that are diagnosed with {" "}
              {topdPrescription.length > 0 ? topdPrescription[0].diagnosis : "N/A"}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topdPrescription}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
            >
              <XAxis type="number" />
              <YAxis type="category" dataKey="diagnosis" />
              <Tooltip />
              <Bar dataKey="count"  radius={4}>
                {topdPrescription.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 w-screen">
            <h2 className="text-lg font-semibold mb-4">Top Patient Diagnoses</h2>
                  <h2 className="text-lg  mb-4"> Most patients have been diagnosed with {" "}
                  {topdPatient.length > 0 ? topdPatient[0].diagnosis : "N/A"}</h2>      
            <div className="flex flex-row items-start gap-4">
              <ResponsiveContainer width={300} height={300}>
                <PieChart>
                  <Pie
                    data={topdPatient}
                    dataKey="count"
                    nameKey="diagnosis"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {topdPatient.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

            
              <div className="flex flex-col justify-center gap-2">
                {topdPatient.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></div>
                    <span>{item.diagnosis}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
     <Card className="flex-1">
      <CardHeader>
        <CardTitle>Most Prescribed Drugs</CardTitle>
        <CardDescription>Based on prescription frequency</CardDescription>
        <h2 className="text-lg  mb-4"> Most prescriptions have have been prescribed with {" "}
              {topdDrugs.length > 0 ? topdDrugs[4].drug : "N/A"}</h2>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topdDrugs}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="drug" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" radius={4} >
             {topdDrugs.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    <div  className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
      <div className="flex flex-row justify-center gap-2">
    <Card className="w-full p-5">
      <CardHeader> Patient Age Statistics</CardHeader>
      <CardDescription>
        Analytics based on registered patient age
      </CardDescription>
        <h2 className="text-lg  mb-4"> Most patients currently registered are of the age: {" "}
              {topdDage.length > 0 ? topdDage[4].age : "N/A"}</h2>
       <Tabs defaultValue="general" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="general" className="!bg-white !text-black">General Age Statistics</TabsTrigger>
            <TabsTrigger value="infant" className="!bg-white !text-black">Infant</TabsTrigger>
            <TabsTrigger value="teen" className="!bg-white !text-black">Teen</TabsTrigger>
            <TabsTrigger value="adult" className="!bg-white !text-black">Adult</TabsTrigger>
            <TabsTrigger value="middle" className="!bg-white !text-black">Middle Age Adult</TabsTrigger>
            <TabsTrigger value="senior" className="!bg-white !text-black">Senior</TabsTrigger>
          </TabsList>

          {/* General Age Stats */}
          <TabsContent value="general">
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topdDage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="age"
                    label={{ value: "Age (yrs)", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {topdDage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>

          {/* Infant */}
          <TabsContent value="infant">
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topdDageInfant}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="diagnosis"
                    label={{ value: "Diagnosis", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {topdDageInfant.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>

          {/* Teen */}
          <TabsContent value="teen">
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topdDageTeen}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="diagnosis"
                    label={{ value: "Diagnosis", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {topdDageTeen.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>

          {/* Adult */}
          <TabsContent value="adult">
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topdDageAdult}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="diagnosis"
                    label={{ value: "Diagnosis", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {topdDageAdult.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>

          {/* Middle Age */}
          <TabsContent value="middle">
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topdDageMiddleAge}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="diagnosis"
                    label={{ value: "Diagnosis", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {topdDageMiddleAge.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>

          {/* Senior */}
          <TabsContent value="senior">
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topdDageSenior}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="diagnosis"
                    label={{ value: "Diagnosis", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {topdDageSenior.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>


       <Card className="w-full p-5">
      <CardHeader> Patient Gender Statistics</CardHeader>
      <CardDescription>
        Analytics based on registered patient gender
      </CardDescription>
        <h2 className="text-lg  mb-4"> Most patients currently registered are: {" "}
              {topdGender.length > 0 ? topdGender[0].gender : "N/A"}</h2>
       <Tabs defaultValue="general" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="general" className="!bg-white !text-black">General Gender Statistics</TabsTrigger>
            <TabsTrigger value="male" className="!bg-white !text-black">Male</TabsTrigger>
            <TabsTrigger value="female" className="!bg-white !text-black">Female</TabsTrigger>
          </TabsList>

          {/* General Gender */}
          <TabsContent value="general">
            <CardContent>
              <ResponsiveContainer width={300} height={300}>
                <PieChart>
                  <Pie
                    data={topdGender}
                    dataKey="count"
                    nameKey="diagnosis"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {topdGender.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>

          {/* Male */}
          <TabsContent value="male">
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topdMale}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="diagnosis"
                    label={{ value: "Diagnosis", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {topdMale.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>

          {/* Female */}
          <TabsContent value="female">
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topdFemale}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="diagnosis"
                    label={{ value: "Diagnosis", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={4}>
                    {topdFemale.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>
        </Tabs>
    </Card>
    </div>
    </div>

    </div>
  )

  }
  return (
    <div className="p-4 w-full space-y-10">
      <div className="flex flex-col items-start  gap-4 w-full">
        <div className="flex flex-1 flex-col justify-center ">
          <Card  className="w-screen">
            <CardHeader className=" text-3xl flex flex-col items-stretch border-b !p-0 sm:flex-row">Analysis Reports</CardHeader>
              <CardDescription>Showing reports for the past month</CardDescription>
          </Card>
        </div>
        
        <Card className="p-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col">
              <Label className="text-lg md:text-xl font-medium">Start Date</Label>
              <Popover open={openStart} onOpenChange={setOpenStart}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-48 justify-between font-normal !bg-blue-600 !text-white">
                    {startDate ? startDate.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 !bg-blue-400" align="start">
                  <Calendar
                    className="!bg-white !text-black"
                    mode="single"
                    selected={startDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setStartDate(date)
                      setOpenStart(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col">
              <Label className="text-lg md:text-xl font-medium">End Date</Label>
              <Popover open={openEnd} onOpenChange={setOpenEnd}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-48 justify-between font-normal !bg-blue-600 !text-white"
                  >
                    {endDate ? endDate.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 !bg-blue-400" align="start">
                  <Calendar
                    className="!bg-white !text-black"
                    mode="single"
                    selected={endDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setEndDate(date)
                      setOpenEnd(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>

      </div>
      <div className="flex flex-col items-start justify-center gap-4 w-screen">
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4"> Top Prescription Diagnoses</h2>
        <h2 className="text-lg mb-4">
          Most prescriptions have patients that are diagnosed with{" "}
          {topdPrescription.length > 0 ? topdPrescription[0].diagnosis : "N/A"}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={topdPrescription}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
          >
            <XAxis type="number" />
            <YAxis type="category" dataKey="diagnosis" />
            <Tooltip />
            <Bar dataKey="count" fill="#004EE9" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 w-screen">
        <h2 className="text-lg font-semibold mb-4">Top Patient Diagnoses</h2>
              <h2 className="text-lg  mb-4"> Most patients have been diagnosed with {" "}
              {topdPatient.length > 0 ? topdPatient[0].diagnosis : "N/A"}</h2>      
        <div className="flex flex-row items-start gap-4">
          <ResponsiveContainer width={300} height={300}>
            <PieChart>
              <Pie
                data={topdPatient}
                dataKey="count"
                nameKey="diagnosis"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {topdPatient.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

        
          <div className="flex flex-col justify-center gap-2">
            {topdPatient.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></div>
                <span>{item.diagnosis}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

     <Card className="flex-1">
      <CardHeader>
        <CardTitle>Most Prescribed Drugs</CardTitle>
        <h2 className="text-lg  mb-4"> Most prescriptions have have been prescribed with {" "}
              {topdDrugs.length > 0 ? topdDrugs[4].drug : "N/A"}</h2>
        <CardDescription>Based on prescription frequency</CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topdDrugs}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="drug" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#004EE9" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    </div>
  )
}