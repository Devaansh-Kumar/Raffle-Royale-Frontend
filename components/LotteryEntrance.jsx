import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

const LotteryEntrance = () => {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");

  const dispatch = useNotification();

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  async function updateUI() {
    const entranceFeeFromCall = (await getEntranceFee()).toString();
    const numPlayersFromCall = (await getNumberOfPlayers()).toString();
    const recentWinnerFromCall = await getRecentWinner();
    setEntranceFee(entranceFeeFromCall);
    setNumberOfPlayers(numPlayersFromCall);
    setRecentWinner(recentWinnerFromCall);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNewNotification(tx);
    updateUI();
  };

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete",
      title: "Tx Notification",
      position: "topR",
      //icon: "bell"
    });
  };

  return (
    <div className="p-5 flex flex-col items-center text-lg">
      <div className="text-3xl font-bold">
        Welcome to Raffle Royale, where everyone is a Winner!!
      </div>
      <br />
      <img src="raffle.jpg" style={{ height: 300 }} />
      {raffleAddress ? (
        <div className="flex justify-evenly flex-col items-center h-60">
          <div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
              onClick={async () => {
                await enterRaffle({
                  onSuccess: handleSuccess,
                  onError: (error) => {
                    console.log(error);
                  },
                });
              }}
              disabled={isLoading || isFetching}
            >
              {isLoading || isFetching ? (
                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
              ) : (
                <div>Enter Raffle</div>
              )}
            </button>
          </div>
          <div className="flex justify-evenly flex-col items-center">
            <div>
              Entrance Fee is only{" "}
              <span className="text-blue-700 hover:text-blue-500">
                {ethers.utils.formatUnits(entranceFee, "ether")} ETH
              </span>
            </div>
            <div>
              The current number of players are:{" "}
              <span className="text-blue-700 hover:text-blue-500">
                {numberOfPlayers}
              </span>
            </div>
            <div>
              Amount of Raffle Money you can win right now:{" "}
              <span className="text-blue-700 hover:text-blue-500">
                {ethers.utils.formatUnits(entranceFee, "ether") *
                  numberOfPlayers}{" "}
                ETH !!
              </span>
            </div>
            <div>
              The most previous winner was:{" "}
              <span className="text-blue-700 hover:text-blue-500">
                {recentWinner}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div> No Raffle Address detected</div>
      )}
    </div>
  );
};

export default LotteryEntrance;
