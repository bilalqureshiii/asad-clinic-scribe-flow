
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "text-purple-600",
  children 
}) => {
  return (
    <Card className="bg-white">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between pt-4">
          <p className={`text-3xl font-bold ${iconColor}`}>{value}</p>
          {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
        </div>
        {children}
      </CardContent>
    </Card>
  );
};

export default StatCard;
