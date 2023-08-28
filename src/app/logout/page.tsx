import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const Home = () => {
  return (
    <Card className="items-center flex flex-col items-center justify-center pt-8">
      <CardTitle className="mb-8">Logged out</CardTitle>
      <CardContent className="flex flex-col items-center justify-center">
        <p className="mb-2">
          You have successfully logged out of this application.
        </p>
        <Button>
          <Link
            href={{
              pathname: "/",
            }}
          >
            Back to login
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default Home;
