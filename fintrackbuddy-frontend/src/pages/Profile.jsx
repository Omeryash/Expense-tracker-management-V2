import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { User, Mail, Phone, MapPin } from "lucide-react";

export default function Profile() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
        </div>

        <Card>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl text-white">JD</span>
            </div>
            <h2 className="text-xl font-semibold">John Doe</h2>
            <p className="text-muted-foreground">Premium Member since 2024</p>
          </div>

          <form className="space-y-4">
            <Input
              label="Full Name"
              defaultValue="John Doe"
              icon={<User className="w-4 h-4" />}
            />
            <Input
              label="Email Address"
              type="email"
              defaultValue="john@example.com"
              icon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Phone Number"
              defaultValue="+1 234 567 8900"
              icon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Location"
              defaultValue="New York, USA"
              icon={<MapPin className="w-4 h-4" />}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
