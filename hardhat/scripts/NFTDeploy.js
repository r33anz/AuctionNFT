const hre = require("hardhat");
const { Wallet, JsonRpcProvider } = require("ethers");

require("dotenv").config();

async function main() {
  try {
    // Setup: RPC provider y wallet
    const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC);
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    
    // Obtener el factory del contrato NFT
    const NFTFactory = await hre.ethers.getContractFactory("NFT", wallet);
    
    // Desplegar contrato
    const nftContract = await NFTFactory.deploy();
    await nftContract.waitForDeployment();
    
    const contractAddress = await nftContract.getAddress();
    console.log("✅ NFT Contract deployed successfully!");
    console.log(`📍 Contract address: ${contractAddress}`);
    console.log(`🔗 Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    
    // Verificar información básica del contrato
    try {
      const name = await nftContract.name();
      const symbol = await nftContract.symbol();
      const owner = await nftContract.owner();
      const totalTokens = await nftContract.getTotalTokens();
      
      console.log("\n📊 Contract Information:");
      console.log(`   Name: ${name}`);
      console.log(`   Symbol: ${symbol}`);
      console.log(`   Owner: ${owner}`);
      console.log(`   Total Tokens: ${totalTokens}`);
      
    } catch (error) {
      console.log("⚠️ Could not fetch contract details:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
    console.error("❌ Error deploying:", error);
    process.exit(1);
  });