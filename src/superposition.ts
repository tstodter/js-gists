import * as R from 'ramda';
import xprod from 'ramda/es/xprod';


///                                                                         ///
/////////                                                             /////////
///////////////////////////////////////////////////////////////////////////////
/////////                                                             /////////
///                                                                         ///

type Maybe<T> = Some<T> | None;

type Some<T> = {
  kind: 'some';
  val: T;
};

type None = {
  kind: 'none';
};

const Some = <T>(val: T): Some<T> => ({
  kind: 'some',
  val
});

const None = (): None => ({
  kind: 'none'
});

const isMaybe = <T>(maybeMaybe: void | T | Maybe<T>): maybeMaybe is Maybe<T> => (
  !!maybeMaybe && 'kind' in maybeMaybe && (
    maybeMaybe.kind === 'some' || maybeMaybe.kind === 'none'
  )
);

const maybeFold = <T, R>(
  onNone: () => R,
  onSome: (_: T) => R
) => (
  mb: Maybe<T>
): R => {
  switch (mb.kind) {
    case 'none': return onNone();
    case 'some': return onSome(mb.val);
  }
};

const Maybe = Object.assign(
  <T>(val: T | void | Maybe<T>) => ({
    map: <R>(mapping: (v: T) => R | void): Maybe<R> => {
      return maybeFold<T, Maybe<R>>(
        None,
        (v: T) => Maybe.of(mapping(v))
      )(Maybe.of(val));
    },
    fold: <R>(
      onNone: () => R,
      onSome: (_: T) => R
    ): R => maybeFold(
      onNone, onSome
    )(Maybe.of(val))
  }),
  {
    of: <T>(val: T | void | Maybe<T>) => {
      if (isMaybe(val)) return val;
      if (val === null || val === undefined) return None();
      return Some(val);
    },
    map: <T, R>(mapping: (v: T) => R | void) => (mb: Maybe<T>): Maybe<R> => {
      return maybeFold<T, Maybe<R>>(
        None,
        (v: T) => Maybe.of(mapping(v))
      )(mb);
    },
    fold: maybeFold
  }
);


///                                                                         ///
/////////                                                             /////////
///////////////////////////////////////////////////////////////////////////////
/////////                                                             /////////
///                                                                         ///


type ConstraintF<T> = (_: T) => boolean;
type Entanglement<T> = [Superposition<T>, ConstraintF<T>];

type Superposition<T> = CollapsedValue<T> | UnobservedValue<T> | Paradox<T>;

type CollapsedValue<T> = {
  kind: 'collapsed';
  before: Maybe<Superposition<T>>;
  collapsedValue: T;
};

type UnobservedValue<T> = {
  kind: 'unobserved';
  before: Maybe<Superposition<T>>;
  entanglement: Maybe<Entanglement<T>>;
  possibleValues: Array<T>;
};

type Paradox<T> = {
  kind: 'paradox';
  before: Maybe<Superposition<T>>;
};

const isSuperposition =
  <T>(maybeSuperpos: void | T | Superposition<T>): maybeSuperpos is Superposition<T> => (
    !!maybeSuperpos && 'kind' in maybeSuperpos && (
      maybeSuperpos.kind === 'collapsed' ||
      maybeSuperpos.kind === 'unobserved' ||
      maybeSuperpos.kind === 'paradox'
    )
  );

const CollapsedValue = <T>(collapsedValue: T): CollapsedValue<T> => ({
  kind: 'collapsed',
  before: None(),
  collapsedValue
});

const UnobservedValue = <T>(...possibleValues: Array<T>): UnobservedValue<T> => ({
  kind: 'unobserved',
  before: None(),
  entanglement: None(),
  possibleValues
});

const Paradox = <T>(before?: Superposition<T>): Paradox<T> => ({
  kind: 'paradox',
  before: before === undefined || before === null
    ? None()
    : Some(before)
});

const SuperpositionAfter = <T>(
  before: Superposition<T>
) => (
  superpos: Superposition<T>
): Superposition<T> => ({
  ...superpos,
  before: Some(before)
});

const EntangleSuperposition = <T>(
  otherParticle: Superposition<T>, entangle: ConstraintF<T>
) => (
  particle: Superposition<T>
): Superposition<T> => {
  return superpositionMatch<T, Superposition<T>>(
    (collVal: CollapsedValue<T>) => collVal,
    (unobservedVal: UnobservedValue<T>): UnobservedValue<T> => ({
      ...unobservedVal,
      entanglement: Some([otherParticle, entangle])
    }),
    (paradoxVal: Paradox<T>) => paradoxVal
  )(particle);
};

const superpositionMatch = <T, R>(
  onCollapsed : (_: CollapsedValue<T>) => R,
  onUnobserved: (_: UnobservedValue<T>) => R,
  onParadox   : (_: Paradox<T>) => R
) => (
  superpos: Superposition<T>
): R => {
  switch (superpos.kind) {
    case 'collapsed' : return onCollapsed(superpos);
    case 'unobserved': return onUnobserved(superpos);
    case 'paradox'   : return onParadox(superpos);
  }
};

const observeSuperposition = <T>(
  onCollapse: (realValue: T) => T,
  onParadox: (...lastCoherentValues: Array<T>) => T
) => (
  superpos: Superposition<T>
): Superposition<T> => Superposition.match<T, Superposition<T>>(
  (collapsedVal: CollapsedValue<T>) => {
    return CollapsedValue(onCollapse(collapsedVal.collapsedValue));
  },
  (unobservedVal: UnobservedValue<T>) => {
    // Filter by unobservedVal.constraint
    // if filtered is empty, observe paradox
    //
    // if unobserved.parent
    //   observeSuperposition(parent)
    //   return recur by SuperpositionAfter(unobservedVal.parent)(Superposition.of(...filtered))
    // else
    //   narrow down from filtered

    const constrainedPossibilities = Maybe(unobservedVal.constraint).fold<Array<T>>(
      () => {
        const randomIdx = Math.floor(Math.random() * unobservedVal.possibleValues.length);
        return [unobservedVal.possibleValues[randomIdx]];
      },
      (constraint) => unobservedVal.possibleValues.filter(constraint)
    );
// above is wrong, need to only collapse when 1) there is no parent, and 2) there is no constraint
    const recur = Superposition.observe(onCollapse, onParadox);
    return Maybe(unobservedVal.before).fold<Superposition<T>>(
      () => recur(
        Superposition.of(...constrainedPossibilities)
      ),
      (before) => SuperpositionAfter(before)(
        Superposition.of(...constrainedPossibilities)
      )
    );

    return Superposition.observe(onCollapse, onParadox)(constrainedSuperposition);
  },
  (paradox: Paradox<T>) => {

  }
)(superpos);

const Superposition = Object.assign(
  <T>(...vals: Array<T> ) => {
    const thisSuperpos = isSuperposition(vals[0])
      ? vals[0]
      : Superposition.of(...vals);

    return {
      // map: <R>(mapping: (v: T) => R | void): Maybe<R> => {
      //   return maybeFold<T, Maybe<R>>(
      //     None,
      //     (v: T) => Maybe.of(mapping(v))
      //   )(Maybe.of(val));
      // },
      // fold: <R>(
      //   onNone: () => R,
      //   onSome: (_: T) => R
      // ): R => maybeFold(
      //   onNone, onSome
      // )(Maybe.of(val))
    };
  },
  {
    of: <T>(...possibleValues: Array<T>): Superposition<T> => {
      if (possibleValues.length === 0) {
        return Paradox<T>();
      }
      if (possibleValues.length === 1) {
        return CollapsedValue<T>(possibleValues[0]);
      }
      return UnobservedValue<T>(...possibleValues);
    },
    after: SuperpositionAfter,
    constrain: ConstrainSuperposition,
    match: superpositionMatch,
    observe: <T>(
      onCollapse: (realValue: T) => T,
      onParadox: (...lastCoherentValues: Array<T>) => T
    ) => (
      superpos: Superposition<T>
    ): Superposition<T> => {
      return Superposition.match<T, Superposition<T>>(
        (collapsedVal: CollapsedValue<T>) => CollapsedValue(onCollapse(collapsedVal.collapsedValue)),
        (unobservedVal: UnobservedValue<T>) => {
          const constrainedPossibilities = Maybe(unobservedVal.constraint).fold<Array<T>>(
            () => {
              const randomIdx = Math.floor(Math.random() * unobservedVal.possibleValues.length);
              return [unobservedVal.possibleValues[randomIdx]];
            },
            (constraint) => unobservedVal.possibleValues.filter(constraint)
          );
  // above is wrong, need to only collapse when 1) there is no parent, and 2) there is no constraint
          const recur = Superposition.observe(onCollapse, onParadox);
          return Maybe(unobservedVal.before).fold<Superposition<T>>(
            () => recur(
              Superposition.of(...constrainedPossibilities)
            ),
            (before) => SuperpositionAfter(before)(
              Superposition.of(...constrainedPossibilities)
            )
          );

          return Superposition.observe(onCollapse, onParadox)(constrainedSuperposition);
        }

        Maybe.fold<Superposition<T>, Superposition<T>>(
          () => {
            if (unobservedVal.constraint.kind === 'some') {
              const constraint = unobservedVal.constraint.val;
              const constrained = Superposition.of(
                ...unobservedVal.possibleValues.filter(constraint)
              );

              return Superposition.observe(onCollapse, onParadox)(
                constrained
              );
            } else {
              const randomIdx = Math.floor(Math.random() * unobservedVal.possibleValues.length);
              return Superposition.of(
                unobservedVal.possibleValues[randomIdx]
              );
            }
          },
          (_) => { throw 'TODO'; }
        )(unobservedVal.before),
        // Maybe.map<Superposition<T>, Superposition<T>>(
        //   (v) => {}
        // )(unobservedVal.before),

        // Maybe.fold<T, Superposition<T>>(
        //   () => {
        //     return unobservedVal.;
        //   },
        //   (_: T) => {}
        // )(unobservedVal.before),
        (paradox: Paradox<T>) => paradox // TODO
      )(superpos);
    }
  }
);

const Superposition = {
  of: <T>(...possibleValues: Array<T>): Superposition<T> => {
    if (possibleValues.length === 0) {
      return Paradox<T>();
    }
    if (possibleValues.length === 1) {
      return CollapsedValue<T>(possibleValues[0]);
    }
    return UnobservedValue<T>(...possibleValues);
  },
  after: SuperpositionAfter,
  constrain: ConstrainSuperposition,
  match: superpositionMatch,
  observe: <T>(
    onCollapse: (realValue: T) => T,
    onParadox: (...lastCoherentValues: Array<T>) => T
  ) => (
    superpos: Superposition<T>
  ): Superposition<T> => {
    return Superposition.match<T, Superposition<T>>(
      (collapsedVal: CollapsedValue<T>) => CollapsedValue(onCollapse(collapsedVal.collapsedValue)),
      (unobservedVal: UnobservedValue<T>) => {
        const constrainedPossibilities = Maybe(unobservedVal.constraint).fold<Array<T>>(
          () => {
            const randomIdx = Math.floor(Math.random() * unobservedVal.possibleValues.length);
            return [unobservedVal.possibleValues[randomIdx]];
          },
          (constraint) => unobservedVal.possibleValues.filter(constraint)
        );
// above is wrong, need to only collapse when 1) there is no parent, and 2) there is no constraint
        const recur = Superposition.observe(onCollapse, onParadox);
        return Maybe(unobservedVal.before).fold<Superposition<T>>(
          () => recur(
            Superposition.of(...constrainedPossibilities)
          ),
          (before) => SuperpositionAfter(before)(
            Superposition.of(...constrainedPossibilities)
          )
        );

        return Superposition.observe(onCollapse, onParadox)(constrainedSuperposition);
      }

      Maybe.fold<Superposition<T>, Superposition<T>>(
        () => {
          if (unobservedVal.constraint.kind === 'some') {
            const constraint = unobservedVal.constraint.val;
            const constrained = Superposition.of(
              ...unobservedVal.possibleValues.filter(constraint)
            );

            return Superposition.observe(onCollapse, onParadox)(
              constrained
            );
          } else {
            const randomIdx = Math.floor(Math.random() * unobservedVal.possibleValues.length);
            return Superposition.of(
              unobservedVal.possibleValues[randomIdx]
            );
          }
        },
        (_) => { throw 'TODO'; }
      )(unobservedVal.before),
      // Maybe.map<Superposition<T>, Superposition<T>>(
      //   (v) => {}
      // )(unobservedVal.before),

      // Maybe.fold<T, Superposition<T>>(
      //   () => {
      //     return unobservedVal.;
      //   },
      //   (_: T) => {}
      // )(unobservedVal.before),
      (paradox: Paradox<T>) => paradox // TODO
    )(superpos);
  }
};

// const Superposition = {
//   observe: <T>(
//     onCollapse: (realValue: T) => T | Superposition<T>,
//     onParadox: (...lastCoherentValues: Array<T>) => T | Superposition<T>
//   ): Superposition<T> => {

//   },
//   entangle: (
//     constraint: ConstraintF<T>,
//     other: Superposition<T>
//   ): Superposition<T> => {

//   },
//   represent: <U>(
//     representer: (...remainingCoherentValues: Array<T>) => U
//   ) => U
// };

// const Superposition = <T>(...coherentStates: Array<T>): Superposition<T> => {
//   const entanglements: Array<ConstraintF<T>> = [];
//   const entangledParticles: Array<Superposition<T>> = [];

//   return {
//     entangle: (constraint, other) => {
//       entanglements.push(constraint);
//       entangledParticles.push(other);
//     }
//   };
// };

const FullSuperposition = <T>(
  coherentStates: Array<T>,
  entanglement: ConstraintF<T>,
  entangledParticle: Superposition<T>
): Superposition<T> => {



};