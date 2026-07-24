import { UserCircle } from "lucide-react";
import connectDB from "@/shared/lib/mongodb";
import User from "@/backend/models/User";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  await connectDB();
  const session = await auth();
  
  const adminName = session?.user?.name || "Admin User";
  const adminEmail = session?.user?.email || "admin@radhika.com";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your administrative credentials and security settings.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm max-w-2xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{adminName}</h3>
            <p className="text-sm text-muted-foreground">System Administrator</p>
          </div>
        </div>

        <div className="space-y-4 border-t border-border/50 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <span className="text-xs uppercase font-bold text-muted-foreground">Email Address</span>
            <span className="col-span-2 text-sm font-medium text-foreground">{adminEmail}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <span className="text-xs uppercase font-bold text-muted-foreground">Administrative Role</span>
            <span className="col-span-2 text-sm font-medium text-foreground">Super Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
