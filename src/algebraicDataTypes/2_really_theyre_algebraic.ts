type A = {a: number};
type B = {b: number};
type C = {c: string};

type X = A & (B | C);
type Y = (A & B) | (A & C);

type U = A & (B | C)

(x: X, y: Y) => {
  x = y;
}
