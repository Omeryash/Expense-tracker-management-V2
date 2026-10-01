import { motion } from "framer-motion";

export const Card = ({
  children,
  className = "",
  hover = true,
  glass = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-2xl border border-border bg-card p-6
        ${hover ? "card-hover" : ""}
        ${glass ? "glass" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
