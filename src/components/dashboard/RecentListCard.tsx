
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentListCardProps {
  title: string;
  children: React.ReactNode;
}

const RecentListCard: React.FC<RecentListCardProps> = ({ title, children }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default RecentListCard;
