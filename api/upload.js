// Vercel Serverless Function for Upload Speed Test
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            // Read the uploaded data (but don't store it)
            let bytesReceived = 0;

            if (req.body) {
                // Body is already parsed by Vercel
                bytesReceived = JSON.stringify(req.body).length;
            } else if (req.headers['content-length']) {
                bytesReceived = parseInt(req.headers['content-length']);
            }

            // Return success with bytes received
            res.status(200).json({
                success: true,
                bytesReceived: bytesReceived,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
