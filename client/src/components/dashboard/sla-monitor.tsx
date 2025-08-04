import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function SLAMonitor() {
  const slaData = [
    { priority: "Críticos", percentage: 98, color: "bg-green-500" },
    { priority: "Altos", percentage: 92, color: "bg-yellow-500" },
    { priority: "Médios", percentage: 89, color: "bg-orange-500" },
  ];

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Monitor SLA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {slaData.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{item.priority}</span>
                <span 
                  data-testid={`sla-${item.priority.toLowerCase()}`}
                  className="font-medium"
                >
                  {item.percentage}%
                </span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
