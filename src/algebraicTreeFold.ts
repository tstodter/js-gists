type Tree<T> = Leaf<T> | Branch<T> | DatumBranch<T>;

type Leaf<T> = {
  kind: 'leaf';
  value: T;
};

type Branch<T> = {
  kind: 'branch';
  children: Array<Tree<T>>;
};

type DatumBranch<T> = {
  kind: 'datum-branch';
  children: Array<Tree<T>>;
  value: T;
};

const Leaf = <T>(value: T): Leaf<T> => ({
  kind: 'leaf',
  value
});

const Branch = <T>(...children: Array<Tree<T>>): Branch<T> => ({
  kind: 'branch',
  children
});

const DatumBranch = <T>(value: T, ...children: Array<Tree<T>>): DatumBranch<T> => ({
  kind: 'datum-branch',
  value,
  children
});

const treeMatch = <T, R>(
  onLeaf       : (_: Leaf<T>)        => R,
  onDatumBranch: (_: DatumBranch<T>) => R,
  onBranch     : (_: Branch<T>)      => R
) => (
  tree: Tree<T>
) => {
  switch (tree.kind) {
    case 'leaf'        : return onLeaf(tree);
    case 'branch'      : return onBranch(tree);
    case 'datum-branch': return onDatumBranch(tree);
  }
};

const treeFold = <T, R>(
  leafF       : (leafValue: T) => R,
  datumBranchF: (branchValue: T, ...childrenReductions: Array<R>) => R,
  branchF     : (...childrenReductions: Array<R>) => R
) => (
  tree: Tree<T>
): R => treeMatch(
  (leaf: Leaf<T>) => leafF(leaf.value),
  (datumBranch: DatumBranch<T>) => datumBranchF(
    datumBranch.value,
    ...datumBranch.children.map(treeFold(leafF, datumBranchF, branchF))
  ),
  (branch: Branch<T>) => branchF(
    ...branch.children.map(treeFold(leafF, datumBranchF, branchF))
  )
)(tree);

const sumArray = (ns: number[]) => ns.reduce((a, b) => a + b, 0);

const numNodes = <T>(
  tree: Tree<T>
) => treeFold(
  (leafValue: T) => 1,
  (branchValue: T, ...ns: number[]) => 1 + sumArray(ns),
  (...ns: number[]) => sumArray(ns)
)(tree);

const branchHeight = (...heights: number[]) => 1 + Math.max(...heights);

const treeHeight = <T>(
  tree: Tree<T>
) => treeFold(
  (leafValue: T) => 1,
  (branchValue: T, ...heights: number[]) => branchHeight(...heights),
  branchHeight
)(tree);

const concatTree = (
  tree: Tree<string>
) => treeFold(
  (leafValue: string) => `(${leafValue})`,
  (branchValue: string, childLeft: string, childRight: string) => (
    `[${childLeft} |-${branchValue}-| ${childRight}]`
  ),
  (childLeft: string, childRight: string) => (
    `[${childLeft} |-| ${childRight}]`
  )
)(tree);

const theTree = DatumBranch(
  '1',
  DatumBranch(
    '2',
    Leaf('hi'),
    Branch(
      Leaf('there'),
      Leaf('intrepid')
    )
  ),
  Leaf('warrior')
);

console.log(numNodes(theTree)); // 6
console.log(treeHeight(theTree)); // 4
console.log(concatTree(theTree)); // [[(hi) |-2-| [(there) |-| (intrepid)]] |-1-| (warrior)]
