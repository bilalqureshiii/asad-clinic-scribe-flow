
import React from "react";

interface PreloaderProps {
  text?: string;
  className?: string;
}

const Preloader: React.FC<PreloaderProps> = ({ text, className }) => {
  return (
    <div className={`flex items-center justify-center ${className || "min-h-64"}`}>
      <div className="relative">
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <div
            className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-r-[#195110] border-b-[#195110] animate-spin"
            style={{ animationDuration: "3s" }}
          ></div>

          <div
            className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-t-[#195110] animate-spin"
            style={{ animationDuration: "2s", animationDirection: "reverse" }}
          ></div>
        </div>

        <div
          className="absolute inset-0 bg-gradient-to-tr from-[#195110]/10 via-transparent to-[#195110]/5 animate-pulse rounded-full blur-sm"
        ></div>
      </div>
      
      {text && (
        <p className="absolute mt-32 md:mt-40 text-gray-600">{text}</p>
      )}
    </div>
  );
};

export { Preloader };
