import { useRef } from "react";

export const Input = ({ label, error, icon, className = "", ...props }) => {
  const inputRef = useRef(null);

  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Date input ke liye showPicker (agar supported hai)
      if (props.type === "date" && inputRef.current.showPicker) {
        try {
          inputRef.current.showPicker();
        } catch (err) {
          // Kuch browsers support nahi karte, ignore
        }
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div
            onClick={handleIconClick}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer z-10"
          >
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          className={`
            w-full px-4 py-3 rounded-xl border border-border bg-background
            text-foreground placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-primary/50
            transition-all duration-300
            ${icon ? "pl-10" : ""}
            ${error ? "border-destructive focus:ring-destructive/50" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
