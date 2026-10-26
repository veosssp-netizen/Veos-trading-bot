export default function handler(req, res) {
    // Enable CORS so your frontend or external webhooks can communicate easily
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            const data = req.body;
            
            // Expected payload format from TradingView or manual test:
            // { "signal": "BUY", "price": 43500, "source": "Exness" }
            const signal = data.signal || 'WAIT';
            const price = data.price || 'N/A';
            const timestamp = new Date().toISOString();

            // For now, we log it and return success (we will link this to the UI next)
            console.log(`[US30 Signal Received] Signal: ${signal}, Price: ${price} at ${timestamp}`);

            return res.status(200).json({
                status: 'success',
                message: 'Signal processed successfully',
                received: { signal, price, timestamp }
            });
        } catch (error) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
    }

    // If someone does a GET request, show status
    return res.status(200).json({ 
        status: 'online', 
        desk: 'US30 Signal Desk Webhook Receiver',
        instructions: 'Send a POST request with { "signal": "BUY" or "SELL" or "WAIT", "price": <value> }'
    });
              }
