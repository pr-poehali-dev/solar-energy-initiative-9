import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Featured from "@/components/Featured";
import Promo from "@/components/Promo";
import ReportForm from "@/components/ReportForm";
import MapPreview from "@/components/MapPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <div className="relative">
        <Hero />
        <Header />
      </div>
      <MapPreview />
      <Featured />
      <Promo />
      <ReportForm />
      <Footer />
    </main>
  );
};

export default Index;