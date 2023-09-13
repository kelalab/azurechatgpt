import Typography from "@/components/typography";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const Home = () => {
  return (
    <Card className="items-center flex flex-col items-center justify-center pt-8">
      <CardTitle className="mb-8">
        <Typography variant="h2" className="text-primary">
          Tietoa tästä sovelluksesta
        </Typography>
      </CardTitle>
      <CardContent className="flex flex-col justify-center">
        <Typography variant="h3" className="text-primary">
          <h2>UI</h2>
        </Typography>
        <p className="mb-2 text-sm">
          Tämä käyttöliittymä on Kelalabin muokkaama ja parantama.
          Käyttöliittymää jakeleva palvelu sijaitsee Ruotsissa.
        </p>
        <Typography variant="h3" className="text-primary">
          <h2>Backend</h2>
        </Typography>
        <p className="mb-2 text-sm">
          Käyttöliittymä kutsuu erinäisiä palveluita, jotka tällä erää
          sijaitsevat Amerikassa. Taustalla käytössä on Azuren OpenAI
          tekoälymallit.
        </p>
        <Typography variant="h3" className="text-primary">
          <h2>Huomioita chatin käytöstä</h2>
        </Typography>
        <p>
          Chat-keskustelut tallennetaan 30 päivän ajaksi ja mikäli niissä
          havaitaan käyttöehtojen ja käyttösääntöjen vastaisia sisältöjä, se voi
          johtaa käyttäjän tai jopa koko käyttäjäorganisaation käyttöoikeuksien
          peruuttamiseen ja mahdollisiin muihin laillisiin ja/tai taloudellisiin
          seuraamuksiin.
        </p>
        <p>
          Erityisesti Chat-keskusteluissa ei sallita vihapuhetta, syrjintää,
          seksuaalista sisältöä, väkivaltaisia tai aseiden kuvauksia eikä
          itsetuhoisuutta koskevia ilmaisuja.
        </p>
        <p>
          Katso tarkemmin
          <a
            href="https://learn.microsoft.com/fi-FI/legal/cognitive-services/openai/code-of-conduct"
            className="text-primary"
          >
            Code of Conduct for the Azure OpenAI Service | Microsoft Learn
          </a>
        </p>
      </CardContent>
    </Card>
  );
};

export default Home;
