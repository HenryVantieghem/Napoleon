export const metadata = {
  title: 'Napoleon AI - Prototype',
  description: 'Unified inbox prototype',
};

export default function PrototypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50">
      {children}
    </main>
  );
}