"use client";
import { useEffect, useState } from "react";
import { MainMenu } from "./menu/menu";
import Cookies from "universal-cookie";

const InfoLayout = ({ children }: { children: React.ReactNode }) => {
  const cookies = new Cookies(null, { path: "/" });
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);

  useEffect(() => {
    const load = async () => {
      const _show = cookies.get("showDisclaimer");
      console.log("show", _show);
      if (_show !== undefined) setDisclaimerVisible(_show);
    };
    load();
  }, []);

  return (
    <>
      {disclaimerVisible ? (
        <div className="grid grid-cols-1 h-full w-full max-h-screen overflow-hidden">
          <div className="grid-cols-1 row-span-4 grid md:grid-cols-24 auto-rows-max md:auto-rows-auto h-full max-h-[88vh] md:max-h-[86vh] lg:max-h-[88vh] gap-2">
            <div className="md:flex">
              <MainMenu />
            </div>
            <div className="md:col-span-16 flex flex-1">{children}</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 h-full w-full max-h-screen overflow-hidden">
          <div className="grid-cols-1 row-span-4 grid md:grid-cols-24 auto-rows-max md:auto-rows-auto h-full max-h-[88vh] md:max-h-[86vh] lg:max-h-[88vh] gap-2">
            <div className="md:flex">
              <MainMenu />
            </div>
            <div className="md:col-span-16 flex flex-1">{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoLayout;
