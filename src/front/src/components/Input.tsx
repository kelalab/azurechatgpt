import { InputProps } from '../../kds/dist';
import {Input as KDSInput} from '../../kds/dist/esm/index';

const Input = (props: InputProps) => {
    return <KDSInput {...props} className={["dark:bg-transparent dark:text-white dark:border-kela-gray-30"].join(" ")}/>
}

export default Input