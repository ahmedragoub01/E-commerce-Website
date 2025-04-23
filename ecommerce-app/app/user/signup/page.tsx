import Image from "next/image";
import signupSvg from "@/public/Signup.svg"; // You'll need to have this SVG
import SignupProvider from "@/components/auth/SignupProvider";

export default function SignupPage() {
  return (
    <div className="container mx-auto py-1 flex items-center min-h-screen">
      <div className="w-1/2 p-8">
        <Image src={signupSvg} alt="Signup" />
      </div>
      <div className="w-1/2">
        <SignupProvider />
      </div>
    </div>
  );
}
