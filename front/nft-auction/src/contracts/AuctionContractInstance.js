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
        //await this.connectWithSigner()
        const status = await this.contract.item();
        return status;
    }
}

export default new AuctionContract();