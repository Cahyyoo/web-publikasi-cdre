import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PointerEffects from "@/components/ui/PointerEffects";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-stone-700">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollReveal />
      <PointerEffects />
    </div>
  );
}
