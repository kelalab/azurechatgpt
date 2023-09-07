"use client";
import { DISCLAIMER_TEXT } from "@/features/theme/customise";
import { useState } from "react";
import { Button } from "../ui/button";
import { XCircle, AlertTriangle } from "lucide-react";

const Disclaimer = () => {
  const [show, setShow] = useState(true);
  return (
    <div
      className={`relative flex items-center justify-center mt-2 mb-2 max-h-20 md:max-h-16 lg:max-h-12 ${
        show ? "visible" : "invisible h-0"
      }`}
    >
      <div className="relative flex items-center justify-center bg-warning rounded-md px-4 md:px-8">
        <div className="hidden md:visible">
          <AlertTriangle className="mx-4" size={24} />
        </div>
        <div className="text-sm">{DISCLAIMER_TEXT}</div>
        <div className="absolute -top-1 -right-1">
          <Button
            variant="link"
            className="w-12 h-12 px-2"
            onClick={() => setShow(false)}
          >
            <XCircle color="white" size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Disclaimer;
