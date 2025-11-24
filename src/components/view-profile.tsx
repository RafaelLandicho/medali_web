"use client"

import { useEffect, useState } from "react"
import { db } from "@/firebaseConfig"
import { ref, get, update } from "firebase/database"
import { useAuth } from "@/auth/authprovider"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type UserData = {
  uid: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  type?: string
  medicalId?: string | null
  doctors?: string[]
  secretaries?: string[]
  requestedTo?: string[]
  requestedBy?: string[]
  field?: string | null
}

export function ViewProfile() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [formData, setFormData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchUserData = async () => {
      try {
        const snapshot = await get(ref(db, `users/${user.uid}`))
        if (snapshot.exists()) {
          const data = snapshot.val()
          setUserData(data)
          setFormData(data)
        } else {
          setError("User data not found.")
        }
      } catch {
        setError("Failed to fetch user data.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  if (loading) return <div className="text-xl">Loading profile...</div>
  if (error) return <div className="text-red-600 text-xl">{error}</div>
  if (!userData || !formData) return null

  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`

  const handleChange = (field: keyof UserData, value: string) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const handleSave = async () => {
    if (!user || !formData) return
    setSaving(true)
    try {
      await update(ref(db, `users/${user.uid}`), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        field: formData.field,
        medicalId: formData.medicalId,
      })
      toast.success("Profile updated successfully!")
      setUserData(formData)
    } catch {
      toast.error("Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <Card className="max-w-6xl mx-auto shadow-2xl rounded-lg overflow-hidden">
    
        <CardHeader className="bg-blue-600 text-white p-10 flex items-center space-x-10">
          <Avatar className="w-36 h-36">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-5xl font-bold">{formData.firstName} {formData.lastName}</CardTitle>
            <CardDescription className="text-2xl !text-white mt-3 capitalize">
              {formData.username ? `@${formData.username}` : ""} • {formData.type || ""}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-10 p-12 bg-gray-50">
         
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold mb-6 border-b border-gray-300 pb-3">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xl">
              <div>
                <label className="font-semibold text-xl mb-1 block">First Name</label>
                <Input className="!h-14 !text-xl" value={formData.firstName} onChange={e => handleChange("firstName", e.target.value)} />
              </div>
              <div>
                <label className="font-semibold text-xl mb-1 block">Last Name</label>
                <Input className="!h-14 !text-xl" value={formData.lastName} onChange={e => handleChange("lastName", e.target.value)} />
              </div>
              <div>
                <label className="font-semibold text-xl mb-1 block">Username</label>
                <Input className="!h-14 !text-xl" value={formData.username} onChange={e => handleChange("username", e.target.value)} />
              </div>
              <div>
                <label className="font-semibold text-xl mb-1 block">Email</label>
                <Input className="!h-14 !text-xl" value={formData.email} disabled />
              </div>
              <div>
                <label className="font-semibold text-xl mb-1 block">Type</label>
                <Input className="!h-14 !text-xl" value={formData.type} disabled />
              </div>
            </div>
          </div>

         
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold mb-6 border-b border-gray-300 pb-3">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xl">
              {formData.type === "doctor" && (
                <>
                  <div>
                    <label className="font-semibold text-xl mb-1 block">Medical ID</label>
                    <Input className="!h-14 !text-xl" value={formData.medicalId || ""} onChange={e => handleChange("medicalId", e.target.value)} />
                  </div>
                  <div>
                    <label className="font-semibold text-xl mb-1 block">Department</label>
                    <Input className="!h-14 !text-xl" value={formData.field || ""} onChange={e => handleChange("field", e.target.value)} />
                  </div>
                  <div>
                    <label className="font-semibold text-xl mb-1 block">Secretaries</label>
                    <Input className="!h-14 !text-xl" value={formData.secretaries?.join(", ") || ""} disabled />
                  </div>
                </>
              )}
              {formData.type === "secretary" && (
                <div>
                  <label className="font-semibold text-xl mb-1 block">Assigned Doctors</label>
                  <Input className="!h-14 !text-xl" value={formData.doctors?.join(", ") || ""} disabled />
                </div>
              )}
            </div>
          </div>

       
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold mb-6 border-b border-gray-300 pb-3">Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xl">
              <div>
                <label className="font-semibold text-xl mb-1 block">Requested To</label>
                <Input className="!h-14 !text-xl" value={formData.requestedTo?.join(", ") || ""} disabled />
              </div>
              <div>
                <label className="font-semibold text-xl mb-1 block">Requested By</label>
                <Input className="!h-14 !text-xl" value={formData.requestedBy?.join(", ") || ""} disabled />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="!text-xl !text-white !bg-blue-700 !py-4 !px-8" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
