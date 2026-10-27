import { auth } from "@/infrastructure/auth/authOptions";
import { Wizard } from "@/app/components/wizard/Wizard";
import { Landing } from "@/app/components/landing/Landing";

export default async function Home() {
  const session = await auth();

  if (!session?.accessToken) {
    return <Landing />;
  }

  return (
    <main className="lp lp-main flex flex-1 flex-col justify-center">
      <Wizard />
    </main>
  );
}
