import fs from "fs";
import path from "path";

const drizzleDir = path.join(process.cwd(), "drizzle");
const metaFile = path.join(drizzleDir, "meta", "_journal.json");

if (fs.existsSync(metaFile)) {
    const journal = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
    journal.entries = journal.entries.filter((e) => e.idx < 2);
    fs.writeFileSync(metaFile, JSON.stringify(journal, null, 2));
    console.log("Cleaned journal.");
}
