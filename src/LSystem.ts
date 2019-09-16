import {
  UnionType, UnionMemberByKind, UnionMatchObj, Merge,
  match
} from "./sumUtilities";
import * as R from 'ramda';
import {interpolateViridis} from 'd3-scale-chromatic';
import * as d3 from 'd3';

/*

  - Alphabet as types in a union
  - product alphabet in their own union (variables)
  - axiom/start : Array<Alphabet>

  type Axiom = Array<Alphabet>;

  rules = match<Variables, Axiom>({
    A: ({a}) => {},
    B: ({b}) => {}
  });

  applyRules = (rules) => (Axiom): Axiom => {

  };

*/

type Axiom<Alphabet> = Array<Alphabet>;

type Rules<Alphabet extends UnionType, Variables extends Alphabet> = {
  [K in Variables['kind']]: (lhs: UnionMemberByKind<Variables, K>) => Array<Axiom<Alphabet>>
};

type DeterministicRules<Alphabet extends UnionType, Variables extends Alphabet> = {
  [K in Variables['kind']]: (lhs: UnionMemberByKind<Variables, K>) => Axiom<Alphabet>
};

const flatMap = <T, R>(f: (_: T) => Array<R>) => (arr: Array<T>): Array<R> => (
  ([] as R[]).concat(
    ...arr.map(f)
  )
);

const LSystem = <Alphabet extends UnionType, Variables extends Alphabet>(
  selectRule: (rules: Array<Axiom<Alphabet>>) => Axiom<Alphabet>
) => (
  rules: Rules<Alphabet, Variables>
) => {
  type Matcher = UnionMatchObj<Variables, Axiom<Alphabet>>;

  const matchObj: Matcher = Object.keys(rules).reduce<Matcher>((consolidated, key: Variables['kind']) => {
    return {
      ...consolidated,
      [key]: (lhs: Variables) => selectRule(rules[key](lhs as any))
    };
  }, {} as Matcher);

  return {
    applyRules: (axiom: Axiom<Alphabet>): Axiom<Alphabet> => {
      const matchVariable = match<Variables, Axiom<Alphabet>>(matchObj);

      return flatMap((alpha: Alphabet) => {
        const kind: Alphabet['kind'] = alpha.kind;

        if (rules[kind]) {
          return matchVariable(alpha as Variables);
        }

        return [alpha];
      })(axiom);
    }
  }
};

const randomSelect = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

type Line = {
  x: number;
  y: number;
  length: number;
};

type A = {
  kind: 'A';
  color: number;
} & Line;


// type Merge<M, N> = Pick<M, Exclude<keyof M, N>> & N;
// type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;
type a = Merge<A, {kind: 'a'}>;

type B = {
  kind: 'B';
} & Line;

const A = (length: number, color: number, x: number, y: number): A => ({
  kind: 'A',
  length,
  color,
  x,
  y
});

const B = (length: number, x: number, y: number): B => ({
  kind: 'B',
  length,
  x,
  y
});

type CantorAlphabet = A | B;

type CantorAxiom = Axiom<CantorAlphabet>;

const testLSystem = LSystem<CantorAlphabet, CantorAlphabet>(
  randomSelect
)({
  'A': ({length: l, color: c, x, y}) => [
    [
      A(l / 3, c * 0.9, x            , y * 0.8),
      B(l / 3         , x - l / 3    , y * 0.8),
      A(l / 3, c * 0.9, x - 2 * l / 3, y * 0.8)
    ],
    [
      A(l / 3, c * 0.9, x            , y * 0.8),
      B(l / 3         , x - l / 3    , y * 0.8),
      A(l / 3, c * 0.9, x - 2 * l / 3, y * 0.8)
    ]
  ],
  'B': ({length: l, x, y}) => [
    [
      B(l / 3, x            , y * 0.8),
      B(l / 3, x - l / 3    , y * 0.8),
      B(l / 3, x - 2 * l / 3, y * 0.8),
    ]
  ]
});
// debugger;

const width = 512;
const height = 256;

const xScale = d3.scaleLinear().domain([1, 0]).range([0, width]);
const yScale = d3.scalePow().exponent(.5).domain([1, 0]).range([0, height]);
const colorScale = d3.scaleSequential(t => interpolateViridis(1 - t));

const svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const paint = match<CantorAlphabet, void>({
  'A': ({length: l, color: c, x, y}) => {
    svg.append('line')
      .attr('x1', xScale(x))
      .attr('y1', yScale(y))
      .attr('x2', xScale(x - l))
      .attr('y2', yScale(y))
      .style('stroke', colorScale(c))
      .style('stroke-width', '5px');
  },
  'B': ({length: l, x, y}) => {
    svg.append('line')
      .attr('x1', xScale(x))
      .attr('y1', yScale(y))
      .attr('x2', xScale(x - l))
      .attr('y2', yScale(y - l))
      .style('stroke', 'white')
      .style('stroke-width', '5px');
  }
});

let initAxiom: CantorAxiom = [A(1, 1, 1, 1)];

const res = d3.range(9).reduce<CantorAxiom>((prevAxiom, _) => {
  prevAxiom.forEach(paint);

  return testLSystem.applyRules(prevAxiom);
}, initAxiom);

// Try sierpinski
