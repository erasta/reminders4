import LoginButton from "@/components/LoginButton";
import TextList from "@/components/TextList";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to My App</h1>
        <LoginButton />
        <TextList />
      </div>
    </main>
  );
}
