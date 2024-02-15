import { Path } from "./types";

export const makePaths = (element: Path, path: string | undefined = undefined, parent: Path | undefined = undefined) => {
    console.log('makePaths', 'element:', element, 'path:', path, 'parent:', parent);
    const paths = new Map<string, Path>()
    if (!element.path) {
        //do nothing here, we do not add elements that don't have a path
        //console.log('element has no own path');
    }
    else {
        paths.set(element.path, element)
    }
    if(element.children){
        element.children.forEach((child:Path) => {
            //check over one level for a parent page with a path
            if(element?.path){
                child.parent = element;
            }else if(element?.parent){
                child.parent = element.parent
            }
            const childPaths = makePaths(child)
            //console.log('childPaths', childPaths)
            childPaths.forEach((v, k) => paths.set(k, v))
        });
    }
    console.log('paths', paths)
    return paths;
}