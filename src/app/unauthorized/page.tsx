"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { signOut } from "next-auth/react";

const Home = () => {
  const logOut = () => {
    signOut();
  };
  return (
    <Card className="items-center flex flex-col items-center justify-center pt-8">
      <CardTitle className="mb-8">Unauthorized</CardTitle>
      <CardContent className="flex flex-col items-center justify-center">
        <p className="mb-2">
          If you think you should have access to this application, please make a
          request for access.
        </p>
        <Button onClick={() => logOut()}>
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
