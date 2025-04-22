import ReminderManager from "@/components/ReminderManager";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <ReminderManager />
      </div>
    </main>
  );
}
