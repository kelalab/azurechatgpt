import { PropsWithChildren } from "react";
import { Card, CardIcon, CardBody, CardTitle, Text, CardImage, Button } from '../../../kds/dist/esm'
import { IconCaretRight } from '../../../kds/dist/icons/ui'
import { InputGroup } from "../../../kds/dist/esm";

export interface GPTProps extends PropsWithChildren {
  name?: string;
  description?: string;
  icon?: any;
  image?: string;
  href?: string;
  edit?: boolean;
}

const GPT_ = (props: GPTProps) => {
  const { icon, name, description, href, edit } = props;
  return (
    <a href={href}>
      <div className="flex flex-col items-center w-64 h-72">
        <div className="w-64 h-48 flex flex-col items-center justify-center dark:bg-slate-900 rounded-t-lg">{icon}</div>
        <div className="w-64 h-32 flex flex-col justify-center px-2 h-16 dark:bg-slate-800 rounded-b-lg">
          <h3 className="text-slate-300">{name}</h3>
          <p className="text-sm">{description}</p>  
        </div>
      </div>
    </a>
  );
};

const GPT = (props: GPTProps) => {
  const { icon, image, name, description, href, edit } = props;

  const handleDelete = () => {
    console.log('delete handler')
  }

  return (
    <Card  className="max-w-72 dark:border-kela-gray-80 ">
      {icon && <CardIcon className="bg-success-green-40">
        {icon}
      </CardIcon>}
      {image && <CardImage className="max-h-48 overflow-hidden" src={image}></CardImage>}
      
      <CardBody className="dark:bg-kela-gray-90">
        <CardTitle className="dark:text-white">{name}</CardTitle>
        <Text>{description}</Text>
        <InputGroup className="flex flex-wrap gap-4">
          <Button as="a" href={href} iconAfter={<IconCaretRight />}>Aloita</Button>
          {edit && 
            <>
              <Button appearance="outline" className="dark:bg-transparent dark:text-white">Muokkaa</Button>
              <Button variant="danger" appearance="outline" className="dark:bg-transparent" onClick={handleDelete}>Poista</Button>
            </>
          }
        </InputGroup>
      </CardBody>
    </Card>
  );
}

export default GPT;
