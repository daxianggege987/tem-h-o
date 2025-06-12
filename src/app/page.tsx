import OracleDisplay from "@/components/OracleDisplay";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body flex flex-col items-center pt-10 pb-20 px-4">
      <header className="text-center mb-10 md:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary">
          Temporal Harmony Oracle
        </h1>
        <p className="text-md sm:text-lg md:text-xl text-muted-foreground mt-3 md:mt-4 font-headline max-w-2xl mx-auto">
          Discover insights from the confluence of time and tradition. Your local time is used to calculate your momentary oracle.
        </p>
      </header>
      <OracleDisplay />
    </main>
  );
}
