import LoginButton from "@/components/LoginButton";
import ReminderManager from "@/components/ReminderManager";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Company Reminders</h1>
        <LoginButton />
        <ReminderManager />
      </div>
    </main>
  );
}
