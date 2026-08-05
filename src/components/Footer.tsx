export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="wrap py-10">
        <div className="plate-divider mb-8">
          <span className="plate-dot" />
          <span className="plate-dot" />
          <span className="plate-dot" />
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-lg tracking-widest2 text-ink">
              CHRISTDALE
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Equipment and coaching for training with nothing but a bar, a
              set of rings, and your own bodyweight.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 font-mono text-sm uppercase tracking-wide text-muted">
            <div className="flex flex-col gap-2">
              <span className="text-ink">Shop</span>
              <a href="/products" className="hover:text-accent">
                All Products
              </a>
              <a href="/products" className="hover:text-accent">
                Rings &amp; Bars
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-ink">Coaching</span>
              <a href="/coaches" className="hover:text-accent">
                Find a Coach
              </a>
              <a href="/contact" className="hover:text-accent">
                Get In Touch
              </a>
            </div>
          </div>
        </div>

        <p className="mt-10 font-mono text-xs uppercase tracking-widest2 text-muted">
          © {new Date().getFullYear()} Christdale. Train with intent.
        </p>
      </div>
    </footer>
  );
}
