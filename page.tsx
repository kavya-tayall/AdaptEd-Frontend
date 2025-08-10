// app/page.tsx
import Sidebar from "@/components/sidebar";
import TopicSelection from "@/components/topic-selection-component";

export default function Home() {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="flex-1">
        <TopicSelection />
      </main>
    </div>
  );
}
