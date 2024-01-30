import { PropsWithChildren } from "react"
import Footer from "./Footer"
import Header from "./Header"

interface LayoutProps extends PropsWithChildren{}

/**
 * Base layout component
 * @param props 
 * @returns 
 */
const Layout = (props: LayoutProps) => {
    const {children} = props
    return (
        <div className="flex h-full flex-col">
            <Header/>
            <div className="flex-1">{children}</div>
            <Footer/>
        </div>);
}

export default Layout