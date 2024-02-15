import { Sidebar as KelaSidebar, SidebarNavHeading as KDSSidebarNavHeading, SidebarNavItem as KDSSidebarNavItem } from "../../../kds/dist/esm/index";
import { IconCaretLeft } from "../../../kds/dist/icons/ui";
import { LogoKela, LogoKelaWhite } from "../../../kds/dist/logos"
import { Link, useLocation } from 'react-router-dom';
import MyBotsContext from "../../context/MyBotsContext";
import { useContext } from "react";
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { fetchMyBots } from "../../queries/bots";
import { Bot, Path } from "../../types";
import { makePaths } from "../../util";


const SidebarNavHeading = (props) => {
    return <KDSSidebarNavHeading {...props} className="dark:text-white dark:active:bg-kela-gray-80"/>
}

const SidebarNavItem = (props) => {
    return <KDSSidebarNavItem {...props} className={["dark:text-white dark:bg-transparent dark:hover:text-white dark:hover:bg-kela-gray-80 dark:aria-current:bg-kela-gray-80", props.className].join(' ')}/>
}

interface SideProps{
    isOpen?: boolean;
    setIsOpen?: any;
    dark?: boolean;
    className?: string;
}

const Side = (props: SideProps) => {
    const { isOpen, setIsOpen, dark, className } = props;
    //const {state, dispatch} = useContext(MyBotsContext);
    const query = useQuery({queryKey: ['myBots'], queryFn: fetchMyBots})

    //console.log('myBots in Side', state, dispatch)
    //const myBots = state.myBots;
    const myBots = query.data;
    const navTree: Path = {
        path: '/',
        name: 'Koti',
        children: [
            {
                name: 'Omat',
                children: [
                ]
            },
            {
                name: 'Toiminnot',
                children: [
                    {
                        path: '/chat/new',
                        name: 'Luo uusi avustaja'
                    }
                ]
            }
        ]
    }

    const root = navTree;
    let bots = myBots?.map((bot:Bot) => {return {name: bot.name, path: `/chat/${bot.id}`}})
    let myBotBranch:Path|undefined = navTree.children?.find(i => i.name == 'Omat');
    if(myBotBranch){
        myBotBranch.children = bots
    }
    let toolBranch:Path|undefined = navTree.children?.find(i => i.name == 'Toiminnot');


    /** 
     * Takes navtree and return a Map object containing all application paths 
     * @param root
     * @param path
    */
    /*const makePaths = (root:Path, path:string|undefined = undefined, parent: Path|undefined = undefined) => {
        console.log('makePaths', 'root', root, 'path', path, 'parent', parent);
        const paths=new Map<string, Path>()
        let rootPath = undefined
        if(!path){
            rootPath = root?.path;
        }else{
            rootPath = path;
        }
        root.parent = parent
        let _path = rootPath;
        //console.log('rootPath', rootPath)
        if(rootPath)
            paths.set(rootPath,root)
        if(root.children){
            root.children.forEach((p:Path) => {
                const child = p;
                const childPath = child.path;
                if(_path && childPath){
                    const childFullPath = (_path + childPath).replace('//','/');
                    const innerPaths = makePaths(child, childFullPath, root);
                    innerPaths.forEach((v,k) => paths.set(k,v))
                }else if(_path && !childPath){
                    //const childFullPath = (_path).replace('//','/');
                    const innerPaths = makePaths(child, undefined, root);
                    innerPaths.forEach((v,k) => paths.set(k,v))
                }
            })
        }
        else{
            let child = undefined;
            if (path){
                console.log('looking for child', path)
                child = paths.get(path);
            }
            if (child){
                const childFullPath = _path;
                child.path = childFullPath;
                console.log('parent', parent)
                if(!parent?.path && parent?.parent){
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
    }*/

    let paths: Map<string, Path> = makePaths(root);
    let currentLocation = useLocation().pathname;
    console.log('currentLocation', currentLocation);
    /*const id_match = currentLocation.match(/\/chat\/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)
    if(id_match){
        currentLocation = '/chat/:id'
    }*/
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
                    <hr/>
                    <SidebarNavHeading>Julkiset avustajat</SidebarNavHeading>
                    <hr/>
                    <SidebarNavHeading>Omat avustajat</SidebarNavHeading>
                    <ul >
                        <li>
                            {
                                myBotBranch?.children?.map((childPath: Path, idx) => {
                                return <SidebarNavItem as={Link} className="dark:bg-transparent dark:text-white dark:hover:bg-kela-gray-80 dark:hover:text-white" 
                                href={childPath?.path} to={childPath?.path}>{childPath?.name}</SidebarNavItem>
                            })}
                        </li>
                    </ul>
                    <hr/>
                    <SidebarNavHeading>Toiminnot</SidebarNavHeading>
                    <ul >
                        <li>
                            {
                                toolBranch?.children?.map((childPath: Path, idx) => {
                                return <SidebarNavItem as={Link} className="dark:bg-transparent dark:text-white dark:hover:bg-kela-gray-80 dark:hover:text-white" 
                                href={childPath?.path} to={childPath?.path}>{childPath?.name}</SidebarNavItem>
                            })}
                        </li>
                    </ul>
                </>} 
            />
}

export default Side;