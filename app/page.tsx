import AnimatedEyes from "./components/AnimatedEyes";
import LoadingBar from "./components/LoadingBar";

export const metadata = {
  title: "Něco se blíží",
  description: "Něco se blíží.",
};

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #431407, #9a3412, #c2410c)",
        fontFamily: "'Inter', sans-serif",
        gap: 48,
      }}
    >
      <AnimatedEyes />

      <LoadingBar />
    </main>
  );
}
