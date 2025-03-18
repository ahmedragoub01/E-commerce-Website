import AuthProvider from '@/components/auth/AuthProvider';
import Image from 'next/image';
import loginSvg from '@/public/Login.svg';

export default function LoginPage() {
  return (
    <div className="container mx-auto py-1 flex items-center">
      <div className="w-1/2 p-8">
        <Image src={loginSvg} alt="Login" />
      </div>
      <div className="w-1/2">
        <AuthProvider />
      </div>
    </div>
  );
}