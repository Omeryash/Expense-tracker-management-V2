import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

export default function Analytics() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into your spending patterns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-semibold">Spending Trends</h3>
            </div>
            <p className="text-muted-foreground">
              Your spending has increased by 12% this month
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="font-semibold">Savings Goal</h3>
            </div>
            <p className="text-muted-foreground">
              You're 85% towards your monthly savings goal
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <PieChart className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-semibold">Category Analysis</h3>
            </div>
            <p className="text-muted-foreground">
              Food & Bills are your top spending categories
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-semibold">Unnecessary Spending</h3>
            </div>
            <p className="text-muted-foreground">
              You could save $200 by reducing dining out
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
