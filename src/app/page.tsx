import ReminderManager from "@/components/ReminderManager";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || 'Guest';

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reminders for {userName}</h1>
        </div>
        <ReminderManager />
      </div>
    </main>
  );
}
