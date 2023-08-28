import { Card, CardContent, CardTitle } from "@/components/ui/card";

const Home = () => {
  return (
    <Card className="items-center flex flex-col items-center justify-center pt-8">
      <CardTitle className="mb-8">Unauthorized</CardTitle>
      <CardContent>
        If you think you should have access to this application, please make a
        request for access.
      </CardContent>
    </Card>
  );
};

export default Home;
