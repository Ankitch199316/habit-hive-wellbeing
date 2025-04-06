
import React from "react";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

const MobileContainer: React.FC<MobileContainerProps> = ({ children, className = "" }) => {
  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-secondary/50 p-4">
      <div className={`max-w-md w-full h-[85vh] bg-background rounded-3xl shadow-xl overflow-hidden flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default MobileContainer;
