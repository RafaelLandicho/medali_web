import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MedicalRecords } from "@/components/medical_records";
import { ViewUsers } from "./components/view-users";
import { SignUp } from "@/components/signup";
import { Login } from "@/components/login";
import Layout from "./layout";
import {
  Card,
  CardDescription,
  CardTitle,
  CardContent,
} from "./components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import analytics from "./components/images/analytics.jpg";
import prescriptionBig from "./components/images/prescriptionBig.jpg";
import prescriptionBig2 from "./components/images/prescriptionBig2.jpg";
import medicalRecords from "./components/images/medicalRecords.jpg";
import usersPic from "./components/images/users.jpg";
import patientPic from "./components/images/patient.png";
import Autoplay from "embla-carousel-autoplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthProvider, useAuth } from "@/auth/authprovider";
import { Prescriptions } from "./components/view-prescriptions";
import { ViewLogs } from "./components/logs";
import { ViewProfile } from "./components/view-profile";
import { Toaster } from "sonner";
import { Analytics } from "./components/analytics";
import { Homepage } from "./components/home";
import { AddRecords } from "./components/add-records";
import { Spinner } from "@/components/ui/spinner";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Spinner className="size-40 text-orange-500" />
      </div>
    );
  if (!user) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function App() {
  const { user } = useAuth();
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  const carouselItems = [
    {
      img: medicalRecords,
      title: "Medical Records",
      description: "Secure and organized patient medical history",
    },
    {
      img: prescriptionBig,
      title: "Prescriptions",
      description: "Manage and track patient medications",
    },
    {
      img: usersPic,
      title: "User Management",
      description: "Control access and permissions",
    },
    {
      img: analytics,
      title: "Analytics",
      description: "Insights and data visualization",
    },
    {
      img: prescriptionBig2,
      title: "Digital Prescriptions",
      description: "Modern prescription management",
    },
  ];

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <div className="h-screen relative flex justify-center items-center overflow-y-auto bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 p-6">
                  <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                  <div className="flex flex-col lg:flex-row justify-center items-center">
                    <div className="relative z-10 w-full max-w-3xl">
                      <div className="flex flex-col items-center text-center mb-8">
                        <h1 className="text-4xl font-bold text-green-500 tracking-tight drop-shadow-sm">
                          Welcome to Medali
                        </h1>
                        <p className="text-gray-700 text-lg mt-2">
                          Manage patient records online
                        </p>
                      </div>
                      <div className="flex justify-center w-full">
                        <Card className="p-8 bg-white/70 backdrop-blur-lg border border-white/30 shadow-lg w-full max-w-xl mx-auto">
                          <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid grid-cols-2 w-full mb-6">
                              <TabsTrigger
                                value="login"
                                className="data-[state=active]:!bg-blue-500 
                                                                    data-[state=active]:!text-white
                                                                    !bg-blue-200 text-blue-900 transition-colors"
                              >
                                Login
                              </TabsTrigger>
                              <TabsTrigger
                                value="signup"
                                className="data-[state=active]:!bg-blue-500 data-[state=active]:text-white
                                !bg-blue-200 text-blue-900 transition-colors"
                              >
                                Signup
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                              <CardTitle className="text-2xl font-semibold text-blue-900">
                                Login to your account
                              </CardTitle>
                              <CardDescription className="text-gray-600 mb-4">
                                Enter your email and password below to continue.
                              </CardDescription>
                              <Login />
                            </TabsContent>

                            <TabsContent value="signup">
                              <CardTitle className="text-2xl font-semibold text-blue-900">
                                Create an account
                              </CardTitle>
                              <CardDescription className="text-gray-600 mb-4">
                                Fill out your details to get started.
                              </CardDescription>
                              <SignUp />
                            </TabsContent>
                          </Tabs>
                        </Card>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <Card className="w-full h-full  relative flex justify-center items-center overflow-hidden border-none bg-transparent shadow-none p-0">
                        <CardContent className="flex items-center justify-center">
                          <Carousel
                            plugins={[plugin.current]}
                            className="w-full h-full"
                            onMouseEnter={() => plugin.current.stop}
                            onMouseLeave={() => plugin.current.reset}
                          >
                            <CarouselContent>
                              {carouselItems.map((item, idx) => (
                                <CarouselItem key={idx}>
                                  <div className="w-full h-full">
                                    <Card className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl overflow-hidden relative">
                                      <CardContent className="flex items-center justify-center w-full h-full p-0 relative">
                                        <img
                                          src={item.img}
                                          className="w-full h-full object-cover rounded-2xl"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-2xl">
                                          <h3 className="text-white text-2xl md:text-4xl font-bold mb-2 text-center">
                                            {item.title}
                                          </h3>
                                          <p className="text-white text-lg md:text-xl text-center">
                                            {item.description}
                                          </p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                          </Carousel>
                        </CardContent>
                      </Card>
                    </div>
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
  );
}

export default App;
