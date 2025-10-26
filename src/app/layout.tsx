import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Providers } from "./providers";
import { Poppins } from "next/font/google";
import { UserProfileProvider } from "@/contexts/UserProfileContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "LunchBox - College Canteen Ordering",
  description: "Order food from your college canteen",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Providers>
          <UserProfileProvider>
            <AuthProvider>{children}</AuthProvider>
          </UserProfileProvider>
        </Providers>
      </body>
    </html>
  );
}
