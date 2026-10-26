// In-memory state for tracking multi-timeframe alignment
let trackerState = {
    "1D": "WAIT",
    "4H": "WAIT",
    "30M": "WAIT",
    "15M": "WAIT",
    overallBias: "WAIT",
    lastPrice: "N/A",
    lastUpdated: new Date().toISOString()
};

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            const data = req.body || {};
            
            // Expected TradingView Payload:
            // { "timeframe": "1D", "bias": "BUY", "price": 43500 }
            const tf = data.timeframe ? data.timeframe.toUpperCase() : null;
            const bias = data.bias ? data.bias.toUpperCase() : 'WAIT';
            const price = data.price || trackerState.lastPrice;

            if (tf && ['1D', '4H', '30M', '15M'].includes(tf)) {
                trackerState[tf] = bias;
            }

            if (price) {
                trackerState.lastPrice = price;
            }

            // Calculate Overall Bias (1D + 4H + 30M must all align for 15M execution)
            if (trackerState["1D"] === "BUY" && trackerState["4H"] === "BUY" && trackerState["30M"] === "BUY") {
                trackerState.overallBias = "BUY";
            } else if (trackerState["1D"] === "SELL" && trackerState["4H"] === "SELL" && trackerState["30M"] === "SELL") {
                trackerState.overallBias = "SELL";
            } else {
                trackerState.overallBias = "WAIT";
            }

            trackerState.lastUpdated = new Date().toISOString();

            return res.status(200).json({
                status: 'success',
                state: trackerState
            });
        } catch (error) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
    }

    // GET request returns the current live state to the dashboard UI
    return res.status(200).json(trackerState);
                }
