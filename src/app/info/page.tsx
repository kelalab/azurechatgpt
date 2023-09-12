import { Card, CardContent, CardTitle } from "@/components/ui/card";

const Home = () => {
  return (
    <Card className="items-center flex flex-col items-center justify-center pt-8">
      <CardTitle className="mb-8">About this application</CardTitle>
      <CardContent className="flex flex-col justify-center">
        <h2 className="underline">UI</h2>
        <p className="mb-2 text-sm">
          Tämä käyttöliittymä on Kelalabin muokkaama ja parantama.
          Käyttöliittymää jakeleva palvelu sijaitsee Ruotsissa.
        </p>
        <h2 className="underline">Backend</h2>
        <p className="mb-2 text-sm">
          Käyttöliittymä kutsuu erinäisiä palveluita, jotka tällä erää
          sijaitsevat Amerikassa. Taustalla käytössä on Azuren OpenAI
          tekoälymallit.
        </p>
      </CardContent>
    </Card>
  );
};

export default Home;
