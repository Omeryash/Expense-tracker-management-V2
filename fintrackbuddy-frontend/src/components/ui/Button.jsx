import { motion } from "framer-motion";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  ...props
}) => {
  const variants = {
    primary: "gradient-primary text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-secondary text-secondary-foreground border border-border hover:bg-accent",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
    ghost: "hover:bg-accent text-foreground",
    danger: "gradient-danger text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-xl font-semibold transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className} ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};
