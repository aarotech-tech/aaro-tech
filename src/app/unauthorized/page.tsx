import Link from "next/link";
import { LogOut, AlertTriangle } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-100">Access Denied</h1>
        
        <p className="text-slate-400 text-sm">
          You don't have permission to access the internal dashboard. Your account hasn't been provisioned as an agency member in the database.
        </p>



        <div className="pt-4 flex flex-col space-y-3">
          <SignOutButton redirectUrl="/sign-in">
            <Button className="w-full cursor-pointer bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 transition-colors">
              Sign Out
            </Button>
          </SignOutButton>
          <Link href="/" className="w-full cursor-pointer">
            <Button variant="ghost" className="w-full cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
