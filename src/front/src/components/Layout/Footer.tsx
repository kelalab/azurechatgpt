import { PropsWithChildren } from "react"

interface FooterProps extends PropsWithChildren{}

const Footer = (props: FooterProps) => {
    return <div className="flex items-center gap-4 p-2 dark:bg-slate-900">footer<span className="primary self-end">© Kelalab 2024</span></div>
}
export default Footer