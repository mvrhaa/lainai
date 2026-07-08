interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.22),transparent_20%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-foreground/70 shadow-sm shadow-slate-900/10 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Modern AI workspace built for productivity
          </div>
        </div>
        <div className="overflow-hidden rounded-4xl border border-white/10 bg-card/95 shadow-2xl shadow-slate-900/15 backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
