// import * as R from 'ramda';
// import Maybe from './Maybe';
// import { stringify } from 'querystring';

// const chooseOne = <T>(arr: Array<T>): T => (
//   arr[Math.floor(Math.random() * arr.length)]
// );

// type Tangle<T> = Knot<T> | Cord<T> | Strand<T>;
// type Untangled<T> = {
//   kind: 'untangled';
//   untangledStrands: {
//     [strandName: string]: T
//   }
// };

// type Knot<T> = {
//   kind: 'knot';
//   cords: Array<Cord<T>>;
//   strands: {
//     [name: string]: Strand<T>
//   }
// };

// type BindingF<T> = (_: Strand<T>, __: Strand<T>) => boolean;
// type Cord<T> = {
//   kind: 'cord';
//   strands: [Strand<T>, Strand<T>];//[string, string]
//   binding: BindingF<T>;
// };

// type Strand<T> = TerminalStrand<T> | MidStrand<T>;

// type StrandInnards<T> = {
//   name: string;
//   field: Array<T>;
// };

// type TerminalStrand<T> = {
//   kind: 'terminal-strand';
// } & StrandInnards<T>;

// type MidStrand<T> = {
//   kind: 'mid-strand';
//   before: Strand<T>
// } & StrandInnards<T>;

// const Knot = <T>(
//   ...strands: Array<Strand<T>>
// ) => (
//   ...cords: Array<Cord<T>>
// ): Knot<T> => {
//   const strandsGrouped = R.groupBy(R.prop('name'), strands);

//   // Check for validity
//   for (let name in strandsGrouped) {
//     if (strandsGrouped[name].length > 1) {
//       throw new Error(`Cannot specify more than one Strand for name "${name}"`);
//     }
//   }

//   return {
//     kind: 'knot',
//     cords,
//     strands: R.mapObjIndexed((strandsForName, name) => strandsForName[0], strandsGrouped)
//   };
// };

// const Cord = <T>(
//   binding: BindingF<T>
// ) => (
//   ...strands: [Strand<T>, Strand<T>]
// ): Cord<T> => ({
//   kind: 'cord',
//   strands: strands,
//   binding
// });

// const Strand = <T>(
//   ...values: Array<T>
// ) => (
//   name: string
// ): Strand<T> => {
//   return {
//     kind: 'strand',
//     name,
//     field: values
//   };
// };

// const Untangled = <T>(untangledStrands: {[strandName: string]: T}): Untangled<T> => ({
//   kind: 'untangled',
//   untangledStrands
// });

// const UntangledMix = <T>(a: Untangled<T>, b: Untangled<T>): Untangled<T> => ({
//   kind: 'untangled',
//   untangledStrands: R.mergeWith()
// });

// const foldTangle = <T, R>(
//   onStrand: (_: Strand<T>) => R,
//   onCord: (_: Cord<T>) => R,
//   onKnot: (_: Knot<T>) => R
// ) => (
//   tangle: Tangle<T>
// ): R => {
//   switch (tangle.kind) {
//     case 'strand': return onStrand(tangle);
//     case 'cord'  : return onCord(tangle);
//     case 'knot'  : return onKnot(tangle);
//   }
// };

// type UnionMatchObj<U extends {kind: string}, Ret> = {
//   [P in U['kind']]: (unionMember: Extract<U, {kind: P}>) => Ret
// };
// type Obj1<T> = UnionMatchObj<Tangle<T>, number>;
// const obj: Obj1<number> = {
//   'knot'           : (knot: Knot<number>) => 1,
//   'cord'           : (cord: Cord<number>) => 2,
//   'terminal-strand': (strand: TerminalStrand<number>) => 3,
//   'mid-strand'     : (strand: MidStrand<number>) => 4,
// };

// const makeMatcher = <U extends {kind: string}, RetT>(fObj: UnionMatchObj<U, RetT>) => (thing: U) => {
//   const kind: U['kind'] = thing.kind;

//   return fObj[kind](thing as any);
// };

// const untangle = <T>(
//   tangle: Tangle<T>, untanglement: Untangled<T> = Untangled<T>({})
// ): Tangle<T> | Untangled<T> => {
//   const helper = (untanglePoint: )

//   return foldTangle<T>(
//     (strand: Strand<T>): Untangled<T> => {
//       return Untangled<T>({[strand.name]: chooseOne(strand.field)});
//     },
//     (cord: Cord<T>) => {
//       R.xprod(...cord.strands.map(name => ));

//       /*
//     cross = cross p.field with entanglement.other.field as <domain, range>
//     consistents = filter cross where <domain, range> satisfies entanglement.f
//     rangeField = consistents at <range>

//     entanglementConstrained = recur (entanglement.other where field = rangeField)

//     constrainedDomainField = map <domain> from (filter consistents where <range> in entanglementConstrained)

//     p = p where field = constrainedDomainField

//     return constrainedDomainField

//       */
//     },
//     (knot: Knot<T>) => {
//       knot.cords.forEach(cord => {
//         untangle(cord)
//       });
//     }
//   )(tangle)
// };

// const Tangle = {
//   Strand,
//   Cord,
//   Knot
// }

// /*


// start at terminal particles with only fields and no trailing entanglements
// for each p
//   constrainedField = recur p

// recur p
//   if no leading entanglements
//     return <choose 1 from p.field>

//   for each leading entanglement in p
//     cross = cross p.field with entanglement.other.field as <domain, range>
//     consistents = filter cross where <domain, range> satisfies entanglement.f
//     rangeField = consistents at <range>

//     entanglementConstrained = recur (entanglement.other where field = rangeField)

//     constrainedDomainField = map <domain> from (filter consistents where <range> in entanglementConstrained)

//     p = p where field = constrainedDomainField

//     return constrainedDomainField



// recur p
//   if no leading entanglement in p
//     return <choose 1 from p.field>

//   entanglement = leading entanglement in p

//   cross = cross p.field with entanglement.other.field as <domain, range>
//   consistents = filter cross where <domain, range> satisfies entanglement.f
//   rangeField = consistents at <range>

//   entanglementConstrained = recur (entanglement.other where field = rangeField)

//   constrainedDomainField = map <domain> from (filter consistents where <range> in entanglementConstrained)

//   return recur (p.previous where field = constrainedDomainField)


// */