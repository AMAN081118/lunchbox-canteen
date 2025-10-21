import { Header } from "./header";
import { Footer } from "./footer";
import { FloatingCart } from "../cart/floating-cart";

interface MainLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showCart?: boolean;
}

export function MainLayout({
  children,
  showHeader = true,
  showFooter = true,
  showCart = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
      {showCart && <FloatingCart />}
    </div>
  );
}
