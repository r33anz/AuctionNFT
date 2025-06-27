const hre = require("hardhat");
const { Wallet, JsonRpcProvider } = require("ethers");

require("dotenv").config();

async function main() {
  // Setup: RPC provider y wallet
  const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC);
  const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

  // Obtener el factory del contrato (usa Hardhat Runtime Environment)
  const LockFactory = await hre.ethers.getContractFactory("Lock", wallet);

  // Puedes configurar un parámetro si el constructor lo requiere
  const unlockTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hora desde ahora

  // Desplegar contrato
  console.log("Deploying Lock contract...");
  const lockContract = await LockFactory.deploy(unlockTime);
  await lockContract.waitForDeployment();

  console.log("✅ Contract deployed at:", await lockContract.getAddress());
}

main().catch((error) => {
  console.error("❌ Error deploying:", error);
  process.exit(1);
});
