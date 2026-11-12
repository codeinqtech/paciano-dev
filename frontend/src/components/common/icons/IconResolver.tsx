import type { LucideIcon } from "lucide-react";
import * as Icons from "./index";

interface IconResolverProps {
  name?: string | null;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const iconMap = Icons as Record<string, LucideIcon>;

const IconResolver = ({
  name,
  className,
  size = 20,
  strokeWidth = 1.8,
}: IconResolverProps) => {
  const iconName = name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : "Globe";

  const Icon = iconMap[iconName] || iconMap.Globe;

  return (
    <Icon
      className={className}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
};

export default IconResolver;