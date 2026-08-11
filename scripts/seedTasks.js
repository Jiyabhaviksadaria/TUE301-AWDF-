const conn = new Mongo();
const db = conn.getDB("taskmanager");
print("Switched to db: " + db.getName());

try {
  printjson(db.createCollection("tasks"));
} catch (e) {
  print("createCollection: " + e);
}

const res1 = db.tasks.insertOne({
  id: 1,
  title: "Set up development environment",
  description: "Install Node.js, MongoDB, and configure the project repo",
  completed: false,
  priority: "high",
  created_at: new Date()
});
printjson(res1);

const resMany = db.tasks.insertMany([
  {
    id: 2,
    title: "Design database schema",
    description: "Plan out collections and fields for the task manager app",
    completed: true,
    priority: "medium",
    created_at: new Date("2026-07-01T09:15:00Z")
  },
  {
    id: 3,
    title: "Write unit tests",
    description: "Cover core CRUD functions with automated tests",
    completed: false,
    priority: "medium",
    created_at: new Date("2026-07-03T14:30:00Z")
  },
  {
    id: 4,
    title: "Fix login bug",
    description: "Users are occasionally logged out after 5 minutes",
    completed: false,
    priority: "high",
    created_at: new Date("2026-07-04T11:00:00Z")
  },
  {
    id: 5,
    title: "Update documentation",
    description: "Add setup instructions to the README file",
    completed: true,
    priority: "low",
    created_at: new Date("2026-07-05T16:45:00Z")
  },
  {
    id: 6,
    title: "Plan sprint retrospective",
    description: "Prepare discussion points for the upcoming team meeting",
    completed: false,
    priority: "low",
    created_at: new Date("2026-07-06T10:00:00Z")
  }
]);
printjson(resMany);

print("Collections in taskmanager:");
printjson(db.getCollectionNames());

print("Tasks count:");
printjson(db.tasks.countDocuments());

print("All tasks:");
printjson(db.tasks.find().toArray());

print("Databases (listDatabases):");
printjson(conn.getDB("admin").runCommand({ listDatabases: 1 }));
