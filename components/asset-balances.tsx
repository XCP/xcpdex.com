"use client";

import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { ArrowPathIcon, FireIcon, UserIcon } from '@heroicons/react/16/solid';
import { formatAmount } from '@/utils/formatAmount';

// Define the AssetInfo interface
interface AssetInfo {
  asset_longname: string | null;
  description: string;
  issuer: string | null;
  owner: string | null;
  divisible: boolean;
  locked: boolean;
}

// Define the Balance interface to match the API response
interface Balance {
  address: string;
  asset: string;
  quantity: number;
  asset_info: AssetInfo;
  quantity_normalized: any;
}

// Define the response structure
interface AssetBalancesResponse {
  result: Balance[];
  result_count: number;
}

// Function to fetch asset balances
async function fetchAssetBalances(asset: string): Promise<{ balances: Balance[], count: number }> {
  const res = await fetch(`https://api.counterparty.info/v2/assets/${asset}/balances?limit=30&sort=quantity:desc&verbose=true`);
  const data: AssetBalancesResponse = await res.json();
  return { balances: data.result, count: data.result_count };
}

interface AssetBalancesProps {
  asset: string | undefined;
  issued: number;
  setHoldersCount: (count: number) => void;
}

// Hardcoded array of burn addresses
const BURN_ADDRESSES = [
  "1111111111111111111114oLvT2",
  "11ParticipantsXXXXXXXXXXXXXUGmPx6",
  "123AnditsGone111111111111111Ymiao1",
  "191mMadYoureMadxxxxxxxxxxxxxvwA4Up",
  "1AMpauLXXXXXXXXXXXXXXXXXXXWzywCd6j",
  "1AgeofChainsSeries1Burnxxxy1xR3Ao",
  "1AsseticBbXXXXXXXXXXXXXXXXXXbeMmNH",
  "1AsseticJLJLJLXXXXXXXXXXXXXXU87kKM",
  "1AsseticKanaddahXXXXXXXXXXXXRntPiE",
  "1AsseticXXXXXXXXXXXXXXXXXXXXY69xbC",
  "1AsseticooakosiMoXXXXXXXXXXXVWtCYm",
  "1AsswhoisitXXXXXXXXXXXXXXXXXY2F4pu",
  "1BURNFoWXXXXXXXXXXXXXXXXXXXY5LRms",
  "1BURNSogXXXXXXXXXXXXXXXXXXXXW3ny2Y",
  "1BURNTSH1RTxxxxxxxxxxxxxxxxuckhAY",
  "1BURNXXXXXXXXXXXXXXXXXXXXXXXTVanmh",
  "1BURNmentorsxxxxxxxxxxxxxxxwUtLJh",
  "1BitSupraBurnProofXXXXXXXXXXUqAPsu",
  "1BitcoinEaterAddressDontSend8MUo1T",
  "1BitcoinEaterAddressDontSendf59kuE",
  "1BitcornCropsMuseumAddressy149ZDr",
  "1BitcornSubmissionFeeAddressgL5Xg",
  "1BoJxKoKUSAixKAiToRixxxxxxwz1Pa5w",
  "1BurnFakePepexxxxxxxxxxxxxxzo7tqD",
  "1BurnPenisiumGrowPenisiumxxwGJvsx",
  "1BurnPepexxxxxxxxxxxxxxxxxxxAK33R",
  "1BurnRustxxxxxxxxxxxxxxxxxxzhjnHj",
  "1BurnSockxxxxxxxxxxxxxxxxxxwLPxbM",
  "1BurnXXXXXXXXXXXXXXXXXXXXXXXXekdRL",
  "1Burned4ReissuanceSwapChainzRe7Xq",
  "1Burningxcpassetsxxxxxxxxxy3ee2wH",
  "1BurnxxxxxxxxxxxxxxxxxxxxxxxLsYYK",
  "1ByeschoepepeXXXXXXXXXXXXXXXcpHGww",
  "1CKGAMEBURNiTALLxxxxxxxxxxxxeLDrH",
  "1CNTSMKxxxxxxxxxxxxxxxxxxxxtSetKh",
  "1CRiNGEXXXXXXXXXXXXXXXXXXXXXWTvJJP",
  "1ChancecoinXXXXXXXXXXXXXXXXXZELUFD",
  "1CoinandpeaceburnaddressXXWwTTyPw",
  "1CommonCashVipxxxxxxxxxxxxy1jvR1F",
  "1CommonCashxxxxxxxxxxxxxxxxzXpSRv",
  "1CornHawksxxxxxxxxxxxxxxxxxym3Kin",
  "1CounterpartyXXXXXXXXXXXXXXXUWLpVr",
  "1CryptoArtMuseumProperty8887NmZWB",
  "1CryptoLifeDotNetBurnAddrXXXSdVx52",
  "1DALLExxxxxxxxxxxxxxxxxxxxy35pERT",
  "1DARKCLAMXF1NALXBURNXXXXXXXXVcPtLv",
  "1DARKCLAMxBURNXXXXXXXXXXXXXXVvbpkg",
  "1DARKCLAMxDooGXXXXXXXXXXXXXXZPbYip",
  "1DJasanyanxxxxxxxxxxxxxxxxy1uERgj",
  "1DeadBitcoinxxxxxxxxxxxxxxy3btNBi",
  "1DiGEST111111111111111114xxyPASCm",
  "1DiGESTA111111111111111114y3rhonX",
  "1FauxSoGsBURNxxxxxxxxxxxxxxzme7me",
  "1FractaLPepeTESTxxxxxxxxxxxuRn48D",
  "1GEMZBURNXXXXXXXXXXXXXXXXXXXVUKFt4",
  "1GenesisxxxxxxxxxxxxxxxxxxxuRkNpc",
  "1JGBcoinKokusaiKaitorixxxxxD2iTTp",
  "1JesseFuckedUpxxxxxxxxxxxxxxvk6ma",
  "1JesusChristTheSonofGodxxxx3MHcGY",
  "1JohnViLLARchiguireitorxxxxwhsz7P",
  "1JoinTheFLoCKxxxxxxxxxxxxxy3kQq6m",
  "1JoinTheFLooNxxxxxxxxxxxxxxyfLnvM",
  "1KevineroBurnxxxxxxxxxxxxxxzbrvmF",
  "1LTBBURNxxxxxxxxxxxxxxxxxxxxQiaRZ",
  "1MAXVoLUMEWWWWWWWWWWWWWWWWWRhkLVK",
  "1MB4EVERoooooooooooooooooooos9V3t5",
  "1MafiaWarsGameBurnAddressxy1WbzYg",
  "1MonapartyMMMMMMMMMMMMMMMMMQ3QJNm",
  "1MouLaBurnXXXXXXXXXXXXXXXXXWcixDo",
  "1MouLaBurnxxxxxxxxxxxxxxxxxxEXzj4",
  "1NEXUSvoid6666666666666666666dS2d",
  "1NPCReprogrammingxxxxxxxxxxtqVgmX",
  "1NightStaLksxxxxxxxxxxxxxxxxcZVzv",
  "1PLiPBuRNxxxxxxxxxxxxxxxxxxzEyg27",
  "1PaPeToBurnDatShtxxxxxxxxxxtNVzkz",
  "1PhockheadsBurnAddressxxxxxtEmomy",
  "1RaribLePEPEPARTYxxxxxxxxxy1a4EHk",
  "1SEAGULLSxxxxxxxxxxxxxxxxxxtqic4p",
  "1STUNKyourMUMitBURNSowFUCKxztthDT",
  "1Satanxxxxxxxxxxxxxxxxxxxxxw4d9KE",
  "1SatoshiRoundtab1exxxxxxxxxtJidRK",
  "1SwarmxxxxxxxxxxxxxxxxxxxxxwwCyWx",
  "1TestxxxxxxxxxxxxxxxxxxxxxxzoXNkw",
  "1ToniLaneCASSERLYYYYYYYYYYYUCJJnM",
  "1Trigburnxxxxxxxxxxxxxxxxxxw5X1QR",
  "1WatchYourBTCBurnXxxxxxxxxxrwkNKW",
  "1WatchYourBTCBurnxxxxxxxxxxunS7dA",
  "1WhatissynereoXXXXXXXXXXXXX4p2rSe",
  "1XCPtorchFUELLLLLLLLLLLLLLLKofQSA",
  "1barnyardzzzzzzzzzzzzzzzzzzy7XQWp",
  "1bitfinexxxxxxxxxxxxxxxxxxxzjVHxU",
  "1burn11111111111111111111113yQZiQ",
  "1burnxxxxxxxxxxxxxxxxxxxxxxuswneu",
  "1craigxxxxxxxxxxxxxxxxxxxxxsveXGX",
  "1cryptohivexxxxxxxxxxxxxxxxuZjrB6",
  "1editxxxxxxxxxxxxxxxxxxxxxxwKh9EC",
  "1egendaryBurnMagic1o1xxxxxxuKQhK5",
  "1finaxxxxxxxxxxxxxxxxxxxxxxtpcuxf",
  "1haiLLordkekxxxxxxxxxxxxxxxtn8WwC",
  "1hardforkxxxxxxxxxxxxxxxxxxu9iBLr",
  "1hyugaxxxxxxxxxxxxxxxxxxxxxtkbLXZ",
  "1infamousGraveyardRiPzzzzzzyQKytV",
  "1kanoxxxxxxxxxxxxxxxxxxxxxxztz7Sb",
  "1kinoshitaxxxxxxxxxxxxxxxxy27FE4R",
  "1kojixxxxxxxxxxxxxxxxxxxxxy46RA3r",
  "1maxminimumiiiiiiiiiiiiiiiifpPSpJ",
  "1mikehearnxxxxxxxxxxxxxxxxxzxJYCq",
  "1oishixxxxxxxxxxxxxxxxxxxxxxFftCZ",
  "1papetoxxxxxxxxxxxxxxxxxxxy1k8UJQ",
  "1r3xxxxxxxxxxxxxxxxxxxxxxxy44N3ru",
  "1scamSCAMscamXXXXXXXXXXXXXXXYCXxk",
  "1segwitxxxxxxxxxxxxxxxxxxxxxwqcT1",
  "1shadi1aythug1ifexxxxxxxxxxuCqHNS",
  "1shitcoinxxxxxxxxxxxxxxxxxxwY1LYu",
  "1stLiquidPepexxxxxxxxxxxxxxumd9b8",
  "1sugiixxxxxxxxxxxxxxxxxxxxxy8KU3n",
  "1thedaoxxxxxxxxxxxxxxxxxxxy3gNefa",
  "1tokeneconomyxxxxxxxxxxxxxxshrDv5",
  "1wadaxxxxxxxxxxxxxxxxxxxxxy1c6a95",
  "1zakiyamaxxxxxxxxxxxxxxxxxxw7ybLT", 
];

// AssetBalances component
export function AssetBalances({ asset, issued, setHoldersCount }: AssetBalancesProps) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBalances() {
      if (asset) {
        setLoading(true);
        const { balances, count } = await fetchAssetBalances(asset);
        setBalances(balances);
        setResultCount(count);
        setHoldersCount(count);
        setLoading(false);
      }
    }
    loadBalances();
  }, [asset, setHoldersCount]);

  // Function to determine if an address is a burn address
  const isBurnAddress = (address: string): boolean => {
    return BURN_ADDRESSES.includes(address);
  };

  // Function to determine if an address is the issuer or owner
  const getAddressRole = (address: string, assetInfo: AssetInfo): 'issuer' | 'owner' | null => {
    if (address === assetInfo.issuer) return 'issuer';
    if (address === assetInfo.owner) return 'owner';
    return null;
  };

  const balancesSum = balances.reduce((sum, balance) => sum + parseFloat(balance.quantity_normalized), 0);

  return (
    <>
      <h2 className="sr-only">Asset Balances</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin" />
        </div>
      ) : (
        <Table className="table-responsive asset-balances">
          <TableHead>
            <TableRow>
              <TableHeader className="w-14">Rank</TableHeader>
              <TableHeader>Address</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader className="text-right">%</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.length > 0 ? (
              balances.map((balance, index) => {
                const role = getAddressRole(balance.address, balance.asset_info);

                return (
                  <TableRow key={balance.address} href={`/address/${balance.address}`}>
                    <TableCell className="text-zinc-500">#{index + 1}</TableCell>
                    <TableCell className="no-ligatures flex items-center  gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar src={`https://app.xcp.io/img/icon/${asset}`} className="size-6" />
                        <span className="font-medium">
                          {balance.address}
                          {isBurnAddress(balance.address) && (
                            <Badge color="orange" className="flex items-center ml-4">
                              <FireIcon className="size-2 sm:size-3 text-red-500" />
                              Burn
                            </Badge>
                          )}
                          {role && (
                            <Badge color={role === 'issuer' ? 'blue' : 'green'} className="ml-2">
                              <UserIcon className="size-2 sm:size-3" />
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Badge>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatAmount(balance.quantity_normalized)}</TableCell>
                    <TableCell className="text-right">{formatAmount((balance.quantity_normalized / issued) * 100, false, true)}%</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell className="text-center" colSpan={6}>No balances found.</TableCell>
              </TableRow>
            )}
            {resultCount > 30 && (
              <TableRow className="font-bold">
                <TableCell>#31</TableCell>
                <TableCell>Other Addresses</TableCell>
                <TableCell>{formatAmount(issued - balancesSum)}</TableCell>
                <TableCell className="text-right">
                  {formatAmount(((issued - balancesSum) / issued) * 100, false, true)}%
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </>
  );
}

export default AssetBalances;
