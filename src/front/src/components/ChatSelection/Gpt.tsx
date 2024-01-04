import { PropsWithChildren } from "react";

interface GPTProps extends PropsWithChildren {
  name: string;
  icon: any;
  href: string;
}

const GPT = (props: GPTProps) => {
  const { icon, name, href } = props;
  return (
    <a href={href}>
      <div className="flex flex-col items-center p-2 gap-2 border-2 rounded-lg">
        <span>{icon}</span>
        <span>{name}</span>
      </div>
    </a>
  );
};
export default GPT;
