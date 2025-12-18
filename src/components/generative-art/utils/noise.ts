
// Simple Perlin-like Noise implementation
export class SimpleNoise {
  private p: number[] = new Array(512);
  
  constructor() {
    const permutation = Array.from({ length: 256 }, (_, i) => i).sort(() => Math.random() - 0.5);
    for (let i = 0; i < 256; i++) {
      this.p[i] = this.p[i + 256] = permutation[i];
    }
  }

  private fade(t: number): number { return t * t * t * (t * (t * 6 - 15) + 10); }
  private lerp(t: number, a: number, b: number): number { return a + t * (b - a); }
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const A = this.p[X] + Y, AA = this.p[A], AB = this.p[A + 1];
    const B = this.p[X + 1] + Y, BA = this.p[B], BB = this.p[B + 1];

    return this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y),
                                     this.grad(this.p[BA], x - 1, y)),
                         this.lerp(u, this.grad(this.p[AB], x, y - 1),
                                     this.grad(this.p[BB], x - 1, y - 1)));
  }
}
