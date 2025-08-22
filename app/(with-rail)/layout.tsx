// Fixed Layout Component
// app/(with-rail)/layout.tsx
import Sidebar from "@/components/sidebar";

export default function WithRailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main
        className="flex-1 h-screen overflow-y-auto"
        style={{
          width: '73.21%', // 1107/1512 from Figma ratio
          backgroundColor: '#f9fafb', // NEW super light grey equivalent
          paddingLeft: '0px',
          paddingRight: '40px',
          paddingTop: '0px',
          paddingBottom: '56px',
        }}
      >
        {children}
      </main>
    </div>
  );
}