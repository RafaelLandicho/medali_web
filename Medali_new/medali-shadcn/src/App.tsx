import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { MedicalRecords } from "@/components/medical_records"
import { ViewUsers } from "./components/view-users"
import { SignUp } from "@/components/signup"
import { Login } from "@/components/login"
import Layout from "./layout"
import { Card, CardDescription, CardTitle } from "./components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { AuthProvider, useAuth } from "@/auth/authprovider"
import { Prescriptions } from "./components/view-prescriptions"
import { ViewLogs } from "./components/logs"
import { ViewProfile } from "./components/view-profile"
import { Toaster } from "sonner"
import { Analytics } from "./components/analytics"
import { Homepage } from "./components/home"
import { AddRecords } from "./components/add-records"
import { Spinner } from "@/components/ui/spinner"
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

    if (loading) return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Spinner className="size-40 text-orange-500" />
      </div>
    )
  if (!user) return <Navigate to="/" replace />

  return <>{children}</>
}

function App() {
  const { user } = useAuth()

  return (
    <>
     <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <div className="min-h-screen relative flex justify-center items-center overflow-hidden bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 p-6">
                  <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

                  <div className="relative z-10 w-full max-w-3xl">
                    <div className="flex flex-col items-center text-center mb-8">
                      <h1 className="text-4xl font-bold text-green-500 tracking-tight drop-shadow-sm">
                        Welcome to Medali
                      </h1>
                      <p className="text-gray-700 text-lg mt-2">
                        Manage patient records online
                      </p>
                    </div>
                    <Card>

                      <Carousel className="relative w-full backdrop-blur-lg bg-white rounded-2xl shadow-lg border border-white/30 overflow-hidden">
                      <CarouselContent className="-ml-4">
                        <CarouselItem className="pl-4">
                          <Card className="p-8 bg-transparent border-none shadow-none">
                            <CardTitle className="text-2xl font-semibold text-blue-900">
                              Login to your account
                            </CardTitle>
                            <CardDescription className="text-gray-600 mb-4">
                              Enter your email and password below to continue.
                            </CardDescription>
                            <Login />
                          </Card>
                        </CarouselItem>

                        <CarouselItem className="pl-4">
                          <Card className="p-8 bg-transparent border-none shadow-none">
                            <CardTitle className="text-2xl font-semibold text-blue-900">
                              Create an account
                            </CardTitle>
                            <CardDescription className="text-gray-600 mb-4">
                              Fill out your details to get started.
                            </CardDescription>
                            <SignUp />
                          </Card>
                        </CarouselItem>
                      </CarouselContent>

                  
                      <CarouselPrevious className="!bg-blue-500">
                        Login
                      </CarouselPrevious>

                      <CarouselNext className="!bg-blue-500">
                        Signup
                      </CarouselNext>
                    </Carousel>
                    </Card>
                    

                
                  </div>
                </div>
              ) : (
                <Navigate to="/home" replace />
              )
            }
          />

          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <Layout>
                  <MedicalRecords />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-record"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddRecords />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <ViewUsers />
                </Layout>
              </ProtectedRoute>
            }
          />

           <Route
            path="/prescriptions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Prescriptions />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ViewProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
           <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <Layout>
                  <ViewLogs />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout>
                  <Homepage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
