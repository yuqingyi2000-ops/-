import { Navigation } from "@/components/layout/navigation/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation/bottom-navigation";

export default function WithNavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
      <BottomNavigation />
    </>
  );
}
