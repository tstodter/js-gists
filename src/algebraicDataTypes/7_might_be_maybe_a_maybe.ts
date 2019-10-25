import Maybe, {Some, None} from '../Maybe';

type User     = {id: number; dungeonId: number;};
type Dungeon  = {id: number; templateId: number;};
type Template = {id: number; firstRoom: string};

const getUser = (id: number): Maybe<User> => {
  return Maybe.of({
    id: 7, dungeonId: 666
  });
};

const getDungeon = (id: number): Maybe<Dungeon> => {
  // Might be a Some or a None
  return None();
};

const getDungeonTemplate = (id: number): Maybe<Template> => {
  return Maybe.of({
    id: 777, firstRoom: "Entrance Hall"
  });
};

const mightBeAUserId = Maybe.of(5);

// Safely chain to get dungeon template from user id
const userDungeon = Maybe.pipe<number, User, Dungeon, Template>(
  (id: number)       => getUser(id),
  (user: User)       => getDungeon(user.dungeonId),
  (dungeon: Dungeon) => getDungeonTemplate(dungeon.templateId)
)(mightBeAUserId);

// Log output
Maybe.fold<Template, void>(
  () => console.log(`Ended up with nothing`),
  (t) => console.log(`First room is ${t.firstRoom}`)
)(userDungeon);

