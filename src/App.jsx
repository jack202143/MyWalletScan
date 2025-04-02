// src/config/networks.js
export const networks = {
  ethereum: {
    chainId: 1,
    name: "Ethereum",
    rpc.Url: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    nativeCurrency: {
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: "https://etherscan.io",
  },
  monad: {
    chainId: 420, // 假设值，需替换为 Monad 官方提供的实际 chainId
    name: "Monad",
    rpcUrl: "https://testnet-rpc.monad.xyz", // 假设的测试网 RPC，需确认
    nativeCurrency: {
      symbol: "MONAD", // 假设值，需确认
      decimals: 18,
    },
    blockExplorer: "https://explorer.monad.xyz", // 假设值，需确认
  },
};

export default networks;
