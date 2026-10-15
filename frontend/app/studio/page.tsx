import type { Metadata } from "next";
import { ArcStudio } from "@/components/arc-studio";

export const metadata: Metadata = {
  title: "ARC — A little more human",
  description: "An interactive, fictional preview of ARC profiles, a private journal and deliberate sharing.",
};

export default function StudioPage() {
  return <ArcStudio />;
}
