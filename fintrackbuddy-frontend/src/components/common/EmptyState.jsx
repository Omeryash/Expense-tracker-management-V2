import { motion } from "framer-motion";
import { Button } from "../ui/Button";

export const EmptyState = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {actionText && <Button onClick={onAction}>{actionText}</Button>}
    </motion.div>
  );
};
