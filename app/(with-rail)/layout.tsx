// app/(with-rail)/layout.tsx
import Sidebar from "@/components/sidebar";

export default function WithRailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
