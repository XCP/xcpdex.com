"use client";

import { useState, useEffect } from 'react';
import { ArrowsUpDownIcon, ChevronDownIcon, Cog6ToothIcon } from '@heroicons/react/16/solid';
import { assetsToTradingPairFromSymbols } from '@/utils/tradingPairUtils';
import { Button } from '@/components/button';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/dialog';

const address = "19QWXpMXeLkoEKEJv2xo9rn8wkPCyxACSX"; // Hardcoded address for now

const TradePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTokenFor, setSelectedTokenFor] = useState<'sell' | 'buy' | null>(null);
  const [selectedSellToken, setSelectedSellToken] = useState('XCP');
  const [selectedBuyToken, setSelectedBuyToken] = useState('BTC');
  const [sellAmount, setSellAmount] = useState(10114.848);
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellRate, setSellRate] = useState(1); // Initial rate
  const [expiry, setExpiry] = useState('8064');
  const [customExpiry, setCustomExpiry] = useState('8064');
  const [isCustomExpiry, setIsCustomExpiry] = useState(false);
  const [balance, setBalance] = useState(0); // Balance fetched from API
  const [buyBalance, setBuyBalance] = useState(0); // Balance for the buy token
  const [quoteAsset, setQuoteAsset] = useState(null);
  const [baseAsset, setBaseAsset] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [marketRateAvailable, setMarketRateAvailable] = useState(false); // To track if market rate is available

  const tokens = ['BTC', 'XCP', 'PEPECASH', 'BITCORN', 'BITCRYSTALS', 'DANKMEMECASH'];

  useEffect(() => {
    if (address) {
      fetchBalance(selectedSellToken, setBalance);
      fetchBalance(selectedBuyToken, setBuyBalance);
    }
    fetchMarketData();
  }, [selectedSellToken, selectedBuyToken]);

  const fetchBalance = async (token, setBalanceFunc) => {
    try {
      const response = await fetch(`https://api.counterparty.info/v2/addresses/${address}/balances/${token}?verbose=true`);
      const data = await response.json();
      if (data.error) {
        setBalanceFunc(0); // Set to 0 if API returns error
      } else {
        setBalanceFunc(parseFloat(data.result.quantity_normalized));
      }
    } catch (error) {
      setBalanceFunc(0); // Set to 0 in case of fetch error
    }
  };

  const fetchMarketData = async () => {
    try {
      const [base, quote] = assetsToTradingPairFromSymbols(selectedSellToken, selectedBuyToken);
      const response = await fetch(`https://api.xcp.io/api/v1/swap/${base}/${quote}`);
      const data = await response.json();
      if (data && data.data) {
        const marketRate = data.data.trading_pair ? parseFloat(data.data.trading_pair.last_trade_price) : 1;
        setSellRate(marketRate);
        setBaseAsset(data.data.base_asset);
        setQuoteAsset(data.data.quote_asset);
        updateSellAmount(sellAmount, marketRate, data.data.base_asset.asset === selectedSellToken);
        setMarketRateAvailable(data.data.trading_pair ? true : false);
      }
    } catch (error) {
      console.error('Failed to fetch market data', error);
      setSellRate(1); // Default to 1 if market rate can't be fetched
      setMarketRateAvailable(false);
    }
  };

  const denormalizeAmount = (amount, divisible) => {
    return divisible ? Math.round(amount * 100000000) : Math.round(amount);
  };

  const updateSellAmount = (sell, rate, isBaseSell) => {
    if (isBaseSell) {
      const newBuyAmount = sell * rate;
      setBuyAmount(newBuyAmount);
    } else {
      const newBuyAmount = sell / rate;
      setBuyAmount(newBuyAmount);
    }
  };

  const updateBuyAmount = (buy, rate, isBaseSell) => {
    if (isBaseSell) {
      const newSellAmount = buy / rate;
      setSellAmount(newSellAmount);
    } else {
      const newSellAmount = buy * rate;
      setSellAmount(newSellAmount);
    }
  };

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSellAmount = parseFloat(e.target.value);
    setSellAmount(newSellAmount);
    updateSellAmount(newSellAmount, sellRate, baseAsset?.symbol === selectedSellToken);
  };

  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBuyAmount = parseFloat(e.target.value);
    setBuyAmount(newBuyAmount);
    updateBuyAmount(newBuyAmount, sellRate, baseAsset?.symbol === selectedSellToken);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setSellRate(newRate);
    updateSellAmount(sellAmount, newRate, baseAsset?.symbol === selectedSellToken);
  };

  const handleFlip = () => {
    setIsFlipping(true); // Disable the button during flip
    setSelectedSellToken(selectedBuyToken);
    setSelectedBuyToken(selectedSellToken);

    setBuyAmount(sellAmount);
    setSellAmount(buyAmount);
    setTimeout(() => setIsFlipping(false), 500); // Re-enable after a brief delay
  };

  const openModalForTokenSelection = (type: 'sell' | 'buy') => {
    setSelectedTokenFor(type);
    setIsOpen(true);
  };

  const handleTokenSelection = (token: string) => {
    if (selectedTokenFor === 'sell') {
      setSelectedSellToken(token);
    } else if (selectedTokenFor === 'buy') {
      setSelectedBuyToken(token);
    }
    setIsOpen(false);
  };

  const handleSetSellAmountToBalance = () => {
    if (address) {
      setSellAmount(balance);
      updateSellAmount(balance, sellRate, baseAsset?.symbol === selectedSellToken);
    } else {
      setSellAmount(0);
    }
  };

  const handleSetBuyAmountToBalance = () => {
    if (address) {
      setBuyAmount(buyBalance);
      updateBuyAmount(buyBalance, sellRate, baseAsset?.symbol === selectedSellToken);
    } else {
      setBuyAmount(0);
    }
  };

  const resetToMarketRate = () => {
    fetchMarketData();
  };

  const toggleCustomExpiry = () => {
    if (isCustomExpiry) {
      setExpiry('8064');
    } else {
      setCustomExpiry(expiry);
    }
    setIsCustomExpiry(!isCustomExpiry);
  };

  const handleCustomExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(8064, parseInt(e.target.value)));
    setCustomExpiry(value.toString());
  };

  const getIcon = () => {
    return quoteAsset ? quoteAsset.symbol : selectedBuyToken;
  };

  const getActionVerb = () => {
    return baseAsset && baseAsset.symbol === selectedSellToken ? 'Sell' : 'Buy';
  };

  const composeOrder = async () => {
    let normalizedGiveAmount;
    let normalizedGetAmount;
    let giveAsset;
    let getAsset;

    if (baseAsset?.symbol === selectedSellToken) {
        // If the sell token is the base asset
        normalizedGiveAmount = denormalizeAmount(sellAmount, baseAsset?.divisible);
        normalizedGetAmount = denormalizeAmount(buyAmount, quoteAsset?.divisible);
        giveAsset = selectedSellToken;
        getAsset = selectedBuyToken;
    } else {
        // If the sell token is the quote asset
        normalizedGiveAmount = denormalizeAmount(sellAmount, quoteAsset?.divisible);
        normalizedGetAmount = denormalizeAmount(buyAmount, baseAsset?.divisible);
        giveAsset = selectedSellToken;
        getAsset = selectedBuyToken;
    }

    // Define the fee_required parameter
    const feeRequired = selectedBuyToken === 'BTC' ? 100 : 0; // Adjust the value based on your needs

    const response = await fetch(`https://api.counterparty.info/v2/addresses/${address}/compose/order?give_asset=${selectedSellToken}&give_quantity=${normalizedSellAmount}&get_asset=${selectedBuyToken}&get_quantity=${normalizedBuyAmount}&expiration=${expiry}&fee_required=${feeRequired}`, {
      method: 'GET',
    });

    const result = await response.json();
    console.log(result); // Handle the response or errors accordingly
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 font-semibold">You&apos;re Selling</label>
            <span className="text-gray-500 cursor-pointer" onClick={handleSetSellAmountToBalance}>
              {balance} {selectedSellToken}
            </span>
          </div>
          <div className="flex items-center bg-gray-200 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500">
            <button
              onClick={() => openModalForTokenSelection('sell')}
              className="flex items-center bg-transparent focus:outline-none mr-2"
            >
              <img src={`http://api.xcp.io/img/icon/${selectedSellToken}`} alt={selectedSellToken} className="size-6 mr-2" /> 
              <span className="font-medium">{selectedSellToken}</span>
              <span className="ml-2"><ChevronDownIcon className="size-5" /></span>
            </button>
            <input
              type="number"
              min={baseAsset?.divisible ? "0.00000001" : "1"}
              max={baseAsset?.supply || "1000000000"}
              step={baseAsset?.divisible ? "0.00000001" : "1"}
              className="flex-1 text-right font-medium text-lg bg-transparent focus:outline-none focus:ring-0 focus:border-transparent border-none appearance-none"
              value={sellAmount}
              onChange={handleSellAmountChange}
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-4 flex items-start space-x-4">
            <div className="w-3/5">
              <div className="flex items-center justify-between">
                <label className="block text-gray-700 text-sm font-medium mb-1">{getActionVerb()} {baseAsset?.symbol} at rate</label>
                {marketRateAvailable && (
                  <a href="#" onClick={resetToMarketRate} className="text-zinc-500 text-xs font-medium mb-1">Market Rate</a>
                )}
              </div>
              <div className="flex items-center bg-gray-200 rounded-md p-2">
                <input
                  type="number"
                  min="0.00000001"
                  className="flex-1 font-medium text-right bg-transparent focus:outline-none focus:ring-0 focus:border-transparent border-none appearance-none h-10"
                  value={sellRate.toFixed(10)}
                  onChange={handleRateChange}
                />
                <span className="text-gray-700 flex items-center w-6 mr-2">
                  <img src={`http://api.xcp.io/img/icon/${getIcon()}`} alt={getIcon()} className="size-5" /> 
                </span>
              </div>
            </div>
            <div className="w-2/5">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-700 text-sm font-medium">Expiration</label>
                <button onClick={toggleCustomExpiry} className="ml-2 focus:outline-none">
                  <Cog6ToothIcon className="size-4 text-zinc-500" />
                </button>
              </div>
              <div className="flex items-center bg-gray-200 rounded-md p-2">
                {isCustomExpiry ? (
                  <input
                    type="number"
                    min="1"
                    max="8064"
                    className="block w-full bg-transparent focus:outline-none focus:ring-0 focus:border-transparent border-none appearance-none h-10"
                    value={customExpiry}
                    onChange={handleCustomExpiryChange}
                    placeholder="Custom"
                  />
                ) : (
                  <select
                    className="block w-full bg-transparent focus:outline-none focus:ring-0 focus:border-transparent border-none appearance-none h-10"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  >
                    <option value="8064">2 Months</option>
                    <option value="4032">1 Month</option>
                    <option value="1008">1 Week</option>
                    <option value="144">1 Day</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleFlip} color={'light'} className="cursor-pointer" disabled={isFlipping}>
            <ArrowsUpDownIcon className="w-6 h-6 text-gray-700" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 font-semibold">You&apos;re Buying</label>
            <span className="text-gray-500 cursor-pointer" onClick={handleSetBuyAmountToBalance}>
              {buyBalance} {selectedBuyToken}
            </span>
          </div>
          <div className="flex items-center bg-gray-200 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500">
            <button
              onClick={() => openModalForTokenSelection('buy')}
              className="flex items-center bg-transparent focus:outline-none mr-2"
            >
              <img src={`http://api.xcp.io/img/icon/${selectedBuyToken}`} alt={selectedBuyToken} className="size-6 mr-2" /> 
              <span className="font-medium">{selectedBuyToken}</span>
              <span className="ml-2"><ChevronDownIcon className="size-5" /></span>
            </button>
            <input
              type="number"
              min={quoteAsset?.divisible ? "0.00000001" : "1"}
              max={quoteAsset?.supply || "1000000000"}
              step={quoteAsset?.divisible ? "0.00000001" : "1"}
              className="flex-1 text-right font-medium text-lg bg-transparent focus:outline-none focus:ring-0 focus:border-transparent border-none appearance-none"
              value={buyAmount}
              onChange={handleBuyAmountChange}
            />
          </div>
        </div>

        <div className="text-right text-gray-600">
          <p>Platform fee: <span className="text-green-600">0.10%</span></p>
        </div>

        <button className="mt-4 p-3 bg-blue-500 text-white rounded-md w-full" onClick={composeOrder}>Compose Order</button>
      </div>

      <Dialog size="lg" open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>Select a token</DialogTitle>
        <DialogBody>
          <input
            type="text"
            placeholder="Search name or paste address"
            className="mb-4 w-full p-2 bg-gray-200 rounded-md"
          />
          <div className="space-y-2">
            {tokens.map((token) => (
              <Button
                key={token}
                color="light"
                onClick={() => handleTokenSelection(token)}
                className="flex items-center cursor-pointer bg-transparent focus:outline-none"
              >
                <img src={`http://api.xcp.io/img/icon/${token}`} alt={token} className="size-5" />
                <span className="font-medium">{token}</span>
              </Button>
            ))}
          </div>
          <div className="mt-4 text-gray-500">Search results will appear here...</div>
        </DialogBody>
        <DialogActions>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full p-2 text-center bg-gray-300 rounded-md"
          >
            Cancel
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TradePage;
