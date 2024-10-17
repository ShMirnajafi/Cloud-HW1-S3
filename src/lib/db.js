import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://request_owner:CwAzmJrZt02v@ep-shrill-voice-a50uy1ow.us-east-2.aws.neon.tech/request?sslmode=require',
    ssl: {
        rejectUnauthorized: false,
    },
});

export const getReadyRequests = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT * FROM requests WHERE status = 'ready'");
        return res.rows;
    } finally {
        client.release();
    }
};

export const updateRequestStatus = async (id, status, newImageUrl = null) => {
    const client = await pool.connect();
    try {
        const query = `UPDATE requests SET status = $1, new_image_url = $2 WHERE id = $3`;
        await client.query(query, [status, newImageUrl, id]);
    } finally {
        client.release();
    }
};
