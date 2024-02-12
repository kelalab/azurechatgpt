import { PropsWithChildren } from "react"
import { Footer as KelaFooter, Container, FooterCopyright } from '../../../kds/dist/esm/index';

interface FooterProps extends PropsWithChildren{}

const Footer = (props: FooterProps) => {
    return <KelaFooter isLegacy={false} isCopyrightOnly={true}>
                <Container maxWidth="2xl" fluid={true}>
                    <FooterCopyright>© Kelalab 2024</FooterCopyright>
                </Container>
            </KelaFooter>
}
export default Footer