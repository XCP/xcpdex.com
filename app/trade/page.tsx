"use client";

import { useState } from 'react';
import { ArrowsUpDownIcon, ChevronDownIcon } from '@heroicons/react/16/solid';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/dialog';

const TradePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTokenFor, setSelectedTokenFor] = useState<'sell' | 'buy' | null>(null);
  const [selectedSellToken, setSelectedSellToken] = useState('ETH');
  const [selectedBuyToken, setSelectedBuyToken] = useState('USDC');
  const [sellAmount, setSellAmount] = useState(1);
  const [buyAmount, setBuyAmount] = useState(140.17);
  const [sellRate, setSellRate] = useState(140.690073556); // Example rate
  const [expiry, setExpiry] = useState('Never');

  const tokens = ['BTC', 'XCP', 'PEPECASH', 'BITCORN', 'BITCRYSTALS', 'DANKMEMECASH'];

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSellAmount = parseFloat(e.target.value);
    setSellAmount(newSellAmount);
    setBuyAmount(newSellAmount * sellRate);
  };

  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBuyAmount = parseFloat(e.target.value);
    setBuyAmount(newBuyAmount);
    setSellAmount(newBuyAmount / sellRate);
  };

  const handleFlip = () => {
    setSelectedSellToken(selectedBuyToken);
    setSelectedBuyToken(selectedSellToken);
    const tempSellAmount = sellAmount;
    setSellAmount(buyAmount);
    setBuyAmount(tempSellAmount);
    setSellRate(1 / sellRate); // Inverse the rate when flipping
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 font-semibold">You&apos;re Selling</label>
            <span className="text-gray-500">0 {selectedSellToken}</span>
          </div>
          <div className="flex items-center bg-gray-200 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500">
            <button
              onClick={() => openModalForTokenSelection('sell')}
              className="flex items-center bg-transparent focus:outline-none mr-2"
            >
              <img src={`http://api.xcp.io/img/icon/${selectedSellToken}`} alt={selectedSellToken} className="w-6 h-6 mr-2" /> 
              <span className="font-medium">{selectedSellToken}</span>
              <span className="ml-2"><ChevronDownIcon className="size-5" /></span>
            </button>
            <input
              type="text"
              className="flex-1 text-right font-medium text-lg bg-transparent focus:outline-none focus:ring-0 focus:border-transparent border-none appearance-none"
              value={sellAmount}
              onChange={handleSellAmountChange}
            />
          </div>
          <div className="text-gray-500 mt-1 text-right">${(sellAmount * 140.17).toFixed(2)}</div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 mr-2">
            <label className="block text-gray-700 font-semibold">Sell at rate</label>
            <div className="flex items-center bg-gray-200 rounded-md p-2">
              <input
                type="text"
                className="flex-1 text-right bg-transparent focus:outline-none focus:ring-0 focus:border-transparent border-none appearance-none"
                value={sellRate.toFixed(10)}
                onChange={(e) => setSellRate(parseFloat(e.target.value))}
              />
              <span className="ml-2 text-gray-700">{selectedBuyToken}</span>
            </div>
            <div className="text-gray-500 mt-1 text-right">≈ ${(sellRate).toFixed(2)}</div>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold">Expiry</label>
            <select
              className="block w-full p-2 bg-gray-200 rounded-md focus:outline-none"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            >
              <option value="Never">Never</option>
              <option value="1 Day">1 Day</option>
              <option value="1 Week">1 Week</option>
              <option value="1 Month">1 Month</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <Button onClick={handleFlip} color={'light'} className="cursor-pointer">
            <ArrowsUpDownIcon className="w-6 h-6 text-gray-700" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 font-semibold">You&apos;re Buying</label>
            <span className="text-gray-500">0 {selectedBuyToken}</span>
          </div>
          <div className="flex items-center bg-gray-200 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500">
            <button
              onClick={() => openModalForTokenSelection('buy')}
              className="flex items-center bg-transparent focus:outline-none mr-2"
            >
              <img src={`http://api.xcp.io/img/icon/${selectedBuyToken}`} alt={selectedBuyToken} className="w-6 h-6 mr-2" /> 
              <span className="font-medium">{selectedBuyToken}</span>
              <span className="ml-2"><ChevronDownIcon className="size-5" /></span>
            </button>
            <input
              type="text"
              className="flex-1 text-right font-medium text-lg bg-transparent focus:outline-none focus:ring-0 focus:border-transparent border-none appearance-none"
              value={buyAmount}
              onChange={handleBuyAmountChange}
            />
          </div>
          <div className="text-gray-500 mt-1 text-right">${(buyAmount).toFixed(2)}</div>
        </div>

        <div className="text-right text-gray-600">
          <p>Platform fee: <span className="text-green-600">0.10%</span></p>
        </div>

        <button className="mt-4 p-3 bg-blue-500 text-white rounded-md w-full">Connect Wallet</button>
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
