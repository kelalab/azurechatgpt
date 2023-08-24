"use client";
import { DISCLAIMER_TEXT } from "@/features/theme/customise";
import { useState } from "react";
import { Button } from "../ui/button";
import { XCircle, AlertTriangle } from "lucide-react";

const Disclaimer = () => {
  const [show, setShow] = useState(true);
  return (
    <div
      className={`sticky flex items-center justify-center mt-2 ${
        show ? "visible" : "invisible h-0"
      }`}
    >
      <div className="flex items-center justify-center bg-warning rounded-md px-4 md:px-8">
        <div>
          <AlertTriangle className="mx-4" size={24} />
        </div>
        <div>{DISCLAIMER_TEXT}</div>
        <Button
          variant="link"
          className="w-12 h-12 px-2"
          onClick={() => setShow(false)}
        >
          <XCircle color="white" size={24} />
        </Button>
      </div>
    </div>
  );
};
export default Disclaimer;
