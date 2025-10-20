export default function AnimatedGradient() {
  return (
    <div
      className="fixed inset-0 -z-10 
                 bg-[length:200%_200%] 
                 animate-[shift_15s_ease-in-out_infinite] 
                 bg-[radial-gradient(1200px_600px_at_0%_0%,#0a1b3d_0%,transparent_60%),radial-gradient(1000px_500px_at_100%_100%,#0d1220_0%,transparent_60%),linear-gradient(135deg,#020617_0%,#050c1a_100%)]"
    />
  );
}
