import CreditFooter from "@/components/CreditFooter/CreditFooter";
import WelcomeHeader from "@/components/WelcomeHeader/WelcomeHeader";
import Link from "next/link";

export default function NotFound() {
    return (
        <>
        <WelcomeHeader />
        <div className="text-center">
            <p className="mt-10">Sorry, the requested user does not exist.</p>
            <Link href="/start" className="hover:text-black/70">⬅ Back</Link>
        </div>
        <CreditFooter />
        </>
    )
}