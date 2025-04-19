import { ethers } from "ethers";
require("dotenv").config();
import tokenAddress from "./Inputs/tokenAddress.json";
import addressList from "./Inputs/addressList.json";

const provider = new ethers.WebSocketProvider(
  process.env.ALCHEMY_API_KEY as string
);
const token = tokenAddress.tokenAddress;
const tokenABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const monitorAddresses = new Set(addressList.addressess);
const tokenContract = new ethers.Contract(token, tokenABI, provider);

console.log(`Monitoring ${token}`);

tokenContract.on("Transfer", async (from, to, value, event) => {
  if (monitorAddresses.has(from) || monitorAddresses.has(to)) {
    const amount = ethers.formatUnits(value, 6); // Adjust decimals as needed

    const isToContract = await isContract(to);
    if (value > ethers.parseUnits("100", 6) && !isToContract) {
      const timestamp = new Date().toLocaleString();

      console.log(`\nToken Transfer Detected at ${timestamp}`);
      console.log(`From   : ${from}`);
      console.log(`To     : ${to}`);
      console.log(`Amount : ${amount}`);
      console.log(`TxHash : ${event.log.transactionHash}`);
      console.log("\nListening........\n");
    }
  }
});

async function isContract(to: string) {
  const code = await provider.getCode(to);
  if (code.length == 2) {
    return false;
  }
  return true;
}
