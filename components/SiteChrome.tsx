import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function SiteChrome({
  children,
  showFooter = true,
}: {
  children: React.ReactNode;
  showFooter?: boolean;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </>
  );
}
