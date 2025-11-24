"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Link } from "react-router-dom"
import { useAuth } from "@/auth/authprovider"

import add from "./images/add.png"
import medicalReport from "./images/medical-report.png"
import prescription from "./images/prescription(1).png"
import view from "./images/view.png"
import analytics from "./images/analytics.jpg"
import prescriptionBig from "./images/prescriptionBig.jpg"
import prescriptionBig2 from "./images/prescriptionBig2.jpg"
import medicalRecords from "./images/medicalRecords.jpg"
import usersPic from "./images/users.jpg"
import patientPic from "./images/patient.png"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export function Homepage() {
  const { user } = useAuth()
  const plugin = React.useRef(Autoplay({ delay: 3000, stopOnInteraction: false }))

  const carouselItems = [
    {
      img: medicalRecords,
      title: "Medical Records",
      description: "Secure and organized patient medical history"
    },
    {
      img: prescriptionBig,
      title: "Prescriptions",
      description: "Manage and track patient medications"
    },
    {
      img: usersPic,
      title: "User Management",
      description: "Control access and permissions"
    },
    {
      img: analytics,
      title: "Analytics",
      description: "Insights and data visualization"
    },
    {
      img: prescriptionBig2,
      title: "Digital Prescriptions",
      description: "Modern prescription management"
    }
  ]

  const cards = [
    {
      img: view,
      description: "Access and manage all patient medical records securely here.",
      link: "/records",
    },
    {
      img: add,
      description: "Create and add a patient's medical record to the Medali Database.",
      link: "/add-record",
    },
    {
      img: patientPic,
      description: "Manage and link accounts  with other users",
      link: "/users",
    },
    {
      img: prescription,
      description: "Create and manage patient prescriptions in the system.",
      link: "/prescriptions",
    },
    {
      img: medicalReport,
      description: "View analytics of patient records and prescriptions.",
      link: "/analytics",
    },
  ]

  return (
    <div className="min-h-screen bg-[#00a896] p-6">
      <Card className="bg-[#00a896] border-0 shadow-none mb-8">
        <CardContent className="flex items-center justify-center mt-4">
          <Carousel
            plugins={[plugin.current]}
            className="w-full h-full"
            onMouseEnter={() => plugin.current.stop}
            onMouseLeave={() => plugin.current.reset}
          >
            <CarouselContent>
              {carouselItems.map((item, idx) => (
                <CarouselItem key={idx}>
                  <div className="p-1 w-full h-full">
                    <Card className="w-full h-full bg-transparent border-0 shadow-none rounded-2xl overflow-hidden relative">
                      <CardContent className="flex items-center justify-center w-full h-full p-0 relative">
                        <img src={item.img} className="w-[75vw] h-[75vw] object-contain rounded-2xl" />
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

      <Card className="bg-[#00a896] border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-white text-4xl text-center font-semibold">
            Streamlined access to patient records, prescriptions, and analytics
          </CardTitle>
          <CardDescription className="text-white text-2xl text-center mt-2">
            Pick from the available options to continue your workflow.
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap gap-5 w-full">
            {cards.map((card, index) => (
              <Link
                key={index}
                to={card.link}
                className="w-full sm:w-1/2 md:w-1/3 lg:w-1/5"
              >
                <Card className="h-80 sm:h-96 bg-[#00a896] hover:bg-[#1782a7] transition-colors cursor-pointer border-0 shadow-none">
                  <CardContent className="flex flex-col items-center justify-center text-center">
                    <img src={card.img} className="h-40 md:h-48 object-contain mb-3" />
                    <CardDescription className="text-white !text-xl">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}