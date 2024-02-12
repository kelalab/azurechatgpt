import { TextareaProps } from '../../kds/dist';
import {Textarea as KDSTextarea} from '../../kds/dist/esm/index';

const Textarea = (props: TextareaProps) => {
    return <KDSTextarea {...props} className={["dark:bg-transparent dark:text-white dark:!border-kela-gray-30"].join(" ")}/>
}

export default Textarea