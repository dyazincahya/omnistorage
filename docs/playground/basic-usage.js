import store from "../../src/index.js";
import is from "is";

async function runDemo() {
  console.log("--- Demo @my-js-lib/store (ORM-Like Version) ---\n");

  // 0. Info Database & Hooks
  console.log("[0] Info Database & Hooks:");
  console.log("Current DB Name:", store.getDbName());

  // Setup Global Hook
  store.on("onSet", (data) => {
    console.log(`[Hook: onSet] Key: ${data.key}, Engine: ${data.engine}`);
  });

  // Set manual DB Name
  store.db("my_app_db");
  console.log("Manual DB Name:", store.getDbName());
  console.log("\n");

  // 1. ORM-Like API (create, update, save, find, findAll, destroy)
  console.log("[1] ORM-Like API:");

  // Create: Gagal jika sudah ada
  const createRes = await store.create("user:1", {
    name: "Cahya",
    role: "admin",
  });
  console.log("Create user:1:", createRes.ok ? "Success" : createRes.message);

  // Update: Gagal jika belum ada
  const updateRes = await store.update("user:1", { name: "Cahya Updated" });
  console.log("Update user:1:", updateRes.ok ? "Success" : updateRes.message);

  // Save: Upsert (Simpan atau Update)
  await store.save("user:2", { name: "Dedy", role: "user" });

  // Find: Mencari data
  const user1Res = await store.find("user:1");
  console.log("Find user:1 (data):", user1Res.data);

  // FindAll: Semua data dalam engine default
  const allUsersRes = await store.findAll();
  console.log("FindAll data keys:", Object.keys(allUsersRes.data));

  // Destroy: Menghapus data
  await store.destroy("user:2");
  const finalAllRes = await store.findAll();
  console.log(
    "Setelah destroy user:2, total keys:",
    Object.keys(finalAllRes.data).length,
  );
  console.log("\n");

  // 2. Watchers (Memantau perubahan key spesifik)
  console.log("[2] Watchers:");
  const unwatch = store.watch("config:theme", (newVal, oldVal) => {
    console.log(`[Watcher] Theme berubah dari "${oldVal}" ke "${newVal}"`);
  });

  await store.save("config:theme", "dark");
  await store.save("config:theme", "light");
  unwatch(); // Berhenti memantau
  console.log("\n");

  // 3. Batch Operations (saveMany, findMany)
  console.log("[3] Batch Operations:");
  await store.saveMany({
    "product:1": { name: "Laptop", price: 1000 },
    "product:2": { name: "Mouse", price: 20 },
  });

  const productsRes = await store.findMany(["product:1", "product:2"]);
  console.log("FindMany products data:", productsRes.data);
  console.log("\n");

  // 4. Metadata (describe)
  console.log("[4] Metadata (describe):");
  const metaRes = await store.describe("product:1");
  console.log("Product:1 Metadata data:", metaRes.data);
  console.log("\n");

  // 5. Namespacing & Chaining
  console.log("[5] Namespacing & Chaining:");
  const cache = store.engine("memory").namespace("cache");
  await cache.save("temp_data", "I am in memory");
  const cacheDataRes = await cache.find("temp_data");
  console.log("Get from namespaced memory (data):", cacheDataRes.data);

  // Describe in namespace
  const cacheMetaRes = await cache.describe("temp_data");
  console.log("Memory Cache Meta data:", cacheMetaRes.data);
  console.log("\n");

  // 6. Type Checking (is)
  console.log("[6] Type Checking (is):");
  await store.save("settings:notifications", true);
  const isEnabledRes = await store.find("settings:notifications", {
    type: "boolean",
  });
  console.log("Notifications (data):", isEnabledRes.data);
  console.log("\n");

  // 7. Validasi Kapasitas
  console.log("[7] Validasi Kapasitas (Size Limit):");
  const bigData = "x".repeat(51 * 1024 * 1024); // 51MB (Limit memory 50MB)
  const limitRes = await store.engine("memory").save("too_big", bigData);
  if (!limitRes.ok) {
    console.log("Pesan Limit tercapai:", limitRes.message);
  }
  console.log("\n");

  // 8. Statistik Storage
  console.log("[8] Statistik Storage:");
  const allStatsRes = await store.getStatistics();
  console.log("Semua Statistik (data):", allStatsRes.data);

  const localStatsRes = await store.getStatistic("local");
  console.log("Statistik Local Only (data):", localStatsRes.data);
  console.log("\n");

  // 9. Transaction & Multi-Insert
  console.log("[9] Transaction & Multi-Insert:");

  // Transaction
  await store.transaction(async (trx) => {
    await trx.create("trx:1", { val: "A" });
    await trx.save("trx:2", { val: "B" });
  });
  const trx1Res = await store.find("trx:1");
  console.log("Transaction selesai. Check trx:1 (data):", trx1Res.data);

  // Multi-Insert (createMany)
  const batchRes = await store.createMany({
    "batch:1": { n: 1 },
    "batch:2": { n: 2 },
  });
  console.log("Batch Create (createMany) data:", batchRes.data);
  console.log("\n");

  // 10. Activity Logs
  console.log("[10] Activity Logs:");
  const logsRes = await store.getActivityLogs(5);
  console.log("Latest 5 logs:", logsRes.data);
  console.log("\n");

  // 11. SQLite Engines (Server & Client)
  console.log("[11] SQLite Engines:");
  if (is.undefined(globalThis.window)) {
    // Node.js: Coba sqlite-server
    const sqlite = store.engine("sqlite-server");
    await sqlite.save("sql_key", { db: "sqlite-server" });
    const sqlData = await sqlite.find("sql_key");
    console.log("SQLite Server Data:", sqlData.data);
  } else {
    // Browser: Coba sqlite-client
    const sqlite = store.engine("sqlite-client");
    await sqlite.save("sql_key", { db: "sqlite-client" });
    const sqlData = await sqlite.find("sql_key");
    console.log("SQLite Client Data:", sqlData.data);
  }
  console.log("\n");

  console.log("--- Demo Selesai ---");
}

runDemo().catch(console.error);
