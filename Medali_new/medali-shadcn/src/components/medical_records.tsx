"use client"

import * as React from "react"
import { UserIcon } from "./ui/icons/lucide-user"
import { PillIcon } from "./ui/icons/lucide-pill"
import { PenIcon } from "./ui/icons/lucide-pen"
import { Trash2Icon } from "./ui/icons/lucide-trash-2"
import { Spinner } from "@/components/ui/spinner"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

import { db } from "@/firebaseConfig"
import { ref, onValue, remove, set, push } from "firebase/database"
import { useAuth } from "@/auth/authprovider"
import { EmptyRecords } from "./empty-records"
import { AddRecordsDrawer } from "./add-records-drawer"
import { EditRecordsSheet } from "./edit-records-sheet"
import { PrescriptionDrawer } from "./add-prescription-drawer"
import { FullRecordsDrawer } from "./viewfull-records-drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ViewFullPatient } from "./view-full-records"


export type Patient = {
  id: string
  firstName: string
  lastName: string
  gender: string
  age: number
  diagnosis: string
  address: string
  telephone: string
  addedBy: string
  bloodPressure?: string
  heartRate?: string
  respiratoryRate?: string
  temperature?: string
  oxygenSaturation?: string
}

export const columns: ColumnDef<Patient>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       className="!bg-white !checked:bg-green-600 !checked:border-blue-600"
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const patient = row.original
      const { user } = useAuth()
      const [openUser, setOpenUser] = React.useState(false)
      const [openEdit, setOpenEdit] = React.useState(false)
      const [openPrescription, setOpenPrescription] = React.useState(false)

      const userIsDoctor =
        user?.type?.toLowerCase() === "doctor" || user?.type?.toLowerCase() === "admin"

      return (
        <div className="flex items-center gap-1">
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpenUser(true)}
            className="!bg-white rounded hover:bg-gray-200"
          >
            <UserIcon className="text-orange-600" />
          </Button>
          <FullRecordsDrawer
            open={openUser}
            onOpenChange={setOpenUser}
            patient={patient}
          />

          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpenEdit(true)}
            className="!bg-white rounded hover:bg-gray-200"
          >
            <PenIcon className="text-orange-600" />
          </Button>
          <EditRecordsSheet
            open={openEdit}
            onOpenChange={setOpenEdit}
            patient={patient}
          />

         
          <Button
            variant="outline"
            size="icon"
            onClick={() => userIsDoctor && setOpenPrescription(true)}
            disabled={!userIsDoctor} // disable for secretary
            className={`!bg-white rounded hover:bg-gray-200 ${
              !userIsDoctor ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <PillIcon
              className={`text-orange-600 ${!userIsDoctor ? "text-gray-400" : ""}`}
            />
          </Button>

          <PrescriptionDrawer
            open={openPrescription}
            onOpenChange={setOpenPrescription}
            patient={patient}
          />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },

  { accessorKey: "firstName", header: "First Name" },
  { accessorKey: "lastName", header: "Last Name" },
  { accessorKey: "gender", header: "Gender" },
  { accessorKey: "age", header: "Age" },
  { accessorKey: "address", header: "Address" },
  { accessorKey: "telephone", header: "Contact Number" },
  { accessorKey: "addedBy", header: "Added By" },
  { accessorKey: "diagnosis", header: "Diagnosis" },

  {
    id: "delete",
    header: "",
    cell: ({ row }) => {
      const patient = row.original
      const { user } = useAuth()
      const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)

      if (!user) return <></>

      const handleDelete = async () => {
        try {
          const logsRef = ref(db, 'logs/')
          const patientRef = ref(db, `patients/${patient.id}`)
          const newLog = push(logsRef)
          await remove(patientRef)
          await set(newLog, {
            medicalRecordLog: `Record deleted by ${user?.firstName} ${user?.lastName}`,
            logTime: new Date().toLocaleString(),
          })
          toast.success("Record has been deleted successfully!")
          setOpenDeleteDialog(false)
          
        } catch (error) {
          console.error("Error deleting patient:", error)
          toast.success("Failed to delete record!")
        }
      }

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpenDeleteDialog(true)}
            className="!bg-white rounded hover:bg-gray-200"
          >
            <Trash2Icon className="text-orange-600" />
          </Button>

          <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this patient record?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. It will permanently remove the record of{" "}
                  <span className="font-semibold">{patient.firstName} {patient.lastName}</span> from your database.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-2">
                <DialogClose className="!bg-gray-200">Cancel</DialogClose>
                <Button
                  onClick={handleDelete}
                  className="!bg-red-500 hover:!bg-red-600 text-white"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },

  
  // {
  //   id: "actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const { user } = useAuth()
  //     const patient = row.original
  //     const userIsDoctor = user?.type?.toLowerCase() === "doctor" || user?.type?.toLowerCase() === "admin"
  //     const [open, setOpen] = React.useState(false)
  //     const [openDrawer, setOpenDrawer] = React.useState(false)
  //     const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
  //     const [openDetails, setOpenDetails] = React.useState(false)

  //     const handleDelete = async () => {
  //       try {
  //         const logsRef = ref(db, 'logs/')
  //         const patientRef = ref(db, `patients/${patient.id}`)
  //         const newLog = push(logsRef)
  //         await remove(patientRef)
  //         await set(newLog, {
  //           medicalRecordLog: `Record deleted by ${user?.firstName} ${user?.lastName}`,
  //           logTime: new Date().toLocaleString(),
  //         })
  //         setOpenDeleteDialog(false)
  //       } catch (error) {
  //         console.error("Error deleting patient:", error)
  //         alert("Failed to delete record.")
  //       }
  //     }

  //     return (
  //       <>
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button variant="ghost" className="h-8 w-8 p-0 inline-flex !bg-green-300 !text-black">
  //               <span className="sr-only">Actions</span>
  //               <MoreHorizontal />
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //             <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpen(true) }}>Edit Record</DropdownMenuItem>
  //             <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpenDeleteDialog(true) }} className="!text-red-600 hover:!bg-red-100">Delete Record</DropdownMenuItem>
  //             <DropdownMenuItem onSelect={(e) => { e.preventDefault(); if (!userIsDoctor) return; setOpenDrawer(true) }} disabled={!userIsDoctor}>Add Prescription</DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //             <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpenDetails(true) }}>View patient details</DropdownMenuItem>
  //           </DropdownMenuContent>
  //         </DropdownMenu>

  //         <EditRecordsSheet open={open} onOpenChange={setOpen} patient={patient} />
  //         <PrescriptionDrawer open={openDrawer} onOpenChange={setOpenDrawer} patient={patient} />
  //         <FullRecordsDrawer open={openDetails} onOpenChange={setOpenDetails} patient={patient} />

          // <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          //   <DialogContent>
          //     <DialogHeader>
          //       <DialogTitle>Delete this patient record?</DialogTitle>
          //       <DialogDescription>
          //         This action cannot be undone. It will permanently remove the record of{" "}
          //         <span className="font-semibold">{patient.firstName} {patient.lastName}</span> from your database.
          //       </DialogDescription>
          //     </DialogHeader>
          //     <DialogFooter>
          //       <DialogClose className="!bg-gray-200">Cancel</DialogClose>
          //       <DialogTrigger onClick={handleDelete} className="!bg-red-500 hover:!bg-red-600 text-white">Delete</DialogTrigger>
          //     </DialogFooter>
          //   </DialogContent>
          // </Dialog>
  //       </>
  //     )
  //   },
  // },
]

export function MedicalRecords() {
  const { user } = useAuth()
  const [data, setData] = React.useState<Patient[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState("firstName")

  React.useEffect(() => {
    if (!user) return

    const usersRef = ref(db, "users")
    const patientsRef = ref(db, "patients")

    const unsubscribe = onValue(usersRef, (usersSnap) => {
      const usersData = usersSnap.val() || {}
      const currentUser = usersData[user.uid]
      if (!currentUser) { setLoading(false); return }

      let canSee: string[] = [user.uid]
      if (currentUser.type === "doctor") {
        canSee = [...canSee, ...(currentUser.secretaries || [])]
      } else if (currentUser.type === "secretary") {
        canSee = [...canSee, ...(currentUser.doctors || [])]
      }

      const unsubscribePatients = onValue(patientsRef, (snapshot) => {
        const data = snapshot.val()
        const patients: Patient[] = data
          ? Object.entries(data)
              .map(([id, value]) => ({ id, ...(value as any) }))
              .filter(patient => {
                if (currentUser.type === "admin") return true
                return "createdBy" in patient && canSee.includes(patient.createdBy)
              })
          : []

        setData(patients)
        setLoading(false)
      })

      return () => unsubscribePatients()
    })

    return () => unsubscribe()
  }, [user])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  })

 
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        table.getAllColumns().forEach(col => {
          if (['bloodPressure','heartRate','respiratoryRate','temperature','oxygenSaturation'].includes(col.id)) {
            col.toggleVisibility(false)
          }
        })
      } else {
        table.getAllColumns().forEach(col => col.toggleVisibility(true))
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [table])

  if (loading) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="flex flex-col p-4 gap-4">
      <h1 className="text-4xl font-bold text-blue-400 text-center">Medical Records</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center p-2">
        <Input
          placeholder={`🔍 Search by ${filter.toUpperCase()}`}
          value={(table.getColumn(filter)?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn(filter)?.setFilterValue(e.target.value)}
          className="w-full sm:w-96 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="!bg-blue-400 !text-white">
              Filter <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter(col => col.getCanFilter()).map(col => (
              <DropdownMenuItem key={col.id} onSelect={(e) => { e.preventDefault(); setFilter(col.id); col.setFilterValue("") }} className={`capitalize ${filter === col.id ? "!bg-blue-100 !text-blue-700" : ""}`}>
                {col.id.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-[1000px] text-sm">
          <TableHeader className="sticky top-0 bg-blue-200 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
              <TableRow key={row.id} className="!bg-white !text-black" data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <EmptyRecords>
                    <AddRecordsDrawer />
                  </EmptyRecords>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end p-2">
        <AddRecordsDrawer />
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-2 border-t bg-white gap-2 sm:gap-0">
        <div className="text-muted-foreground text-sm">{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="!bg-blue-400 !text-white" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" className="!bg-blue-400 !text-white" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  )
}
