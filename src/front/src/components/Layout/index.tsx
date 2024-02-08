import { PropsWithChildren, useState, useEffect } from "react"
import Footer from "./Footer"
import Header from "./Header"
import { Page, Container, Tabs, Tab as KDSTab } from "../../../kds/dist/esm/index"
import Sidebar from "./Sidebar"

interface LayoutProps extends PropsWithChildren{}

const Tab = (props) => {
    return <KDSTab {...props} className="dark:bg-transparent dark:text-white pt-6 pb-4 *:pb-2" /> 
}

/**
 * Base layout component
 * @param props 
 * @returns 
 */
const Layout = (props: LayoutProps) => {
    const [open, setOpen] = useState(true);
    const [dark, setDark] = useState(false)
    const {children} = props

    useEffect(() => {
        const theme_pref = window.matchMedia('(prefers-color-scheme: dark)').matches
        console.log('dark mode', theme_pref)
        if(theme_pref != dark){
            setDark(theme_pref)
        }
    }, [])

    return (
        <div className="dark:bg-kela-gray-90 dark:text-white min-h-full">
        {/*<Page
            className="h-full"
            isOpen
            pageToolbar={<Header/>}
            sidebar={
                <Sidebar isOpen={open} dark={dark}/>
            }
            layout={<div className="flex-1">{children}</div>}
            footer={<Footer/>}
        />*/}
        <Header/>
        <Tabs className="dark:bg-kela-blue-100">
            <Tab label="Koti"></Tab>
            <Tab label="Muokkaa avustajaa"></Tab>
            <Tab label="Keskusteluhistoria"></Tab>
        </Tabs>
        <Container className="py-0">
            <div className="flex flex-wrap min-h-full pt-[72px] -mt-[72px]">
                <div className="lg:flex-1 max-w-72">
                    <Sidebar className="relative h-full border-t-0" isOpen={open} dark={dark}/>
                </div>
                <div className="flex-1">
                    {children}
                    <Footer/>
                </div>
            </div>
        </Container>
        </div>);
}

export default Layout

//interface LayoutProps extends PropsWithChildren{}

/**
 * Base layout component
 * @param props 
 * @returns 
 */
// const Layout = (props: LayoutProps) => {
//     const {children} = props
//     return (
//         <div className="flex h-full flex-col">
//             <Header/>
//             <div className="flex-1">{children}</div>
//             <Footer/>
//         </div>);
// }

// export default Layout