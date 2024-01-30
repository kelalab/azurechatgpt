import { PropsWithChildren } from "react";

export interface GPTProps extends PropsWithChildren {
  name?: string;
  description?: string;
  icon?: any;
  href?: string;
}

const GPT = (props: GPTProps) => {
  const { icon, name, description, href } = props;
  return (
    <a href={href}>
      <div className="flex flex-col items-center w-56 h-72">
        <div className="w-56 h-48 flex flex-col items-center justify-center dark:bg-slate-900 rounded-t-lg">{icon}</div>
        <div className="w-56 h-32 flex flex-col justify-center px-2 h-16 dark:bg-slate-800 rounded-b-lg">
          <h3 className="text-slate-300">{name}</h3>
          <p className="text-sm">{description}</p>  
        </div>
      </div>
    </a>
  );
};
export default GPT;
