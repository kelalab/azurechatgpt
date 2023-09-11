import { Card, CardContent, CardTitle } from "@/components/ui/card";

const Home = () => {
  return (
    <Card className="items-center flex flex-col items-center justify-center pt-8">
      <CardTitle className="mb-8">About this application</CardTitle>
      <CardContent className="flex flex-col justify-center">
        <h2 className="underline">UI</h2>
        <p className="mb-2 text-sm">
          The UI for this application is based on a previous design and was
          redesigned and improved by Kelalab.
        </p>
        <h2 className="underline">Backend</h2>
        <p className="mb-2 text-sm">
          Ai model behind this UI is based on Azure OpenAI and currently
          physically located in United States.
        </p>
      </CardContent>
    </Card>
  );
};

export default Home;
