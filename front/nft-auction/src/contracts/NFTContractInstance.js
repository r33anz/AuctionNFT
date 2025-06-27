import { ethers } from 'ethers';
import { abiNFT } from '../abiContracts/abiNFTContracts.js';
import { getProvider } from '../abiContracts/provider.js';

class NFTContract {
  constructor() {
    const contractAddress = import.meta.env.VITE_CONTRACT_NFT; // Use Vite's environment variable system
    if (!contractAddress) {
      throw new Error("VITE_CONTRACT_NFT is not defined in the environment variables.");
    }

    this.provider = getProvider();
    this.contract = new ethers.Contract(contractAddress, abiNFT, this.provider);
  }

  async connectWithSigner() {
    if (!window.ethereum) throw new Error("MetaMask no está disponible")

    const browserProvider = new ethers.BrowserProvider(window.ethereum)
    this.signer = await browserProvider.getSigner()

    this.contract = new ethers.Contract(
      import.meta.env.VITE_CONTRACT_NFT,
      abiNFT,
      this.signer
    )
  }

  async mintNFT(jsonHash, name, description, imageHash) {
    return await this.contract.mintNFT(jsonHash, name, description, imageHash)
  }

  async getTotalNFTs() {
    try {
      const totalNFTs = await this.contract.getTotalTokens()
      return Number(totalNFTs);
    } catch (error) {
      console.error("Error fetching total NFTs:", error);
      throw error.message || "Error fetching total NFTs.";
    }
  }

  async getTokenMetadata(tokenId) {
    try {
      
      const metadata = await this.contract.getTokenMetadata(BigInt(tokenId)); // Convert to BigInt
      
      if (!metadata.exists) {
        console.warn(`Token ${tokenId} does not exist.`);
        return null;
      }
      
      return {
        id: Number(tokenId), // Convert back to Number for React
        name: metadata.name,
        description: metadata.description,
        image: metadata.hashImage,
        tokenURI: metadata.fullTokenURI,
        owner: metadata.tokenOwner,
        createdAt: new Date(Number(metadata.createdAt) * 1000), // Convert to Number
        exists: metadata.exists
      };
    } catch (error) {
      console.error(`Error fetching metadata for token ${tokenId}:`, error);
      return null;
    }
  }

  async getAllNFTs() {
    const totalTokens = await this.getTotalTokens();
    if (totalTokens === 0) return [];

    const nfts = [];
    for (let i = 1; i <= totalTokens; i++) {
      const nft = await this.getTokenMetadata(i);
      if (nft) {
        nfts.push(nft);
      }
    }
    return nfts;
  }

  async isOwnerConnected() {
    const connected = await this.signer.getAddress()
    const owner = await this.contract.owner()
    return connected?.toLowerCase() === owner.toLowerCase()
  }

  async ownerOf(tokenId) {
    try {
      const owner = await this.contract.ownerOf(BigInt(tokenId)); // Convert to BigInt
      return owner;
    } catch (error) {
      console.error(`Error fetching owner for token ${tokenId}:`, error);
      throw error.message || "Error fetching owner.";
    }
  }

  async  getApproved(params) {
    try {
      const approvedAddress = await this.contract.getApproved(BigInt(params)); // Convert to BigInt
      return approvedAddress;
    } catch (error) {
      console.error(`Error fetching approved address for token ${params}:`, error);
      throw error.message || "Error fetching approved address.";
    }
  }

  async approve(to, tokenId) {
    try {
      if (!this.signer) {
        await this.connectWithSigner();
      }
      const tx = await this.contract.approve(to, BigInt(tokenId)); // Convert to BigInt
      await tx.wait();
      console.log("Aprobación completada:", tx.hash);
      return tx;
    } catch (error) {
      console.error(`Error approving token ${tokenId} to ${to}:`, error);
      throw error.message || "Error approving token.";
    }
  }
}

export default new NFTContract();