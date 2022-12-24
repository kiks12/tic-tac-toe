import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Waiting: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/");
  }, []);
  return <div></div>;
};

export default Waiting;
