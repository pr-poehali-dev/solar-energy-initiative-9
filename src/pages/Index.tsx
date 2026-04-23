import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Featured from "@/components/Featured";
import Promo from "@/components/Promo";
import MapPreview from "@/components/MapPreview";
import ReportDrawer from "@/components/ReportDrawer";
import Footer from "@/components/Footer";
import WaveDivider from "@/components/WaveDivider";

const Index = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <main className="min-h-screen">
      <div className="relative">
        <Hero onReportClick={() => setDrawerOpen(true)} />
        <Header onReportClick={() => setDrawerOpen(true)} />
      </div>
      <Featured />
      {/* Featured (белый) → MapPreview */}
      <WaveDivider fromColor="#ffffff" toColor="#e5e7eb" />
      <MapPreview />
      <Promo />
      <Footer />
      <ReportDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </main>
  );
};

export default Index;