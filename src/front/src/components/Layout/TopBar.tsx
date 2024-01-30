import { PropsWithChildren } from "react";

interface TopBarProps extends PropsWithChildren{
  title?: string;
  icon: any;
}

const TopBar = (props: TopBarProps) => {
  const { title, icon, children } = props;
  return (
    <div className="flex text-sky-500 border-b-2 w-full items-center justify-between p-2 px-8 gap-4 mb-4">
      <a href="/"><button className="border-2 px-2">Takaisin</button></a>
      <div className="flex gap-4 items-center w-36">
        {/*icon && <img src={icon} className="h-10" />*/}
        <h1 className="text-2xl underline-offset-8">{title}</h1>
      </div>
      <div className="flex flex-1 flex-col items-center">{children}</div>
      <div className="w-36"></div>
    </div>
  );
};
export default TopBar;
