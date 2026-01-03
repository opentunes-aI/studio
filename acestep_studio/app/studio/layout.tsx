import GlobalLayout from "@/components/GlobalLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Opentunes Studio",
    description: "AI Music Generation Platform",
};

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <GlobalLayout>
            {children}
        </GlobalLayout>
    );
}
