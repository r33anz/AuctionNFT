import { ethers } from 'ethers';
import {abiAuction} from '../abiContracts/abiAuctionContract.js';
import { getProvider } from '../abiContracts/provider.js';

class AuctionContract {
    constructor() {
        const contractAddress = import.meta.env.VITE_CONTRACT_SUBASTA;
        this.address = contractAddress;
        if (!contractAddress) {
          throw new Error("VITE_CONTRACT_SUBASTA is not defined in the environment variables.");
        }
    
        this.provider = getProvider();
        this.contract = new ethers.Contract(contractAddress, abiAuction, this.provider);
    }

    async connectWithSigner() {
        if (!window.ethereum) throw new Error("MetaMask no está disponible");

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await browserProvider.getSigner();

        this.contract = new ethers.Contract(
            import.meta.env.VITE_CONTRACT_SUBASTA,
            abiAuction,
            this.signer
        );
    }

    async createAuction(initialValue, nameItem, descriptionItem, durationTime, tokenId) {
        return await this.contract.startAuction(
            initialValue,
            nameItem,
            descriptionItem,
            durationTime,
            tokenId
        );
    }

    async getAddress() {
        return this.address;
    }

    async getStatus(){
        const currentBidder = await this.contract.currentBidder();
        const currentOffer = await this.contract.currentOffer();
        const itemId = await this.contract.tokenId();
        const isEnded = await this.contract.isEnded();
        const isActive = await this.contract.isActive();
        const item = await this.contract.item();

        const expiresAtTimestamp = Number(item.expireAt); // Convert BigInt to number
        const expiresAtDate = new Date(expiresAtTimestamp * 1000); // Convert seconds to milliseconds
        
        const options = {
            timeZone: "America/Caracas", // UTC-4
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true, // Use 12-hour format
        };
        const readableDate = expiresAtDate.toLocaleString("en-US", options);

        
        const status = {
            currentBidder: currentBidder,
            currentOffer: ethers.formatEther(currentOffer),
            itemId: itemId,
            isEnded: isEnded,
            isActive: isActive,
            item: {
                name: item[0],
                description: item[1],
                expireAt: readableDate, 
            }
        };

        return status;
    }

    async endAuction() {
        return await this.contract.endAuction();
    }
}

export default new AuctionContract();