import LoginButton from "@/components/LoginButton";
import ReminderManager from "@/components/ReminderManager";

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Reminders</h1>
          <LoginButton />
        </div>
        <ReminderManager />
      </div>
    </main>
  );
}
