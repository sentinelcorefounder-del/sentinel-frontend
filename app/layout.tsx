import "./globals.css";

export const metadata = {
  title: "Sentinel AI",
  description: "Diabetic Retinopathy Screening",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 font-sans">
        {children}
      </body>
    </html>
  );
}