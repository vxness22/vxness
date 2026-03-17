import WebSocket from 'ws'
import dotenv from 'dotenv'

dotenv.config()

const INFOWAY_API_KEY = process.env.INFOWAY_API_KEY

// WebSocket URLs
const WS_FOREX_URL = `wss://data.infoway.io/ws?business=common&apikey=${INFOWAY_API_KEY}`
const WS_CRYPTO_URL = `wss://data.infoway.io/ws?business=crypto&apikey=${INFOWAY_API_KEY}`

// Symbol mappings - All supported instruments
const FOREX_SYMBOLS = [
  // Forex Majors
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  // Forex Crosses
  'EURGBP', 'EURJPY', 'GBPJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'GBPAUD',
  'GBPCAD', 'AUDCAD', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY', 'AUDNZD',
  'CADCHF', 'GBPCHF', 'GBPNZD', 'EURNZD', 'NZDCAD', 'NZDCHF', 'AUDCHF',
  // Forex Exotics
  'USDSGD', 'EURSGD', 'GBPSGD', 'AUDSGD', 'SGDJPY', 'USDHKD',
  'USDZAR', 'EURZAR', 'GBPZAR', 'ZARJPY',
  'USDTRY', 'EURTRY', 'TRYJPY',
  'USDMXN', 'EURMXN', 'MXNJPY',
  'USDPLN', 'EURPLN', 'GBPPLN',
  'USDSEK', 'EURSEK', 'GBPSEK', 'SEKJPY',
  'USDNOK', 'EURNOK', 'GBPNOK', 'NOKJPY',
  'USDDKK', 'EURDKK', 'DKKJPY',
  'USDCNH', 'CNHJPY',
  'USDHUF', 'EURHUF', 'USDCZK', 'EURCZK'
]

// Metals
const METALS_SYMBOLS = [
  'XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD',
  'XAUEUR', 'XAUGBP', 'XAUAUD', 'XAUCHF', 'XAUJPY',
  'XAGEUR', 'XAGGBP', 'XAGAUD', 'XAGCHF', 'XAGJPY',
  'XAUCAD', 'XAUNZD', 'XAGCAD', 'XAGNZD'
]

// Commodities
const COMMODITIES_SYMBOLS = ['USOIL', 'UKOIL', 'NGAS', 'COPPER']

const CRYPTO_SYMBOLS = [
  // Top Cryptos
  'BTCUSD', 'ETHUSD', 'BNBUSD', 'XRPUSD', 'SOLUSD', 'ADAUSD', 'DOGEUSD',
  'DOTUSD', 'MATICUSD', 'LTCUSD', 'LINKUSD', 'AVAXUSD', 'ATOMUSD',
  'BCHUSD', 'XLMUSD', 'UNIUSD', 'TRXUSD', 'ETCUSD', 'XMRUSD', 'EOSUSD',
  // DeFi & Layer 2
  'AAVEUSD', 'MKRUSD', 'COMPUSD', 'SNXUSD', 'YFIUSD', 'SUSHIUSD',
  'NEARUSD', 'FTMUSD', 'SANDUSD', 'MANAUSD', 'AXSUSD', 'GALAUSD',
  'APEUSD', 'GMTUSD', 'OPUSD', 'ARBUSD', 'PEPEUSD', 'SHIBUSD',
  'TONUSD', 'HBARUSD', 'ICPUSD', 'FILUSD', 'VETUSD', 'ALGOUSD',
  // Additional Cryptos
  'XTZUSD', 'THETAUSD', 'ZILUSD', 'ENJUSD', 'BATUSD', 'ZRXUSD',
  'CRVUSD', 'LRCUSD', 'ANKRUSD', 'WAVESUSD', 'ZECUSD', 'DASHUSD',
  'NEOUSD', 'KSMUSD', 'KAVAUSD', 'RUNEUSD', 'FLOWUSD', 'CHZUSD',
  'GRTUSD', 'ROSEUSD', 'MINAUSD', 'CELOUSD', 'ONEUSD', 'HOTUSD',
  'SKLUSD', 'STORJUSD', 'UMAUSD', 'BANDUSD', 'RVNUSD', 'OXTUSD',
  'WOOUSD', 'JASMYUSD', 'MASKUSD', 'DENTUSD', 'COTIUSD', 'IOTXUSD',
  'KLAYUSD', 'OGNUSD', 'RLCUSD', 'AUDIOUSD', 'BONKUSD', 'FLOKIUSD',
  'ORDIUSD', 'STXUSD', 'CFXUSD', 'IMXUSD', 'LDOUSD', 'INJUSD',
  'FETUSD', 'RNDRUSD', 'WLDUSD', 'SEIUSD', 'TIAUSD', 'BLURUSD',
  'SUIUSD', 'APTUSD', 'QNTUSD', 'EGLDUSDUSD', 'DYDXUSD', 'GMXUSD'
]

// Infoway symbol format mapping
const toInfowaySymbol = (symbol) => {
  if (CRYPTO_SYMBOLS.includes(symbol)) {
    return symbol.replace('USD', 'USDT')
  }
  return symbol
}

const fromInfowaySymbol = (infowaySymbol) => {
  if (infowaySymbol.endsWith('USDT')) {
    return infowaySymbol.replace('USDT', 'USD')
  }
  return infowaySymbol
}

const SUPPORTED_SYMBOLS = [...FOREX_SYMBOLS, ...METALS_SYMBOLS, ...COMMODITIES_SYMBOLS, ...CRYPTO_SYMBOLS]

// Fallback prices for all symbols
const FALLBACK_PRICES = {
  // Forex Majors
  'EURUSD': { bid: 1.0850, ask: 1.0852 },
  'GBPUSD': { bid: 1.2650, ask: 1.2652 },
  'USDJPY': { bid: 149.50, ask: 149.52 },
  'USDCHF': { bid: 0.8820, ask: 0.8822 },
  'AUDUSD': { bid: 0.6550, ask: 0.6552 },
  'NZDUSD': { bid: 0.6150, ask: 0.6152 },
  'USDCAD': { bid: 1.3550, ask: 1.3552 },
  // Forex Crosses
  'EURGBP': { bid: 0.8580, ask: 0.8582 },
  'EURJPY': { bid: 162.20, ask: 162.22 },
  'GBPJPY': { bid: 189.10, ask: 189.12 },
  'EURCHF': { bid: 0.9570, ask: 0.9572 },
  'EURAUD': { bid: 1.6560, ask: 1.6562 },
  'EURCAD': { bid: 1.4700, ask: 1.4702 },
  'GBPAUD': { bid: 1.9320, ask: 1.9322 },
  'GBPCAD': { bid: 1.7150, ask: 1.7152 },
  'AUDCAD': { bid: 0.8880, ask: 0.8882 },
  'AUDJPY': { bid: 97.90, ask: 97.92 },
  'CADJPY': { bid: 110.30, ask: 110.32 },
  'CHFJPY': { bid: 169.50, ask: 169.52 },
  'NZDJPY': { bid: 91.80, ask: 91.82 },
  'AUDNZD': { bid: 1.0650, ask: 1.0652 },
  'CADCHF': { bid: 0.6510, ask: 0.6512 },
  'GBPCHF': { bid: 1.1150, ask: 1.1152 },
  'GBPNZD': { bid: 2.0550, ask: 2.0552 },
  'EURNZD': { bid: 1.7620, ask: 1.7622 },
  'NZDCAD': { bid: 0.8340, ask: 0.8342 },
  'NZDCHF': { bid: 0.5420, ask: 0.5422 },
  'AUDCHF': { bid: 0.5780, ask: 0.5782 },
  // Forex Exotics
  'USDSGD': { bid: 1.3420, ask: 1.3422 },
  'EURSGD': { bid: 1.4560, ask: 1.4562 },
  'GBPSGD': { bid: 1.6980, ask: 1.6982 },
  'AUDSGD': { bid: 0.8790, ask: 0.8792 },
  'SGDJPY': { bid: 111.40, ask: 111.42 },
  'USDHKD': { bid: 7.8150, ask: 7.8152 },
  'USDZAR': { bid: 18.50, ask: 18.52 },
  'EURZAR': { bid: 20.08, ask: 20.10 },
  'GBPZAR': { bid: 23.40, ask: 23.42 },
  'ZARJPY': { bid: 8.08, ask: 8.09 },
  'USDTRY': { bid: 32.50, ask: 32.52 },
  'EURTRY': { bid: 35.26, ask: 35.28 },
  'TRYJPY': { bid: 4.60, ask: 4.61 },
  'USDMXN': { bid: 17.20, ask: 17.22 },
  'EURMXN': { bid: 18.66, ask: 18.68 },
  'MXNJPY': { bid: 8.69, ask: 8.70 },
  'USDPLN': { bid: 4.02, ask: 4.022 },
  'EURPLN': { bid: 4.36, ask: 4.362 },
  'GBPPLN': { bid: 5.08, ask: 5.082 },
  'USDSEK': { bid: 10.45, ask: 10.452 },
  'EURSEK': { bid: 11.34, ask: 11.342 },
  'GBPSEK': { bid: 13.22, ask: 13.222 },
  'SEKJPY': { bid: 14.31, ask: 14.32 },
  'USDNOK': { bid: 10.85, ask: 10.852 },
  'EURNOK': { bid: 11.77, ask: 11.772 },
  'GBPNOK': { bid: 13.72, ask: 13.722 },
  'NOKJPY': { bid: 13.78, ask: 13.79 },
  'USDDKK': { bid: 6.92, ask: 6.922 },
  'EURDKK': { bid: 7.51, ask: 7.512 },
  'DKKJPY': { bid: 21.61, ask: 21.62 },
  'USDCNH': { bid: 7.25, ask: 7.252 },
  'CNHJPY': { bid: 20.62, ask: 20.63 },
  'USDHUF': { bid: 365.50, ask: 365.70 },
  'EURHUF': { bid: 396.60, ask: 396.80 },
  'USDCZK': { bid: 23.45, ask: 23.47 },
  'EURCZK': { bid: 25.44, ask: 25.46 },
  // Metals
  'XAUUSD': { bid: 2870.00, ask: 2870.50 },
  'XAGUSD': { bid: 32.10, ask: 32.12 },
  'XPTUSD': { bid: 1020.00, ask: 1021.00 },
  'XPDUSD': { bid: 980.00, ask: 981.00 },
  'XAUEUR': { bid: 2645.00, ask: 2645.50 },
  'XAUGBP': { bid: 2268.00, ask: 2268.50 },
  'XAUAUD': { bid: 4380.00, ask: 4380.50 },
  'XAUCHF': { bid: 2530.00, ask: 2530.50 },
  'XAUJPY': { bid: 429000.00, ask: 429050.00 },
  'XAGEUR': { bid: 29.60, ask: 29.62 },
  'XAGGBP': { bid: 25.40, ask: 25.42 },
  'XAGAUD': { bid: 49.00, ask: 49.02 },
  'XAGCHF': { bid: 28.30, ask: 28.32 },
  'XAGJPY': { bid: 4800.00, ask: 4802.00 },
  'XAUCAD': { bid: 3890.00, ask: 3890.50 },
  'XAUNZD': { bid: 4665.00, ask: 4665.50 },
  'XAGCAD': { bid: 43.50, ask: 43.52 },
  'XAGNZD': { bid: 52.20, ask: 52.22 },
  // Commodities
  'USOIL': { bid: 72.50, ask: 72.55 },
  'UKOIL': { bid: 76.80, ask: 76.85 },
  'NGAS': { bid: 2.85, ask: 2.86 },
  'COPPER': { bid: 4.25, ask: 4.26 },
  // Crypto
  'BTCUSD': { bid: 97000.00, ask: 97050.00 },
  'ETHUSD': { bid: 2650.00, ask: 2652.00 },
  'BNBUSD': { bid: 580.00, ask: 580.50 },
  'XRPUSD': { bid: 2.45, ask: 2.46 },
  'SOLUSD': { bid: 195.00, ask: 195.20 },
  'ADAUSD': { bid: 0.95, ask: 0.952 },
  'DOGEUSD': { bid: 0.32, ask: 0.321 },
  'DOTUSD': { bid: 7.50, ask: 7.52 },
  'MATICUSD': { bid: 0.45, ask: 0.452 },
  'LTCUSD': { bid: 105.00, ask: 105.20 },
  'LINKUSD': { bid: 18.50, ask: 18.52 },
  'AVAXUSD': { bid: 38.50, ask: 38.55 },
  'ATOMUSD': { bid: 9.80, ask: 9.82 },
  'BCHUSD': { bid: 420.00, ask: 420.50 },
  'XLMUSD': { bid: 0.42, ask: 0.421 },
  'UNIUSD': { bid: 12.50, ask: 12.52 },
  'TRXUSD': { bid: 0.24, ask: 0.241 },
  'ETCUSD': { bid: 28.50, ask: 28.55 },
  'XMRUSD': { bid: 185.00, ask: 185.50 },
  'EOSUSD': { bid: 0.85, ask: 0.852 },
  'AAVEUSD': { bid: 280.00, ask: 280.50 },
  'MKRUSD': { bid: 1850.00, ask: 1852.00 },
  'COMPUSD': { bid: 85.00, ask: 85.20 },
  'SNXUSD': { bid: 3.20, ask: 3.22 },
  'YFIUSD': { bid: 8500.00, ask: 8510.00 },
  'SUSHIUSD': { bid: 1.45, ask: 1.46 },
  'NEARUSD': { bid: 5.20, ask: 5.22 },
  'FTMUSD': { bid: 0.72, ask: 0.722 },
  'SANDUSD': { bid: 0.58, ask: 0.582 },
  'MANAUSD': { bid: 0.52, ask: 0.522 },
  'AXSUSD': { bid: 8.20, ask: 8.22 },
  'GALAUSD': { bid: 0.042, ask: 0.0422 },
  'APEUSD': { bid: 1.35, ask: 1.36 },
  'GMTUSD': { bid: 0.22, ask: 0.221 },
  'OPUSD': { bid: 2.15, ask: 2.16 },
  'ARBUSD': { bid: 0.85, ask: 0.852 },
  'PEPEUSD': { bid: 0.000018, ask: 0.0000181 },
  'SHIBUSD': { bid: 0.000022, ask: 0.0000221 },
  'TONUSD': { bid: 5.50, ask: 5.52 },
  'HBARUSD': { bid: 0.28, ask: 0.281 },
  'ICPUSD': { bid: 12.80, ask: 12.82 },
  'FILUSD': { bid: 5.80, ask: 5.82 },
  'VETUSD': { bid: 0.045, ask: 0.0451 },
  'ALGOUSD': { bid: 0.38, ask: 0.381 },
  // Additional Cryptos
  'XTZUSD': { bid: 1.05, ask: 1.06 },
  'THETAUSD': { bid: 1.80, ask: 1.82 },
  'ZILUSD': { bid: 0.025, ask: 0.0252 },
  'ENJUSD': { bid: 0.32, ask: 0.322 },
  'BATUSD': { bid: 0.25, ask: 0.252 },
  'ZRXUSD': { bid: 0.45, ask: 0.452 },
  'CRVUSD': { bid: 0.55, ask: 0.552 },
  'LRCUSD': { bid: 0.22, ask: 0.222 },
  'ANKRUSD': { bid: 0.035, ask: 0.0352 },
  'WAVESUSD': { bid: 2.20, ask: 2.22 },
  'ZECUSD': { bid: 35.00, ask: 35.10 },
  'DASHUSD': { bid: 28.00, ask: 28.10 },
  'NEOUSD': { bid: 12.50, ask: 12.52 },
  'KSMUSD': { bid: 28.00, ask: 28.10 },
  'KAVAUSD': { bid: 0.55, ask: 0.552 },
  'RUNEUSD': { bid: 5.20, ask: 5.22 },
  'FLOWUSD': { bid: 0.75, ask: 0.752 },
  'CHZUSD': { bid: 0.08, ask: 0.082 },
  'GRTUSD': { bid: 0.18, ask: 0.182 },
  'ROSEUSD': { bid: 0.10, ask: 0.102 },
  'MINAUSD': { bid: 0.55, ask: 0.552 },
  'CELOUSD': { bid: 0.65, ask: 0.652 },
  'ONEUSD': { bid: 0.018, ask: 0.0182 },
  'HOTUSD': { bid: 0.002, ask: 0.0022 },
  'SKLUSD': { bid: 0.045, ask: 0.0452 },
  'STORJUSD': { bid: 0.55, ask: 0.552 },
  'UMAUSD': { bid: 2.80, ask: 2.82 },
  'BANDUSD': { bid: 1.50, ask: 1.52 },
  'RVNUSD': { bid: 0.025, ask: 0.0252 },
  'OXTUSD': { bid: 0.10, ask: 0.102 },
  'WOOUSD': { bid: 0.25, ask: 0.252 },
  'JASMYUSD': { bid: 0.02, ask: 0.022 },
  'MASKUSD': { bid: 3.20, ask: 3.22 },
  'DENTUSD': { bid: 0.001, ask: 0.0012 },
  'COTIUSD': { bid: 0.10, ask: 0.102 },
  'IOTXUSD': { bid: 0.045, ask: 0.0452 },
  'KLAYUSD': { bid: 0.18, ask: 0.182 },
  'OGNUSD': { bid: 0.12, ask: 0.122 },
  'RLCUSD': { bid: 2.50, ask: 2.52 },
  'AUDIOUSD': { bid: 0.18, ask: 0.182 },
  'BONKUSD': { bid: 0.000025, ask: 0.0000252 },
  'FLOKIUSD': { bid: 0.00018, ask: 0.000182 },
  'ORDIUSD': { bid: 35.00, ask: 35.10 },
  'STXUSD': { bid: 1.80, ask: 1.82 },
  'CFXUSD': { bid: 0.18, ask: 0.182 },
  'IMXUSD': { bid: 1.50, ask: 1.52 },
  'LDOUSD': { bid: 1.80, ask: 1.82 },
  'INJUSD': { bid: 22.00, ask: 22.10 },
  'FETUSD': { bid: 0.55, ask: 0.552 },
  'RNDRUSD': { bid: 8.50, ask: 8.52 },
  'WLDUSD': { bid: 2.20, ask: 2.22 },
  'SEIUSD': { bid: 0.45, ask: 0.452 },
  'TIAUSD': { bid: 8.50, ask: 8.52 },
  'BLURUSD': { bid: 0.28, ask: 0.282 },
  'SUIUSD': { bid: 1.20, ask: 1.22 },
  'APTUSD': { bid: 8.50, ask: 8.52 },
  'QNTUSD': { bid: 95.00, ask: 95.20 },
  'EGLDUSDUSD': { bid: 38.00, ask: 38.10 },
  'DYDXUSD': { bid: 1.50, ask: 1.52 },
  'GMXUSD': { bid: 28.00, ask: 28.10 }
}

class InfowayService {
  constructor() {
    this.forexWs = null
    this.cryptoWs = null
    this.isConnected = false
    this.prices = new Map()
    this.subscribers = new Set()
    this.reconnectInterval = null
  }

  async connect() {
    if (!INFOWAY_API_KEY) {
      console.error('[Infoway] No INFOWAY_API_KEY configured')
      return false
    }

    try {
      console.log('[Infoway] Connecting to WebSocket...')
      await this.connectForex()
      await this.connectCrypto()
      this.startHeartbeat()
      this.isConnected = true
      console.log('[Infoway] Connected successfully!')
      return true
    } catch (error) {
      console.error('[Infoway] Connection error:', error.message)
      return false
    }
  }

  connectForex() {
    return new Promise((resolve, reject) => {
      this.forexWs = new WebSocket(WS_FOREX_URL)
      
      this.forexWs.on('open', () => {
        console.log('[Infoway] Forex WebSocket connected')
        // Subscribe to forex, metals, and commodities
        const allForexSymbols = [...FOREX_SYMBOLS, ...METALS_SYMBOLS, ...COMMODITIES_SYMBOLS]
        this.subscribeToDepth(this.forexWs, allForexSymbols)
        resolve()
      })

      this.forexWs.on('message', (data) => this.handleMessage(data))
      this.forexWs.on('error', (err) => console.error('[Infoway] Forex WS error:', err.message))
      this.forexWs.on('close', () => {
        console.log('[Infoway] Forex WS closed, reconnecting...')
        setTimeout(() => this.connectForex(), 5000)
      })

      setTimeout(() => reject(new Error('Forex connection timeout')), 10000)
    })
  }

  connectCrypto() {
    return new Promise((resolve, reject) => {
      this.cryptoWs = new WebSocket(WS_CRYPTO_URL)
      
      this.cryptoWs.on('open', () => {
        console.log('[Infoway] Crypto WebSocket connected')
        this.subscribeToDepth(this.cryptoWs, CRYPTO_SYMBOLS.map(toInfowaySymbol))
        resolve()
      })

      this.cryptoWs.on('message', (data) => this.handleMessage(data))
      this.cryptoWs.on('error', (err) => console.error('[Infoway] Crypto WS error:', err.message))
      this.cryptoWs.on('close', () => {
        console.log('[Infoway] Crypto WS closed, reconnecting...')
        setTimeout(() => this.connectCrypto(), 5000)
      })

      setTimeout(() => reject(new Error('Crypto connection timeout')), 10000)
    })
  }

  subscribeToDepth(ws, symbols) {
    const msg = {
      code: 10003,
      trace: Date.now().toString(),
      data: { codes: symbols.join(',') }
    }
    ws.send(JSON.stringify(msg))
    console.log(`[Infoway] Subscribed to ${symbols.length} symbols`)
  }

  handleMessage(data) {
    try {
      const msg = JSON.parse(data.toString())
      
      // Depth push (code 10005) contains bid/ask
      if (msg.code === 10005 && msg.data) {
        const infowaySymbol = msg.data.s
        const symbol = fromInfowaySymbol(infowaySymbol)
        
        // a = ask side, b = bid side
        // a[0] = ask prices array, b[0] = bid prices array
        const askPrice = msg.data.a?.[0]?.[0]
        const bidPrice = msg.data.b?.[0]?.[0]
        
        if (bidPrice && askPrice) {
          const priceData = {
            bid: parseFloat(bidPrice),
            ask: parseFloat(askPrice),
            time: msg.data.t || Date.now()
          }
          
          this.prices.set(symbol, priceData)
          
          // Notify subscribers
          this.subscribers.forEach(callback => {
            try { callback(symbol, priceData) } catch (e) {}
          })
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  startHeartbeat() {
    setInterval(() => {
      const ping = { code: 10010, trace: Date.now().toString() }
      if (this.forexWs?.readyState === WebSocket.OPEN) {
        this.forexWs.send(JSON.stringify(ping))
      }
      if (this.cryptoWs?.readyState === WebSocket.OPEN) {
        this.cryptoWs.send(JSON.stringify(ping))
      }
    }, 30000)
  }

  getPrice(symbol) {
    return this.prices.get(symbol) || FALLBACK_PRICES[symbol] || null
  }

  getAllPrices() {
    const prices = {}
    this.prices.forEach((price, symbol) => { prices[symbol] = price })
    return prices
  }

  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  async fetchBatchPrices(symbols) {
    const prices = {}
    symbols.forEach(symbol => {
      const price = this.getPrice(symbol)
      if (price) prices[symbol] = price
    })
    return prices
  }

  getSymbols() { return SUPPORTED_SYMBOLS }
  isCrypto(symbol) { return CRYPTO_SYMBOLS.includes(symbol) }

  async disconnect() {
    if (this.forexWs) this.forexWs.close()
    if (this.cryptoWs) this.cryptoWs.close()
    this.isConnected = false
  }
}

const infowayService = new InfowayService()
export default infowayService
export { SUPPORTED_SYMBOLS, CRYPTO_SYMBOLS, FALLBACK_PRICES }
