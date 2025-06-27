const hre = require("hardhat");
const { Wallet, JsonRpcProvider } = require("ethers");
require("dotenv").config();

async function main() {
  try {
    // Setup: RPC provider y wallet
    const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC);
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

    const NFT_CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS_NFT; // Reemplaza con la dirección del contrato NFT
    
    // Obtener el factory del contrato Subasta
    const SubastaFactory = await hre.ethers.getContractFactory("Subasta", wallet);

    // Desplegar contrato con la dirección del NFT
    console.log("📦 Deploying contract...");
    const subastaContract = await SubastaFactory.deploy(NFT_CONTRACT_ADDRESS);
    await subastaContract.waitForDeployment();

    const contractAddress = await subastaContract.getAddress();
    console.log("✅ Subasta Contract deployed successfully!");
    console.log(`📍 Contract address: ${contractAddress}`);
    console.log(`🔗 Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);

    // Verificar información básica del contrato
    try {
      const beneficiary = await subastaContract.beneficiary();
      const nftContract = await subastaContract.nftContract();
      const isActive = await subastaContract.isActive();
      const isEnded = await subastaContract.isEnded();

      console.log("\n📊 Contract Information:");
      console.log(`   Beneficiary: ${beneficiary}`);
      console.log(`   NFT Contract: ${nftContract}`);
      console.log(`   Is Active: ${isActive}`);
      console.log(`   Is Ended: ${isEnded}`);

      // Verificar que el beneficiario sea el deployer
      if (beneficiary.toLowerCase() === wallet.address.toLowerCase()) {
        console.log("✅ Beneficiary correctly set to deployer");
      } else {
        console.log("⚠️ Warning: Beneficiary is not the deployer");
      }

    } catch (error) {
      console.log("⚠️ Could not fetch contract details:", error.message);
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.data) {
      console.error(`Error data: ${error.data}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Error deploying:", error);
  process.exit(1);
});