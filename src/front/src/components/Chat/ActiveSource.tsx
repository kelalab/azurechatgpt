import { PropsWithChildren } from "react";
import "./activesource.css";

interface SourceProps extends PropsWithChildren{
   activeSource: string;
   setActiveSource: Function;
}

const ActiveSource = (props: SourceProps) => {
  const { activeSource, setActiveSource } = props;
  //console.log("active source", activeSource);
  return (
    <div className="source__text">
      <div className="border-b-2 flex flex-col w-full p-2">
        <div className="self-end">
          <h2></h2>
          <button
            className="border-2 rounded-xl p-2"
            onClick={() => setActiveSource("")}
          >
            Sulje
          </button>
        </div>
      </div>
      <div className="p-2 px-4">
        {activeSource.split("\n").map((paragraph) => {
          return <p dangerouslySetInnerHTML={{ __html: paragraph }} />;
          //return <p safe={true}>{paragraph}</p>;
        })}
      </div>
    </div>
  );
};
export default ActiveSource;
