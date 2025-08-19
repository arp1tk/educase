import express from "express";
const app = express();
import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();
app.use(express.json());
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});
async function initDB() {
    await client.connect();

    await client.query(`
    CREATE TABLE IF NOT EXISTS schools (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(500) NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL
    );
  `);

    console.log("Schools table ready.");
}
initDB();
const isFiniteNumber = (v) => typeof v === 'number' && Number.isFinite(v);

function validateLatLon(lat, lon) {
    if (!isFiniteNumber(lat) || !isFiniteNumber(lon)) return 'Latitude and longitude must be numbers';
    if (lat < -90 || lat > 90) return 'Latitude must be between -90 and 90';
    if (lon < -180 || lon > 180) return 'Longitude must be between -180 and 180';
    return null;
}

function nonEmptyString(s, fieldName) {
    if (typeof s !== 'string' || s.trim().length === 0) return `${fieldName} is required`;
    return null;
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/addSchool', async (req, res) => {
    try {
        const { name, address, latitude, longitude } = req.body || {};

        // Basic validation
        const e1 = nonEmptyString(name, 'name');
        const e2 = nonEmptyString(address, 'address');
        const e3 = validateLatLon(Number(latitude), Number(longitude));

        const errors = [e1, e2, e3].filter(Boolean);
        if (errors.length) return res.status(400).json({ success: false, errors });

        const sql = `INSERT INTO schools (name, address, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *`;
        const params = [name.trim(), address.trim(), Number(latitude), Number(longitude)];

        const { rows } = await client.query(sql, params);

        return res.status(201).json({ success: true, data: rows[0], message: 'School added successfully' });
    } catch (err) {
        console.error('addSchool error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get("/listSchools", async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        // Validation
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                errors: ["Latitude and longitude are required"],
            });
        }

        const userLat = parseFloat(latitude);
        const userLon = parseFloat(longitude);

        if (isNaN(userLat) || isNaN(userLon)) {
            return res.status(400).json({
                success: false,
                errors: ["Latitude and longitude must be numbers"],
            });
        }

        const result = await client.query(
            `
      SELECT id, name, address, latitude, longitude,
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance
      FROM schools
      ORDER BY distance ASC
      `,
            [userLat, userLon]
        );

        res.json({
            success: true,
            count: result.rows.length,
            schools: result.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            errors: ["Internal server error"],
        });
    }
});

app.listen(3000, () => {
    console.log("server running")
})