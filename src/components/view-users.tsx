"use client";

import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { db } from "@/firebaseConfig";
import { ref, onValue, update, get } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  doctors?: string[];
  secretaries: string[];
  uid?: string;
};

export function ViewUsers() {
  const { user } = useAuth();
  const [data, setData] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    console.log(user);
    const usersRef = ref(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const users: User[] = data
        ? Object.entries(data).map(([id, value]) => ({
            id,
            ...(value as any),
          }))
        : [];
      setData(users.filter((u) => u.id !== user.uid));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  const doctors = data.filter((u) => u.type?.toLowerCase() === "doctor");
  const secretaries = data.filter((u) => u.type?.toLowerCase() === "secretary");
  const userIsSecretary = user?.type?.toLowerCase() === "secretary";
  const userIsDoctor = user?.type?.toLowerCase() === "doctor";

  console.log(userIsSecretary, "CHECK SECRETARY STATUS");

  async function addRequest(u: User): Promise<void> {
    if (!user) return;

    const doctorRef = ref(db, `users/${u.id}`);
    console.log("Add doctor:", u);

    console.log(doctorRef);
    const doctorSnapshot = await get(doctorRef);
    const docData = doctorSnapshot.exists() ? doctorSnapshot.val() : {};
    const requestedBy = Array.isArray(docData.requestedBy)
      ? docData.requestedBy
      : Array.isArray(docData.requestedby)
      ? docData.requestedby
      : [];
    const newRequestedBy = [...requestedBy, user.uid];
    await update(doctorRef, {
      requestedBy: newRequestedBy,
    });

    console.log(user);
    const secRef = ref(db, `users/${user.uid}`);
    const secSnapshot = await get(secRef);
    const secData = secSnapshot.exists() ? secSnapshot.val() : {};
    const requestedTo = Array.isArray(secData.requestedTo)
      ? secData.requestedTo
      : Array.isArray(secData.requestedto)
      ? secData.requestedto
      : [];
    const newRequestedTo = [...requestedTo, u.id];
    await update(secRef, {
      requestedTo: newRequestedTo,
    });
  }

  const SectionLabel = ({ title }: { title: string }) => (
    <div className="flex items-center w-full my-4">
      <div className="flex-grow border-t border-gray-400" />
      <span className="px-4 text-lg font-semibold text-gray-700 uppercase tracking-wider">
        {title}
      </span>
      <div className="flex-grow border-t border-gray-400" />
    </div>
  );

  async function acceptRequest(u: User): Promise<void> {
    if (!user) return;

    const doctorRef = ref(db, `users/${user.uid}`);
    console.log("Add doctor:", u);

    console.log(doctorRef);
    const doctorSnapshot = await get(doctorRef);
    const doctorData = doctorSnapshot.exists() ? doctorSnapshot.val() : {};

    const requestedBy: string[] = Array.isArray(doctorData.requestedBy)
      ? doctorData.requestedBy
      : [];
    const newRequestedBy = requestedBy.filter((uid) => uid !== u.id);

    const secretaries: string[] = Array.isArray(doctorData.secretaries)
      ? doctorData.secretaries
      : [];
    const newSecretaries = [...secretaries, u.id];

    await update(doctorRef, {
      requestedBy: newRequestedBy,
      secretaries: newSecretaries,
    });

    const secRef = ref(db, `users/${u.id}`);
    const secSnapshot = await get(secRef);
    const secData = secSnapshot.exists() ? secSnapshot.val() : {};

    const requestedTo: string[] = Array.isArray(secData.requestedTo)
      ? secData.requestedTo
      : [];
    const newRequestedTo = requestedTo.filter((uid) => uid !== user.uid);

    const doctors: string[] = Array.isArray(secData.doctors)
      ? secData.doctors
      : [];
    const newDoctors = [...doctors, user.uid];

    await update(secRef, { requestedTo: newRequestedTo, doctors: newDoctors });

    console.log(`Accepted request from ${u.firstName} ${u.lastName}`);
  }

  async function cancelRequest(s: any) {
    if (!user) return;

    const doctorRef = ref(db, `users/${user.uid}`);
    const doctorSnapshot = await get(doctorRef);
    const doctorData = doctorSnapshot.exists() ? doctorSnapshot.val() : {};
    const requestedBy: string[] = Array.isArray(doctorData.requestedBy)
      ? doctorData.requestedBy
      : [];
    const newRequestedBy = requestedBy.filter((uid) => uid !== s.id);
    await update(doctorRef, { requestedBy: newRequestedBy });

    const secRef = ref(db, `users/${s.id}`);
    const secSnapshot = await get(secRef);
    const secData = secSnapshot.exists() ? secSnapshot.val() : {};
    const requestedTo: string[] = Array.isArray(secData.requestedTo)
      ? secData.requestedTo
      : [];
    const newRequestedTo = requestedTo.filter((uid) => uid !== user.uid);
    await update(secRef, { requestedTo: newRequestedTo });
    console.log(`Cancelled request from ${s.firstName} ${s.lastName}`);
  }

  return (
    <div className="p-6 space-y-10">
      {/*Doctors */}
      {doctors.length > 0 && <SectionLabel title="Doctors" />}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((u) => {
          const alreadyLinked =
            userIsSecretary && user?.doctors?.includes?.(u.id);
          const alreadyRequested =
            userIsSecretary && user?.requestedTo?.includes?.(u.id);
          return (
            <Card
              key={u.id}
              className="p-4 transition-transform hover:scale-[1.02] bg-[#00a896] text-white shadow-lg"
            >
              <CardHeader className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>DR</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-semibold text-white">
                    {u.firstName} {u.lastName}
                  </CardTitle>
                  <CardDescription className="!text-lg text-blue-100">
                    {u.field || "Medical Field"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Email:</strong> {u.email}
                </p>
                <p>
                  <strong>Medical ID:</strong> {u.medicalId || "None"}
                </p>
                <p className="capitalize">
                  <strong>Type:</strong> {u.type}
                </p>

                {userIsSecretary && (
                  <>
                    {alreadyLinked ? (
                      <div className="mt-4 w-full bg-green-600 text-white text-center font-semibold py-2 rounded-md">
                        Linked
                      </div>
                    ) : alreadyRequested ? (
                      <div className="mt-4 w-full bg-yellow-400 text-black text-center font-semibold py-2 rounded-md">
                        Request Sent
                      </div>
                    ) : (
                      <button
                        onClick={() => addRequest(u)}
                        className="mt-4 w-full !bg-white text-blue-600 font-semibold py-2 rounded-md hover:bg-blue-100 transition"
                      >
                        Add Doctor
                      </button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {secretaries.length > 0 && <SectionLabel title="Secretaries" />}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {secretaries.map((s) => {
          const alreadyLinked =
            userIsDoctor && user?.secretaries?.includes?.(s.id);
          const hasRequest =
            userIsDoctor && user?.requestedBy?.includes?.(s.id);
          return (
            <Card
              key={s.id}
              className="p-4 transition-transform hover:scale-[1.02] bg-white text-black shadow-sm"
            >
              <CardHeader className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-semibold text-gray-800">
                    {s.firstName} {s.lastName}
                  </CardTitle>
                  <CardDescription className="!text-lg text-gray-500">
                    Secretary
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Email:</strong> {s.email}
                </p>
                <p className="capitalize">
                  <strong>Type:</strong> {s.type}
                </p>

                {userIsDoctor && (
                  <>
                    {alreadyLinked ? (
                      <div className="mt-4 w-full bg-green-600 text-white text-center font-semibold py-2 rounded-md">
                        Linked
                      </div>
                    ) : hasRequest ? (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => acceptRequest(s)}
                          className="w-1/2 bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => cancelRequest(s)}
                          className="w-1/2 bg-red-500 text-white font-semibold py-2 rounded-md hover:bg-red-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 w-full bg-gray-200 text-center text-gray-600 font-semibold py-2 rounded-md">
                        Not linked
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
