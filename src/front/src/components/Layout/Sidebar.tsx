import { Sidebar as KelaSidebar, SidebarNavHeading as KDSSidebarNavHeading, SidebarNavItem as KDSSidebarNavItem } from "../../../kds/dist/esm/index";
import { IconCaretLeft } from "../../../kds/dist/icons/ui";
import { LogoKela, LogoKelaWhite } from "../../../kds/dist/logos"
import { useLocation } from 'react-router-dom';

const SidebarNavHeading = (props) => {
    return <KDSSidebarNavHeading {...props} className="dark:text-white dark:active:bg-kela-gray-80"/>
}

const SidebarNavItem = (props) => {
    return <KDSSidebarNavItem {...props} className={["dark:text-white dark:bg-transparent dark:hover:text-white dark:hover:bg-kela-gray-80 dark:aria-current:bg-kela-gray-80", props.className].join(' ')}/>
}

const Side = (props) => {
    const { isOpen, setIsOpen, dark, className } = props;

    const navTree = {
        path: '/',
        name: 'Koti',
        children: [
            {
                path: '/chat/new',
                name: 'Luo uusi avustaja'
            }
        ]
    }

    const root = navTree;

    interface Path {
        path: string;
        name?: string;
        children?: Path[];
        parent?: Path;
    }

    /** 
     * Takes navtree and return a Map object containing all application paths 
     * @param root
     * @param path
    */
    const makePaths = (root:Path, path:string|undefined = undefined, parent: Path|undefined = undefined) => {
        const paths=new Map<string, Path>()
        let rootPath = ''
        if(!path){
            rootPath = root.path;
        }else{
            rootPath = path;
        }
        root.parent = parent
        let _path = rootPath;
        //console.log('rootPath', rootPath)
        paths.set(rootPath,root)
        if(root.children){
            root.children.forEach((p:Path) => {
                const child = p;
                const childPath = child.path;
                const childFullPath = (_path + childPath).replace('//','/');
                const innerPaths = makePaths(child, childFullPath, root);
                innerPaths.forEach((v,k) => paths.set(k,v))
            })
        }
        else{
            /** End of branch */
            let child = undefined;
            if (path)
                child = paths.get(path);
            if (child){
                const childFullPath = _path;
                child.path = childFullPath;
                if(!parent?.name && parent?.parent){
                    child.parent = parent.parent;
                }
                else child.parent = parent;
                console.log('child', child)
                paths.set(child.path, child)
                return paths
                //return child
            }
        }
        console.log('paths', paths)
        return paths
    }

    let paths: Map<string, Path> = makePaths(root);
    let currentLocation = useLocation().pathname;
    console.log('currentLocation', currentLocation);
    const currentPath = paths.get(currentLocation);
    
    if(currentPath){
        console.log('currentPath', currentPath)
    }
    /*let keys: string[] = []
    if(currentPath?.children){
        let children: Path|undefined = currentPath?.children
        if(!currentPath?.children?.name){
            console.log('children', children)
            children = children.children
            console.log('children', children)
        }
        if(children){
            keys = Object.keys(children);
        }
    }*/

    return <KelaSidebar
            className={["dark:bg-kela-gray-90 hidden lg:block", className].join(' ')}
            aria-label="Päänavigaatio"
            logo={<a href="#" aria-label="Etusivulle" className="kds-inline-block">
                    { dark ? <LogoKelaWhite height="48" width="175"/> : <LogoKela height="48" width="175" /> }
                 </a>} 
            isOpen={isOpen}

            toggle={() => setIsOpen(!isOpen)}
            navLinks={
                <>
                    <>
                        {currentPath?.parent && <SidebarNavItem className="return dark:text-white dark:bg-transparent mb-2" href={currentPath.parent.path} preventAutoToggle iconBefore={<IconCaretLeft />}><span>{currentPath.parent.name}</span></SidebarNavItem>}
                        <SidebarNavItem active={true}><SidebarNavHeading >{currentPath?.name}</SidebarNavHeading></SidebarNavItem>
                    </>
                    <ul >
                        <li>
                            {
                                currentPath?.children?.map((childPath: Path, idx) => {
                                return <SidebarNavItem className="dark:bg-transparent dark:text-white dark:hover:bg-kela-gray-80 dark:hover:text-white" 
                                href={childPath?.path}>{childPath?.name}</SidebarNavItem>
                            })}
                        </li>
                    </ul>
                    <hr/>
                    <SidebarNavHeading>Oikopolut</SidebarNavHeading>
                </>} 
            />
}

export default Side;