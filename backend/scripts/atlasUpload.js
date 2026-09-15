const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  console.error("Error: MONGO_URI or MONGODB_URI environment variable is required.");
  process.exit(1);
}

async function run() {
  try {
    console.log("Connecting directly to MongoDB cluster...");
    await mongoose.connect(uri);
    console.log("Connected! Uploading dataset to Atlas...");

    const col = mongoose.connection.db.collection('patients');
    const filePath = path.join(__dirname, '../data', 'diabetic_data.csv');

    if (!fs.existsSync(filePath)) {
      console.error("CSV file not found at:", filePath);
      process.exit(1);
    }

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity
    });

    let headers = null;
    let batch = [];
    let count = 0;

    for await (const line of rl) {
      if (!headers) {
        headers = line.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        continue;
      }
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const doc = {};
      headers.forEach((h, i) => {
        doc[h] = values[i] !== undefined ? values[i] : null;
      });
      batch.push(doc);

      if (batch.length === 5000) {
        await col.insertMany(batch);
        count += batch.length;
        console.log(`Uploaded ${count} records...`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await col.insertMany(batch);
      count += batch.length;
    }

    console.log(`\nSUCCESS: Total ${count} patient records inserted into Atlas!`);
    process.exit(0);
  } catch (err) {
    console.error("Upload error:", err.message);
    process.exit(1);
  }
}

run();
