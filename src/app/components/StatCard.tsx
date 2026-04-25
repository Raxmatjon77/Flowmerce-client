import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
  gradient?: string;
}

export function StatCard({ title, value, icon: Icon, trend, description, gradient }: StatCardProps) {
  const defaultGradient = 'from-purple-500/10 to-blue-500/10';

  return (
    <Card className={`relative overflow-hidden border-white/10 bg-gradient-to-br ${gradient || defaultGradient} backdrop-blur-sm`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-gray-400">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">{value}</p>
              {trend && (
                <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          <div className="rounded-xl bg-white/5 p-3 backdrop-blur-sm">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-2xl" />
    </Card>
  );
}
