import { Heading, MainBar, MainBarAction } from "../../../kds/dist/esm/index"
import { LogoKelaWhite } from "../../../kds/dist/logos"

const Header = () => {

    return (
        <MainBar stackOnMobile={true}  className="relative">
        <MainBarAction as="a" href="/">
            <div className="flex items-center gap-4 border-slate-400">
                <img src={"/ai-icon.png"} className="h-8" />
                <Heading as="h1" className="text-white m-0">Kelalab GPT</Heading>
            </div>
        </MainBarAction>
    </MainBar>
    )
}
export default Header

/*
const Header = () => {
    return <div className="flex items-center gap-4 p-2 border-b-2 border-slate-400"><img src={"/ai-icon.png"} className="h-10" /><h1>KelalabGPT</h1></div>
}
export default Header*/