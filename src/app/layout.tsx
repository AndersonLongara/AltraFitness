import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AltraFitness",
  description: "High Performance Fitness Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/auth-redirect"
      afterSignUpUrl="/auth-redirect"
      signInFallbackRedirectUrl="/auth-redirect"
      signUpFallbackRedirectUrl="/auth-redirect"
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      localization={ptBR}
    >
      <html lang="pt-BR">
        <body
          className={`${jakarta.variable} antialiased bg-ice-white text-graphite-dark`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
