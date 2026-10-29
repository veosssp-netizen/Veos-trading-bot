// Persistent state matching the screenshot technical indicators
let trackerState = {
    timeframe: "1H",
    lastPrice: "52713.60",
    cci: "105.22",
    macd: "60.6",
    stochRsi: "84.76",
    cciStatus: "OVERBOUGHT",      // > 100
    stochRsiStatus: "OVERBOUGHT", // > 80
    macdStatus: "BULLISH",        // Positive histogram
    overallBias: "WAIT",          // Defaults to WAIT unless full alignment occurs
    lastUpdated: new Date().toISOString()
};

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        try {
            const data = req.body || {};
            
            if (data.price) trackerState.lastPrice = data.price;
            if (data.cci !== undefined) trackerState.cci = data.cci;
            if (data.macd !== undefined) trackerState.macd = data.macd;
            if (data.stochRsi !== undefined) trackerState.stochRsi = data.stochRsi;
            if (data.timeframe) trackerState.timeframe = data.timeframe.toUpperCase();

            // Evaluate indicator threshold conditions
            const cciVal = parseFloat(trackerState.cci);
            const stochVal = parseFloat(trackerState.stochRsi);

            trackerState.cciStatus = cciVal > 100 ? "OVERBOUGHT" : cciVal < -100 ? "OVERSOLD" : "NEUTRAL";
            trackerState.stochRsiStatus = stochVal > 80 ? "OVERBOUGHT" : stochVal < 20 ? "OVERSOLD" : "NEUTRAL";

            // Signal Generation Logic
            // If indicators are heavily overbought but price is breaking market structure downward:
            if (data.bias === "SELL" || (cciVal > 100 && stochVal > 80 && data.structureBreak === true)) {
                trackerState.overallBias = "SELL";
            } else if (data.bias === "BUY") {
                trackerState.overallBias = "BUY";
            } else {
                trackerState.overallBias = "WAIT";
            }

            trackerState.lastUpdated = new Date().toISOString();
            return res.status(200).json({ status: 'success', state: trackerState });
        } catch (error) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
    }

    return res.status(200).json(trackerState);
}
