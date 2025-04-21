import LoginButton from "@/components/LoginButton";
import ReminderManager from "@/components/ReminderManager";
import AdminButton from "@/components/AdminButton";

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Reminders</h1>
          <div className="flex items-center gap-4">
            <AdminButton />
            <LoginButton />
          </div>
        </div>
        <ReminderManager />
      </div>
    </main>
  );
}
